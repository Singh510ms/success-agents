import { motion } from 'framer-motion';
import Link from 'next/link';

import { MessageIcon, VercelIcon } from './icons';

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-8 leading-relaxed text-center max-w-xl">
        <p className="flex flex-row justify-center gap-4 items-center">
          <VercelIcon size={32} />
          <span>+</span>
          <MessageIcon size={32} />
        </p>
        <p>
          This is a{' '}
          <span className="font-medium">
            Customer Success Agentic System
          </span>{' '}
          proof of concept built with Next.js and the AI SDK by Vercel. It demonstrates
          how specialized AI agents can enhance customer success operations through
          intelligent conversation. It also includes the ability to engage in everyday conversations with OpenAI and Anthropic models.
        </p>
        <p>
          The Customer Success Agentic system features multiple specialized agents including {' '}
          <code className="rounded-md bg-muted px-1 py-0.5">Retention</code>,{' '}
          <code className="rounded-md bg-muted px-1 py-0.5">Expansion</code>,{' '}
          <code className="rounded-md bg-muted px-1 py-0.5">Outreach</code>, and{' '}
          <code className="rounded-md bg-muted px-1 py-0.5">Strategy</code>. 
          These agents work together to provide comprehensive customer success workflows.
        </p>
      </div>
    </motion.div>
  );
};
