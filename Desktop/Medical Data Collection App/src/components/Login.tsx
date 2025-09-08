import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  loading: boolean;
}

export function Login({ onLogin, loading }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      await onLogin(email, password);
    }
  };

  const predefinedAccounts = [
    { email: 'doctor1@medical.com', name: 'Dr. Johnson', role: 'Neurologist' },
    { email: 'doctor2@medical.com', name: 'Dr. Smith', role: 'Physical Therapist' },
    { email: 'doctor3@medical.com', name: 'Dr. Brown', role: 'Speech Therapist' },
    { email: 'doctor4@medical.com', name: 'Dr. Davis', role: 'Psychologist' }
  ];

  return (
    <div className="w-full max-w-md space-y-4 sm:space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <span className="text-xl sm:text-2xl">🏥</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
          MedData ML
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Medical Data Collection System for Machine Learning
        </p>
      </div>

      <Card className="shadow-xl bg-white/90 backdrop-blur-sm border-0">
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">Medical Staff Login</CardTitle>
          <p className="text-xs sm:text-sm text-slate-600">Access the medical data collection system</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@medical.com"
                className="h-10 sm:h-11 text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 sm:h-11 text-sm"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 sm:h-12 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-medium"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In to Medical System'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-sm sm:text-base">Test Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 sm:space-y-3">
            <p className="text-xs text-slate-600 mb-2 sm:mb-3">
              Password for all accounts: <code className="bg-slate-100 px-1 rounded text-xs">medical2024!</code>
            </p>
            {predefinedAccounts.map((account, index) => (
              <button
                key={index}
                onClick={() => {
                  setEmail(account.email);
                  setPassword('medical2024!');
                }}
                className="w-full text-left p-2 sm:p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors touch-manipulation"
              >
                <div className="text-xs sm:text-sm font-medium text-slate-900">
                  {account.name}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  <span className="hidden sm:inline">{account.role} • </span>
                  <span className="sm:hidden">{account.role}</span>
                  <br className="sm:hidden" />
                  <span className="text-xs">{account.email}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}