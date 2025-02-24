
import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import { MessageSquare, ChevronLeft, ChevronRight, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import type { Message, Conversation } from '@/types/chat';

const Chat = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('session_id, message')
        .order('created_at', { ascending: true });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching conversations",
          description: error.message,
        });
        return;
      }

      const conversationsMap = new Map();
      data.forEach((msg) => {
        if (!conversationsMap.has(msg.session_id)) {
          const firstMessage = msg.message.type === 'human' ? msg.message.content : '';
          conversationsMap.set(msg.session_id, {
            session_id: msg.session_id,
            title: firstMessage.slice(0, 100),
            last_message: msg.message.content,
          });
        }
      });

      setConversations(Array.from(conversationsMap.values()));
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    if (!currentSession) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', currentSession)
        .order('created_at', { ascending: true });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching messages",
          description: error.message,
        });
        return;
      }

      setMessages(data);
    };

    fetchMessages();

    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `session_id=eq.${currentSession}`
      }, payload => {
        setMessages(current => [...current, payload.new as Message]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentSession]);

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
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        w-64 bg-card/50 backdrop-blur border-r border-border transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 z-20`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Conversations</h2>
          </div>
          <ScrollArea className="flex-1 p-4">
            {conversations.map((conv) => (
              <button
                key={conv.session_id}
                onClick={() => setCurrentSession(conv.session_id)}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-30 md:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </Button>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.message.type === 'human' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-lg ${
                    msg.message.type === 'human'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card'
                  }`}
                >
                  {msg.message.type === 'ai' ? (
                    <ReactMarkdown>
                      {msg.message.content}
                    </ReactMarkdown>
                  ) : (
                    <p>{msg.message.content}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="max-w-3xl mx-auto flex gap-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              disabled={loading}
              className="bg-card"
            />
            <Button onClick={sendMessage} disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
