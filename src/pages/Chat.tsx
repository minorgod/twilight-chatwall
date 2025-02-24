import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useConversations } from '@/hooks/use-conversations';
import { useMessages } from '@/hooks/use-messages';
import { supabase } from '@/lib/supabase';
import { Sidebar } from '@/components/chat/Sidebar';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';

const Chat = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { conversations } = useConversations();
  const { messages } = useMessages(currentSession);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
      toast({
        title: "Logged out",
        description: "Successfully logged out of your account.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out. Please try again.",
      });
    }
  };

  const handleNewConversation = () => {
    setCurrentSession(null);
    setInput('');
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const session_id = currentSession || uuidv4();
    if (!currentSession) {
      setCurrentSession(session_id);
    }

    setLoading(true);
    try {
      const request_id = uuidv4();
      const response = await fetch('http://localhost:8001/api/pydantic-github-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: input,
          user_id: 'NA',
          request_id,
          session_id,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error('Failed to get response from agent');
      }

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        open={sidebarOpen}
        conversations={conversations}
        currentSession={currentSession}
        onSelectSession={setCurrentSession}
        onLogout={handleLogout}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onNewConversation={handleNewConversation}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-30 md:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </Button>

        <MessageList messages={messages} />
        
        <ChatInput
          input={input}
          loading={loading}
          onInputChange={setInput}
          onSend={sendMessage}
        />
      </div>
    </div>
  );
};

export default Chat;
