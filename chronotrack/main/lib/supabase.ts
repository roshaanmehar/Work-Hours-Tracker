import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for database operations
export async function getJobs() {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
  
  return data || [];
}

export async function getJobRules() {
  const { data, error } = await supabase
    .from('job_rules')
    .select(`
      *,
      jobs:job_id (name)
    `)
    .order('priority', { ascending: false });
  
  if (error) {
    console.error('Error fetching job rules:', error);
    return [];
  }
  
  return data || [];
}

export async function getTimeEntries(startDate?: string, endDate?: string) {
  let query = supabase
    .from('time_entries')
    .select(`
      *,
      jobs:job_id (name, hourly_rate),
      breaks (*)
    `)
    .order('date', { ascending: false })
    .order('clock_in', { ascending: false });
  
  if (startDate) {
    query = query.gte('date', startDate);
  }
  
  if (endDate) {
    query = query.lte('date', endDate);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching time entries:', error);
    return [];
  }
  
  return data || [];
}

export async function createTimeEntry(timeEntry: any) {
  const { data, error } = await supabase
    .from('time_entries')
    .insert([timeEntry])
    .select();
  
  if (error) {
    console.error('Error creating time entry:', error);
    throw error;
  }
  
  return data?.[0];
}

export async function updateTimeEntry(id: string, updates: any) {
  const { data, error } = await supabase
    .from('time_entries')
    .update({
      ...updates,
      modified_at: new Date().toISOString()
    })
    .eq('id', id)
    .select();
  
  if (error) {
    console.error('Error updating time entry:', error);
    throw error;
  }
  
  return data?.[0];
}

export async function createBreak(breakData: any) {
  const { data, error } = await supabase
    .from('breaks')
    .insert([breakData])
    .select();
  
  if (error) {
    console.error('Error creating break:', error);
    throw error;
  }
  
  return data?.[0];
}

export async function updateBreak(id: string, updates: any) {
  const { data, error } = await supabase
    .from('breaks')
    .update(updates)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error('Error updating break:', error);
    throw error;
  }
  
  return data?.[0];
}
