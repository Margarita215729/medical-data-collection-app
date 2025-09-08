import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { DebugPanel } from './DebugPanel';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface ConnectionStatusProps {
  status: 'connecting' | 'connected' | 'error';
  message?: string;
  onConnectionTest?: (success: boolean) => void;
}

export function ConnectionStatus({ status, message, onConnectionTest }: ConnectionStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'connecting':
        return {
          icon: <Loader2 className="h-6 w-6 animate-spin text-blue-500" />,
          title: 'Подключение к серверу...',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'connected':
        return {
          icon: <CheckCircle className="h-6 w-6 text-green-500" />,
          title: 'Подключено успешно',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-6 w-6 text-red-500" />,
          title: 'Ошибка подключения',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <Card className={`w-full ${config.bgColor} ${config.borderColor}`}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              {config.icon}
              <span>{config.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                {message || 'Инициализация системы медицинских данных...'}
              </p>
              {status === 'connecting' && (
                <div className="space-y-1 text-xs text-slate-500">
                  <p>• Проверка подключения к Supabase</p>
                  <p>• Инициализация серверных функций</p>
                  <p>• Проверка доступности аккаунтов</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Показываем панель диагностики при ошибке */}
        {status === 'error' && (
          <DebugPanel onConnectionTest={onConnectionTest} />
        )}
      </div>
    </div>
  );
}