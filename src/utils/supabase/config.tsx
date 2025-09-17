// Динамическая конфигурация Supabase

export async function getSupabaseConfig() {
  // Пытаемся получить из переменных окружения (Vite для клиента)
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const envUrl = (import.meta as any).env.VITE_SUPABASE_URL;
    const envAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
    
    if (envUrl && envAnonKey) {
      const projectId = envUrl.replace('https://', '').replace('.supabase.co', '');
      return {
        projectId,
        publicAnonKey: envAnonKey,
        source: 'environment-vite'
      };
    }
  }
  
  // Fallback для серверной среды (Node.js)
  if (typeof process !== 'undefined' && process.env) {
    const envUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const envAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    
    if (envUrl && envAnonKey) {
      const projectId = envUrl.replace('https://', '').replace('.supabase.co', '');
      return {
        projectId,
        publicAnonKey: envAnonKey,
        source: 'environment-node'
      };
    }
  }
  
  // Если переменные окружения недоступны, пытаемся использовать файл по умолчанию
  try {
    const module = await import('./info');
    return {
      projectId: module.projectId,
      publicAnonKey: module.publicAnonKey,
      source: 'file'
    };
  } catch (error) {
    console.warn('Не удалось загрузить конфигурацию Supabase из файла:', error);
    return null;
  }
}

export async function hasSupabaseConfig(): Promise<boolean> {
  const config = await getSupabaseConfig();
  return config !== null && !!config.projectId && !!config.publicAnonKey;
}