
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
  input: string;
  loading: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
}

export function ChatInput({ input, loading, onInputChange, onSend }: ChatInputProps) {
  return (
    <div className="border-t border-border p-4">
      <div className="max-w-3xl mx-auto flex gap-4">
        <Input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSend()}
          disabled={loading}
          className="bg-card"
        />
        <Button onClick={onSend} disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </Button>
      </div>
    </div>
  );
}
