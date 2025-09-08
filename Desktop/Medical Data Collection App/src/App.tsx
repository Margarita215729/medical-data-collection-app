import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { PatientForm } from './components/PatientForm';
import { MedicalDataForm } from './components/MedicalDataForm';
import { PatientList } from './components/PatientList';
import { ConnectionStatus } from './components/ConnectionStatus';
import { SupabaseConnectionManager } from './components/SupabaseConnectionManager';
import { LoadingScreen } from './components/LoadingScreen';
import { PatientPortal } from './components/PatientPortal';
import { PatientLogin } from './components/PatientLogin';
import { MLReviewDashboard } from './components/MLReviewDashboard';
import { MobileNav } from './components/MobileNav';
import SupabaseManager from './utils/supabase-manager';
import { testSupabaseConnection, testLoginAccounts } from './utils/test-supabase';

export interface User {
  id: string;
  email: string;
  user_metadata: {
    name: string;
    role: string;
    staff_id: string;
  };
}

export interface Patient {
  anonymousId: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  createdAt: string;
  createdBy: string;
}

export interface MedicalData {
  anonymousId: string;
  pcss?: {
    symptoms: Record<string, number>;
    totalScore: number;
  };
  voms?: {
    npcDistance: number;
    symptomsScore: number;
    items: Record<string, any>;
  };
  dhi?: {
    totalScore: number;
    responses: Record<string, number>;
  };
  hit6?: {
    totalScore: number;
    responses: Record<string, number>;
  };
  phq9?: {
    totalScore: number;
    responses: Record<string, number>;
  };
  gad7?: {
    totalScore: number;
    responses: Record<string, number>;
  };
  rehabilitationData?: {
    vestibular?: any;
    visual?: any;
    headache?: any;
    auditory?: any;
    speech?: any;
    exertional?: any;
    cervical?: any;
  };
  doctorNotes?: {
    clinicalNotes: string;
    treatmentPlan: string;
    progressNotes: string;
    recommendations: string;
    followUp: string;
  };
  lastUpdated: string;
  updatedBy: string;
}

type View = 'initializing' | 'supabase-setup' | 'connecting' | 'login' | 'dashboard' | 'patients' | 'add-patient' | 'medical-data' | 'patient-login' | 'patient-portal' | 'ml-reviews';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('initializing');
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  useEffect(() => {
    // Application initialization
    const initializeApp = async () => {
      console.log('🚀 Initializing application...');
      setConnectionStatus('connecting');
      setCurrentView('connecting');
      
      try {
        // Check for Supabase credentials
        const { getSupabaseConfig, hasSupabaseConfig } = await import('./utils/supabase/config');
        
        const hasConfig = await hasSupabaseConfig();
        if (!hasConfig) {
          console.log('ℹ️ Supabase credentials not found, showing setup screen');
          setCurrentView('supabase-setup');
          return;
        }
        
        const config = await getSupabaseConfig();
        if (!config) {
          console.log('ℹ️ Error loading Supabase configuration, showing setup screen');
          setCurrentView('supabase-setup');
          return;
        }
        
        const { projectId: currentProjectId, publicAnonKey: currentAnonKey } = config;
        console.log('✅ Supabase configuration loaded from:', config.source);

        // Initialize Supabase manager
        const manager = SupabaseManager.getInstance();
        const supabaseClient = manager.initialize(currentProjectId, currentAnonKey);

        // Test Supabase connection
        const connectionOk = await testSupabaseConnection(currentProjectId, currentAnonKey);
        if (!connectionOk) {
          console.error('❌ Supabase connection issues');
          setConnectionStatus('error');
          setCurrentView('supabase-setup');
          return;
        }

        setConnectionStatus('connected');

        // Check existing session
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session?.user && session?.access_token) {
          console.log('✅ Active user session found:', session.user.email);
          setUser(session.user as User);
          setAccessToken(session.access_token);
          setCurrentView('dashboard');
        } else {
          console.log('ℹ️ No active session found, showing login form');
          setCurrentView('login');
          
          // Test account availability in background
          setTimeout(async () => {
            const accountsOk = await testLoginAccounts();
            if (!accountsOk) {
              console.warn('⚠️ Test accounts unavailable. Server initialization may still be in progress.');
            }
          }, 1000);
        }
      } catch (error) {
        console.error('❌ Critical initialization error:', error);
        setConnectionStatus('error');
        setCurrentView('supabase-setup');
      }
    };
    
    initializeApp();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const manager = SupabaseManager.getInstance();
    if (!manager.isInitialized()) {
      console.error('❌ Supabase client not initialized');
      alert('Error: database connection not configured');
      return;
    }

    const supabase = manager.getClient();
    setLoading(true);
    console.log('🔐 Login attempt for:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Login error:', error);
        
        // More detailed error messages
        if (error.message.includes('Invalid login credentials')) {
          alert('Invalid credentials. Please check your email and password.');
        } else if (error.message.includes('Email not confirmed')) {
          alert('Email not confirmed. Please contact administrator.');
        } else {
          alert(`Login error: ${error.message}`);
        }
        return;
      }

      if (data.user && data.session) {
        console.log('✅ Successful login:', data.user.email);
        console.log('👤 User metadata:', data.user.user_metadata);
        
        setUser(data.user as User);
        setAccessToken(data.session.access_token);
        setCurrentView('dashboard');
      } else {
        console.error('❌ Invalid server response during login');
        alert('Error: received invalid user data');
      }
    } catch (error) {
      console.error('❌ Critical login error:', error);
      alert('Server connection error. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const manager = SupabaseManager.getInstance();
    if (manager.isInitialized()) {
      const supabase = manager.getClient();
      await supabase.auth.signOut();
    }
    setUser(null);
    setAccessToken('');
    setSelectedPatient(null);
    setCurrentView('login');
  };

  const handleSupabaseConnection = (projectId: string, anonKey: string) => {
    console.log('✅ Successful Supabase connection');
    
    // Initialize manager with new credentials
    const manager = SupabaseManager.getInstance();
    manager.reset(); // Reset previous client
    manager.initialize(projectId, anonKey);
    
    // Update status and proceed to login form
    setConnectionStatus('connected');
    setCurrentView('login');
  };

  const handleConnectionRetest = (success: boolean) => {
    if (success) {
      console.log('✅ Connection retest successful, proceeding to login form');
      setConnectionStatus('connected');
      setCurrentView('login');
    } else {
      console.log('❌ Connection retest failed, showing setup screen');
      setConnectionStatus('error');
      setCurrentView('supabase-setup');
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentView('medical-data');
  };

  const handleBackToDashboard = () => {
    setSelectedPatient(null);
    setCurrentView('dashboard');
  };

  const handlePatientAdded = () => {
    setCurrentView('patients');
  };

  // Render different application screens
  if (currentView === 'initializing') {
    return (
      <LoadingScreen message="Initializing medical data system..." />
    );
  }

  if (currentView === 'supabase-setup') {
    return (
      <SupabaseConnectionManager 
        onConnectionSuccess={handleSupabaseConnection}
      />
    );
  }

  if (currentView === 'connecting') {
    return (
      <ConnectionStatus 
        status={connectionStatus}
        message={
          connectionStatus === 'error' 
            ? 'Unable to connect to server. Please configure Supabase connection.'
            : 'Initializing medical data system...'
        }
        onConnectionTest={handleConnectionRetest}
      />
    );
  }

  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-3 sm:p-4">
          <div className="max-w-md w-full space-y-4 sm:space-y-6">
            <Login onLogin={handleLogin} loading={loading} />
            
            {/* Patient Portal Access */}
            <div className="text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300" />
                </div>
                <div className="relative flex justify-center text-xs sm:text-sm">
                  <span className="px-2 bg-gradient-to-br from-blue-50 to-indigo-100 text-slate-500">Are you a patient?</span>
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <button
                  onClick={() => setCurrentView('patient-login')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium underline decoration-dotted underline-offset-4 px-2 py-1 rounded-md hover:bg-blue-50/50 transition-colors"
                >
                  Access Patient Recovery Assistant
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'patient-login') {
    return (
      <PatientLogin 
        onEnterPortal={() => setCurrentView('patient-portal')}
        onBackToStaffLogin={() => setCurrentView('login')}
      />
    );
  }

  if (currentView === 'patient-portal') {
    return <PatientPortal onLogout={() => setCurrentView('patient-login')} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top navigation bar */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <MobileNav 
                user={user!}
                currentView={currentView}
                onNavigate={setCurrentView}
                onLogout={handleLogout}
              />
              <button 
                onClick={handleBackToDashboard}
                className="text-base sm:text-lg font-semibold text-slate-900 hover:text-slate-700 transition-colors touch-manipulation"
              >
                🏥 <span className="hidden min-[480px]:inline">MedData ML</span>
              </button>
              {selectedPatient && (
                <span className="text-xs sm:text-sm text-slate-600 truncate max-w-32 sm:max-w-none">
                  / {selectedPatient.firstName} {selectedPatient.lastName}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden lg:block">
                <span className="text-xs sm:text-sm text-slate-600">
                  {user?.user_metadata?.name} ({user?.user_metadata?.role})
                </span>
              </div>
              <div className="lg:hidden">
                <span className="text-xs text-slate-600 truncate max-w-20 sm:max-w-24">
                  {user?.user_metadata?.name?.split(' ')[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs sm:text-sm text-red-600 hover:text-red-700 px-2 py-1 rounded-md hover:bg-red-50 transition-colors hidden lg:block touch-manipulation min-h-[32px]"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6">
        {currentView === 'dashboard' && (
          <Dashboard 
            user={user!}
            onNavigate={setCurrentView}
            accessToken={accessToken}
          />
        )}

        {currentView === 'patients' && (
          <PatientList 
            accessToken={accessToken}
            onPatientSelect={handlePatientSelect}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'add-patient' && (
          <PatientForm 
            accessToken={accessToken}
            onPatientAdded={handlePatientAdded}
            onCancel={() => setCurrentView('patients')}
          />
        )}

        {currentView === 'medical-data' && selectedPatient && (
          <MedicalDataForm 
            patient={selectedPatient}
            accessToken={accessToken}
            onBack={handleBackToDashboard}
          />
        )}

        {currentView === 'ml-reviews' && (
          <MLReviewDashboard 
            accessToken={accessToken}
            onBack={() => setCurrentView('dashboard')}
          />
        )}
      </main>
    </div>
  );
}