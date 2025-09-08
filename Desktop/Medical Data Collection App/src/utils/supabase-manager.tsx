import { createClient } from '@supabase/supabase-js';

// Глобальный менеджер Supabase клиента
class SupabaseManager {
  private static instance: SupabaseManager;
  private client: any = null;
  private initialized = false;

  private constructor() {}

  static getInstance(): SupabaseManager {
    if (!SupabaseManager.instance) {
      SupabaseManager.instance = new SupabaseManager();
    }
    return SupabaseManager.instance;
  }

  initialize(projectId: string, anonKey: string) {
    if (this.initialized && this.client) {
      console.log('Supabase уже инициализирован, используем существующий клиент');
      return this.client;
    }

    console.log('Инициализируем новый Supabase клиент');
    this.client = createClient(
      `https://${projectId}.supabase.co`,
      anonKey
    );
    this.initialized = true;
    return this.client;
  }

  getClient() {
    if (!this.initialized || !this.client) {
      throw new Error('Supabase клиент не инициализирован');
    }
    return this.client;
  }

  isInitialized(): boolean {
    return this.initialized && this.client !== null;
  }

  reset() {
    this.client = null;
    this.initialized = false;
    console.log('Supabase клиент сброшен');
  }
}

export default SupabaseManager;