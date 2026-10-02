import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Replace with your project values (Supabase Dashboard > Settings > API)
const SUPABASE_URL = 'https://rgobjjatbdlbcflqlzmz.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'sb_publishable_KlYYjG-L-dFPs1_o5Roa-g_3ia-BGtx';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});