import React from 'react';
import { Loader2, Database } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Загрузка...' }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Database className="h-8 w-8 text-blue-600" />
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
        <h1 className="text-xl font-medium text-slate-900">МедДанные ML</h1>
        <p className="text-slate-600">{message}</p>
      </div>
    </div>
  );
}