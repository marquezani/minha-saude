import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY;

export const URL_API = import.meta.env.VITE_URL_API;
// export const PASSWORD_KEY = import.meta.env.VITE_PASSWORD_KEY;
// export const USER_KEY = import.meta.env.VITE_USER_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);