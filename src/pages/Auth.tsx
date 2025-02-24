
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (type: 'login' | 'signup') => {
    try {
      setLoading(true);
      const { error } = type === 'signup' 
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;
      
      if (type === 'login') {
        navigate('/chat');
        toast({
          title: "Welcome back!",
          description: "Successfully logged in.",
        });
      } else {
        toast({
          title: "Check your email",
          description: "We sent you a confirmation link.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6 bg-card/50 backdrop-blur">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Welcome</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your account or create a new one
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background/50"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <Button 
              onClick={() => handleAuth('login')}
              disabled={loading}
              className="w-full"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => handleAuth('signup')}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
