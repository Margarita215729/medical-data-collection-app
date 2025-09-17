import { createClient } from '@supabase/supabase-js';
import SupabaseManager from './supabase-manager';

// Function for testing Supabase connection with passed parameters
export async function testSupabaseConnection(projectId?: string, anonKey?: string) {
  try {
    let supabase;
    
    if (projectId && anonKey) {
      // Use passed parameters
      supabase = createClient(
        `https://${projectId}.supabase.co`,
        anonKey
      );
    } else {
      // Try to get from manager
      try {
        const manager = SupabaseManager.getInstance();
        if (manager.isInitialized()) {
          supabase = manager.getClient();
        } else {
          // Try to load from info file
          const { projectId: infoProjectId, publicAnonKey } = await import('./supabase/info');
          supabase = manager.initialize(infoProjectId, publicAnonKey);
        }
      } catch (error) {
        console.error('❌ Failed to initialize Supabase client:', error);
        return false;
      }
    }

    console.log('🔗 Testing Supabase connection...');

    // Check connection through simple request
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Supabase Auth connection error:', error);
      return false;
    }

    console.log('✅ Supabase Auth connection successful');
    console.log('Current session:', data.session ? 'Active' : 'None');
    
    // Test server connection
    try {
      console.log('🔍 Checking server functions...');
      
      // Extract projectId from supabase client URL
      const clientUrl = supabase.supabaseUrl;
      const urlProjectId = clientUrl.replace('https://', '').replace('.supabase.co', '');
      const clientKey = supabase.supabaseKey;
      
      const serverUrl = `https://${urlProjectId}.supabase.co/functions/v1/make-server-094289b0/health`;
      console.log('Server URL:', serverUrl);
      
      const serverResponse = await fetch(serverUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${clientKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response Status:', serverResponse.status);
      console.log('Response Status Text:', serverResponse.statusText);

      if (serverResponse.ok) {
        const serverData = await serverResponse.json();
        console.log('✅ Server connection successful:', serverData);
        return true;
      } else {
        const errorText = await serverResponse.text();
        console.error('❌ Server connection error:');
        console.error('Status:', serverResponse.status);
        console.error('Status Text:', serverResponse.statusText);
        console.error('Response Body:', errorText);
        return false;
      }
    } catch (serverError) {
      console.error('❌ Error contacting server:', serverError);
      console.error('Possible causes:');
      console.error('1. Server function not deployed');
      console.error('2. CORS errors');
      console.error('3. Incorrect environment variables on server');
      console.warn('⚠️ Server functions unavailable, but Auth connection works - proceeding with limited functionality');
      return true; // Allow app to continue with just Auth functionality
    }

  } catch (error) {
    console.error('❌ Critical Supabase connection error:', error);
    return false;
  }
}

// Function for checking test account availability
export async function testLoginAccounts() {
  try {
    const manager = SupabaseManager.getInstance();
    if (!manager.isInitialized()) {
      console.error('❌ Supabase client not initialized for account testing');
      return false;
    }
    
    const supabase = manager.getClient();

    console.log('🔐 Testing account availability...');

    // Test first account
    const testEmail = 'doctor1@medical.com';
    const testPassword = 'medical2024!';
    
    console.log('Login attempt with email:', testEmail);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (error) {
      console.error('❌ Test account login error:', error.message);
      console.error('Error code:', error.status);
      
      if (error.message.includes('Invalid login credentials')) {
        console.error('Possible causes:');
        console.error('1. Account not created on server');
        console.error('2. Incorrect credentials');
        console.error('3. Server initialization not completed');
      }
      
      return false;
    }

    if (data.user && data.session) {
      console.log('✅ Test account available:', data.user.email);
      console.log('User metadata:', data.user.user_metadata);
      
      // Log out of account
      await supabase.auth.signOut();
      console.log('Test account logout completed');
      return true;
    }

    console.error('❌ Received invalid user data');
    return false;
  } catch (error) {
    console.error('❌ Error testing accounts:', error);
    return false;
  }
}