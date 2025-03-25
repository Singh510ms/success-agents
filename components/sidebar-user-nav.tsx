'use client';
import { ChevronUp, Users }  from 'lucide-react';
import Image from 'next/image';
import type { User } from 'next-auth';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { AgentModal } from '@/components/agent-toggle';

export function SidebarUserNav({ user }: { user?: User }) {
  const { setTheme, theme } = useTheme();
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent bg-background data-[state=open]:text-sidebar-accent-foreground h-10">
              <Image
                src={`https://avatar.vercel.sh/${user?.email}`}
                alt={user?.email ?? 'User Avatar'}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="truncate">{user?.email}</span>
              <ChevronUp className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            className="w-[--radix-popper-anchor-width]"
          >
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {`Toggle ${theme === 'light' ? 'dark' : 'light'} mode`}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <button
                type="button"
                className="w-full cursor-pointer flex items-center"
                onClick={() => setIsAgentModalOpen(true)}
              >
                <Users className="mr-2 size-4" />
                Configure Agents
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <AgentModal 
        open={isAgentModalOpen} 
        onOpenChange={setIsAgentModalOpen} 
      />
    </SidebarMenu>
  );
}
