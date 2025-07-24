import { createClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
const SUPABASE_URL = environment.SUPABASE_URL;
const SUPABASE_ANON_KEY = environment.SUPABASE_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);