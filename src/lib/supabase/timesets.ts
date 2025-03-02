import { supabase } from '@/lib/supabase';
import { Database } from './database.types';

// Types
export interface Timeset {
  id: string;
  user_id: string;
  name: string;
  times: any[]; // Replace with your actual times structure
  created_at: string;
  updated_at: string;
}

export interface TimesetInsert {
  name: string;
  times: any[]; // Replace with your actual times structure
}

// Functions to interact with timesets
export async function getTimesets() {
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to get timesets');
  }
  
  const { data, error } = await supabase
    .from('timesets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching timesets:', error);
    throw error;
  }
  
  return data || [];
}

export async function getTimesetById(id: string) {
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to get a timeset');
  }
  
  const { data, error } = await supabase
    .from('timesets')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();
  
  if (error) {
    console.error(`Error fetching timeset with id ${id}:`, error);
    throw error;
  }
  
  return data;
}

export async function createTimeset(timeset: TimesetInsert) {
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to create a timeset');
  }
  
  const { data, error } = await supabase
    .from('timesets')
    .insert({
      ...timeset,
      user_id: user.id
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating timeset:', error);
    throw error;
  }
  
  return data;
}

export async function updateTimeset(id: string, updates: Partial<TimesetInsert>) {
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to update a timeset');
  }
  
  const { data, error } = await supabase
    .from('timesets')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();
  
  if (error) {
    console.error(`Error updating timeset with id ${id}:`, error);
    throw error;
  }
  
  return data;
}

export async function deleteTimeset(id: string) {
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to delete a timeset');
  }
  
  const { error } = await supabase
    .from('timesets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
  
  if (error) {
    console.error(`Error deleting timeset with id ${id}:`, error);
    throw error;
  }
  
  return true;
} 