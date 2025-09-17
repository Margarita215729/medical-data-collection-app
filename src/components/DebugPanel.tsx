import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { RefreshCw, Database, Server, Users, AlertTriangle } from 'lucide-react';
import { testSupabaseConnection, testLoginAccounts } from '../utils/test-supabase';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface DebugPanelProps {
  onConnectionTest?: (success: boolean) => void;
}

export function DebugPanel({ onConnectionTest }: DebugPanelProps) {
  const [testing, setTesting] = useState(false);
  const [lastTestResults, setLastTestResults] = useState<{
    connection: boolean | null;
    accounts: boolean | null;
    timestamp: Date | null;
  }>({
    connection: null,
    accounts: null,
    timestamp: null
  });

  const runFullTest = async () => {
    setTesting(true);
    console.log('🔧 Запуск полной диагностики подключения...');
    
    try {
      // Тест подключения
      const connectionOk = await testSupabaseConnection();
      
      // Тест аккаунтов
      const accountsOk = await testLoginAccounts();
      
      const results = {
        connection: connectionOk,
        accounts: accountsOk,
        timestamp: new Date()
      };
      
      setLastTestResults(results);
      
      if (onConnectionTest) {
        onConnectionTest(connectionOk && accountsOk);
      }
      
      console.log('✅ Диагностика завершена:', results);
      
    } catch (error) {
      console.error('❌ Ошибка при диагностике:', error);
      setLastTestResults({
        connection: false,
        accounts: false,
        timestamp: new Date()
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusBadge = (status: boolean | null) => {
    if (status === null) return <Badge variant="secondary">Не проверено</Badge>;
    if (status === true) return <Badge variant="default" className="bg-green-500 text-white">✅ OK</Badge>;
    return <Badge variant="destructive">❌ Ошибка</Badge>;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <span>Диагностика подключения</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Информация о конфигурации */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Конфигурация Supabase:</h4>
          <div className="bg-slate-50 p-3 rounded text-xs space-y-1">
            <div><strong>Project ID:</strong> {projectId}</div>
            <div><strong>URL:</strong> https://{projectId}.supabase.co</div>
            <div><strong>Anon Key:</strong> {publicAnonKey.substring(0, 50)}...</div>
          </div>
        </div>

        {/* Результаты тестов */}
        {lastTestResults.timestamp && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">
              Результаты тестов ({lastTestResults.timestamp.toLocaleTimeString()}):
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <span className="text-sm">Подключение к Supabase</span>
                </div>
                {getStatusBadge(lastTestResults.connection)}
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Тестовые аккаунты</span>
                </div>
                {getStatusBadge(lastTestResults.accounts)}
              </div>
            </div>
          </div>
        )}

        {/* Кнопка тестирования */}
        <Button
          onClick={runFullTest}
          disabled={testing}
          className="w-full"
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${testing ? 'animate-spin' : ''}`} />
          {testing ? 'Диагностика...' : 'Запустить диагностику'}
        </Button>

        {/* Дополнительная информация */}
        <div className="text-xs text-slate-600 space-y-1">
          <p><strong>Примечание:</strong> Если тест подключения проходит, но аккаунты недоступны, возможно серверная инициализация еще не завершилась.</p>
          <p>Проверьте консоль браузера для подробной информации об ошибках.</p>
        </div>
      </CardContent>
    </Card>
  );
}