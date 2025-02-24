
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import type { Conversation } from '@/types/chat';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { toast } = useToast();

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

  return { conversations };
}
