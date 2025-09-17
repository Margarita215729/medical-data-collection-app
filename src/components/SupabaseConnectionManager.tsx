import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { testSupabaseConnection } from '../utils/test-supabase';
import { Loader2, CheckCircle, XCircle, Settings, RefreshCw, Database, Key, Globe } from 'lucide-react';

interface SupabaseConnectionManagerProps {
  onConnectionSuccess: (projectId: string, anonKey: string) => void;
  onClose?: () => void;
}

export function SupabaseConnectionManager({ onConnectionSuccess, onClose }: SupabaseConnectionManagerProps) {
  const [projectId, setProjectId] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [serviceRoleKey, setServiceRoleKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Загружаем текущие настройки из переменных окружения
  useEffect(() => {
    const loadCurrentSettings = async () => {
      try {
        // Попытка получить текущие настройки
        const { projectId: currentProjectId, publicAnonKey } = await import('../utils/supabase/info');
        if (currentProjectId && publicAnonKey) {
          setProjectId(currentProjectId);
          setAnonKey(publicAnonKey);
        }
      } catch (error) {
        console.log('Не удалось загрузить текущие настройки:', error);
      }
    };
    
    loadCurrentSettings();
  }, []);

  const testConnection = async (testProjectId: string, testAnonKey: string) => {
    setTesting(true);
    setConnectionStatus('testing');
    setErrorMessage('');

    try {
      // Проверяем формат данных
      if (!testProjectId || !testAnonKey) {
        throw new Error('Project ID и Anon Key обязательны');
      }

      if (!testProjectId.match(/^[a-zA-Z0-9]+$/)) {
        throw new Error('Project ID должен содержать только буквы и цифры');
      }

      console.log('🔍 Тестируем подключение к:', `https://${testProjectId}.supabase.co`);

      // Используем утилиту тестирования
      const connectionOk = await testSupabaseConnection(testProjectId, testAnonKey);
      
      if (!connectionOk) {
        throw new Error('Не удалось подключиться к Supabase. Проверьте учетные данные и доступность сервера.');
      }

      console.log('✅ Подключение к Supabase успешно');
      setConnectionStatus('success');
      
      // Небольшая задержка для показа успеха
      setTimeout(() => {
        onConnectionSuccess(testProjectId, testAnonKey);
      }, 1000);

    } catch (error: any) {
      console.error('❌ Ошибка тестирования подключения:', error);
      setConnectionStatus('error');
      setErrorMessage(error.message || 'Неизвестная ошибка подключения');
    } finally {
      setTesting(false);
    }
  };

  const handleConnect = () => {
    testConnection(projectId, anonKey);
  };

  const handleRetestCurrent = () => {
    if (projectId && anonKey) {
      testConnection(projectId, anonKey);
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Database className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'testing':
        return 'Тестируем подключение...';
      case 'success':
        return 'Подключение успешно!';
      case 'error':
        return 'Ошибка подключения';
      default:
        return 'Готов к тестированию';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Database className="h-6 w-6 text-blue-600" />
            <CardTitle>Подключение к Supabase</CardTitle>
          </div>
          <CardDescription>
            Настройте подключение к базе данных Supabase для вашего медицинского приложения
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Статус подключения */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <span className="text-sm font-medium">{getStatusText()}</span>
            </div>
            <Badge variant={connectionStatus === 'success' ? 'default' : connectionStatus === 'error' ? 'destructive' : 'secondary'}>
              {connectionStatus === 'idle' ? 'Не подключен' : 
               connectionStatus === 'testing' ? 'Тестирование' :
               connectionStatus === 'success' ? 'Подключен' : 'Ошибка'}
            </Badge>
          </div>

          {/* Форма подключения */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectId" className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>Project ID</span>
              </Label>
              <Input
                id="projectId"
                type="text"
                placeholder="ваш-project-id"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value.trim())}
                disabled={testing}
              />
              <p className="text-xs text-slate-600">
                Найдите в URL вашего проекта: https://ваш-project-id.supabase.co
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="anonKey" className="flex items-center space-x-2">
                <Key className="h-4 w-4" />
                <span>Anon Key (Public)</span>
              </Label>
              <Input
                id="anonKey"
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value.trim())}
                disabled={testing}
              />
              <p className="text-xs text-slate-600">
                Найдите в настройках проекта: Settings → API → Project API keys → anon public
              </p>
            </div>

            {/* Расширенные настройки */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-2 text-sm text-slate-600 hover:text-slate-900"
              >
                <Settings className="h-4 w-4" />
                <span>Расширенные настройки</span>
              </button>

              {showAdvanced && (
                <div className="space-y-4 border-l-2 border-slate-200 pl-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceRoleKey">Service Role Key (опционально)</Label>
                    <Input
                      id="serviceRoleKey"
                      type="password"
                      placeholder="Только для серверных операций"
                      value={serviceRoleKey}
                      onChange={(e) => setServiceRoleKey(e.target.value.trim())}
                      disabled={testing}
                    />
                    <p className="text-xs text-slate-600">
                      Используется только для административных операций на сервере
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Сообщение об ошибке */}
          {errorMessage && connectionStatus === 'error' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Кнопки действий */}
          <div className="flex space-x-3">
            <Button
              onClick={handleConnect}
              disabled={testing || !projectId || !anonKey}
              className="flex-1"
            >
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Тестирование...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Подключиться
                </>
              )}
            </Button>

            {projectId && anonKey && (
              <Button
                variant="outline"
                onClick={handleRetestCurrent}
                disabled={testing}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Перетестировать
              </Button>
            )}

            {onClose && (
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={testing}
              >
                Отмена
              </Button>
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Где найти учетные данные Supabase:</h4>
            <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
              <li>Откройте ваш проект на supabase.com</li>
              <li>Перейдите в Settings → API</li>
              <li>Скопируйте Project URL (из него возьмите project-id)</li>
              <li>Скопируйте anon public key из раздела "Project API keys"</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}