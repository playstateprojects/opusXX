import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit';
import type { Load } from '@sveltejs/kit';
import { user as userStore } from '$lib/stores/userStore';
import { supabaseStore } from '$lib/stores/supabaseStore';

const PUBLIC_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const PUBLIC_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;



export const load: Load = async ({ fetch, data, depends }) => {
  depends('supabase:auth');
  if (!data) return
  const supabase = createSupabaseLoadClient({
    supabaseUrl: PUBLIC_SUPABASE_URL,
    supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
    event: { fetch },
    serverSession: data.session,
  });
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      userStore.set(null);
    } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
      userStore.set(session?.user || null);
    }
  });
  supabaseStore.set(supabase);
  // Initial session check
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Use getUser() for secure user validation if we have a session
  let user = null;
  if (session) {
    const { data: userData, error } = await supabase.auth.getUser();
    if (!error) {
      user = userData.user;
    } else {
      console.warn('Failed to validate user:', error);
      user = session.user; // Fallback to session user if validation fails
    }
  }

  userStore.set(user);
  return { supabase, session, user };
};
