
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = '[Your Supabase Public URL]';
const supabaseKey = '[Your Supabase Public/Anon Key]';

export const supabase = createClient(supabaseUrl, supabaseKey);
