import {
  type Message,
  createDataStreamResponse,
  streamText,
  smoothStream,
  generateText,
  formatDataStreamPart
} from 'ai';

import { auth } from '@/app/(auth)/auth';
import { myProvider } from '@/lib/ai/models';
import { systemPrompt } from '@/lib/ai/prompts';
import { customerSuccessAgent } from '@/lib/agents/customer-success';
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
  updateChat,
} from '@/lib/db/queries';
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from '@/lib/utils';
import {
  incrementUserMessageCount,
  getUserMessageCount,
  MAX_FREE_MESSAGES,
  requiresUserApiKeys
} from '@/lib/db/api-keys';

import { generateTitleFromUserMessage } from '../../actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const {
      id,
      messages,
      selectedChatModel,
      modelId,
    } = await request.json();
    
    console.log('Chat request received:', {
      modelSelected: selectedChatModel,
      messageCount: messages.length,
      lastMessage: messages[messages.length - 1]?.content.slice(0, 50) + '...'
    });

    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userMessage = getMostRecentUserMessage(messages);

    if (!userMessage) {
      return new Response('No user message found', { status: 400 });
    }

    // Increment message count
    incrementUserMessageCount();

    const chat = await getChatById({ id });

    if (!chat) {
      const title = await generateTitleFromUserMessage({ message: userMessage });
      await saveChat({ id, userId: session.user.id, title });
    } else {
      // Comment out these message count checks
      /*
      if (chat.messageCount >= 5) {
        return new Response('Message limit reached. Please fork the repository to continue.', { status: 403 });
      }
      
      // Increment message count
      await updateChat({ id, messageCount: chat.messageCount + 1 });
      */
    }

    await saveMessages({
      messages: [{ ...userMessage, createdAt: new Date(), chatId: id }],
    });

    // Handle the Customer Success Agents separately
    if (selectedChatModel === 'customer-success-agents') {
      try {
        return createDataStreamResponse({
          execute: async (dataStream) => {
            console.log('Starting Customer Success Agent stream');
            
            // Get the most recent user message and pass it to the agent
            const userMessage = getMostRecentUserMessage(messages);
            if (!userMessage) {
              throw new Error('No user message found');
            }

            try {
              // Process the agent response
              const agentResponse = await customerSuccessAgent(userMessage.content, {
                tools: {
                  messages,
                  createDocument: createDocument({ session, dataStream }),
                  updateDocument: updateDocument({ session, dataStream }),
                  requestSuggestions: requestSuggestions({
                    session,
                    dataStream,
                  }),
                }
              });

              // Write the response to the stream
              dataStream.write(formatDataStreamPart('text', agentResponse.content));

              // Write any metadata if available
              if (agentResponse.metadata) {
                if (agentResponse.metadata.reasoning) {
                  dataStream.write(formatDataStreamPart('reasoning', agentResponse.metadata.reasoning));
                }
                
              }

              // Save messages
              if (session.user?.id) {
                try {
                  await saveMessages({
                    messages: [{
                      id: generateUUID(),
                      chatId: id,
                      role: 'assistant',
                      content: agentResponse.content,
                      createdAt: new Date(),
                    }],
                  });
                } catch (error) {
                  console.error('Failed to save chat:', error);
                }
              }
              
              // The stream will be closed automatically when the execute function completes
            } catch (error) {
              console.error('Error processing agent response:', error);
              dataStream.write(formatDataStreamPart('text', 'An error occurred while processing your request.'));
            }
          },
          onError: (error) => {
            console.error('Customer Success Agent error:', error);
            return 'An error occurred with the Customer Success Agent';
          },
        });
      } catch (error) {
        console.error('Customer Success Agent error:', error);
        return new Response('An error occurred with the Customer Success Agent', { status: 500 });
      }
    }

    // For all other models, proceed with the standard processing
    return createDataStreamResponse({
      execute: (dataStream) => {
        console.log('Starting stream with model:', selectedChatModel);
        
        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: systemPrompt({ selectedChatModel }),
          messages,
          maxSteps: 5,
          experimental_activeTools:
            selectedChatModel === 'chat-model-reasoning'
              ? []
              : [
                  'createDocument',
                  'updateDocument',
                  'requestSuggestions',
                ],
          experimental_transform: smoothStream({ chunking: 'word' }),
          experimental_generateMessageId: generateUUID,
          tools: {
            createDocument: createDocument({ session, dataStream }),
            updateDocument: updateDocument({ session, dataStream }),
            requestSuggestions: requestSuggestions({
              session,
              dataStream,
            }),
          },
          onFinish: async ({ response, reasoning }) => {
            if (session.user?.id) {
              try {
                const sanitizedResponseMessages = sanitizeResponseMessages({
                  messages: response.messages,
                  reasoning,
                });

                await saveMessages({
                  messages: sanitizedResponseMessages.map((message) => {
                    return {
                      id: message.id,
                      chatId: id,
                      role: message.role,
                      content: message.content,
                      createdAt: new Date(),
                    };
                  }),
                });
              } catch (error) {
                console.error('Failed to save chat');
              }
            }
          },
          experimental_telemetry: {
            isEnabled: true,
            functionId: 'stream-text',
          },
        });

        console.log('Stream setup complete');
        
        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
      },
      onError: (error) => {
        console.error('Stream error:', error);
        return 'Oops, an error occurred!';
      },
    });
  } catch (error) {
    console.error('Route error:', error);
    return new Response('An error occurred', { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}