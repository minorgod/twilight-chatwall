
import { MessageSquare, LogOut } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import type { Conversation } from '@/types/chat';

interface SidebarProps {
  open: boolean;
  conversations: Conversation[];
  currentSession: string | null;
  onSelectSession: (sessionId: string) => void;
  onLogout: () => void;
}

export function Sidebar({ open, conversations, currentSession, onSelectSession, onLogout }: SidebarProps) {
  return (
    <div className={`fixed inset-y-0 left-0 transform ${open ? 'translate-x-0' : '-translate-x-full'} 
      w-64 bg-card/50 backdrop-blur border-r border-border transition-transform duration-300 ease-in-out
      md:relative md:translate-x-0 z-20`}>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">Conversations</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut size={16} />
          </Button>
        </div>
        <ScrollArea className="flex-1 p-4">
          {conversations.map((conv) => (
            <button
              key={conv.session_id}
              onClick={() => onSelectSession(conv.session_id)}
              className={`w-full p-3 text-left rounded-lg mb-2 transition-colors
                ${currentSession === conv.session_id ? 'bg-primary/20' : 'hover:bg-secondary/50'}`}
            >
              <div className="flex items-center space-x-3">
                <MessageSquare size={16} />
                <span className="text-sm truncate">{conv.title || 'New Conversation'}</span>
              </div>
            </button>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
}
