// Production configuration using environment variables
// This file is used as a fallback when environment variables are available

export function getProductionConfig() {
  // For Vite/client-side
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (url && key) {
      return {
        projectId: url.replace('https://', '').replace('.supabase.co', ''),
        publicAnonKey: key
      };
    }
  }
  
  // For Node.js/server-side
  if (typeof process !== 'undefined' && process.env) {
    const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (url && key) {
      return {
        projectId: url.replace('https://', '').replace('.supabase.co', ''),
        publicAnonKey: key
      };
    }
  }
  
  console.error('❌ Supabase configuration not found in environment variables');
  return null;
}