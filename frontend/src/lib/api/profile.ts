import { supabase } from '@/supabaseClient';

export interface UserProfile {
  id: string;
  capital_one_id?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

export async function updateUserProfile(
  userId: string,
  updates: { capital_one_id: string }
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      capital_one_id: updates.capital_one_id,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }
}

