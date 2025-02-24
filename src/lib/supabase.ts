
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://puhqocqowgflaonnhywq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1aHFvY3Fvd2dmbGFvbm5oeXdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MDg0OTYsImV4cCI6MjA1NTQ4NDQ5Nn0.lYGuSpVdTZftoh-fFoPuWGdL0FYQu9jGj5uJdKumLBE';

export const supabase = createClient(supabaseUrl, supabaseKey);
