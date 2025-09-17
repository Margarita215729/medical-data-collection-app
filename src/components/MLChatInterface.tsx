import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { 
  ArrowLeft, 
  Send, 
  Bot, 
  User, 
  Activity, 
  Brain,
  AlertCircle,
  CheckCircle,
  LogOut,
  Loader2
} from 'lucide-react';

interface PatientInfo {
  firstName: string;
  lastName: string;
  anonymousId: string;
  dateOfBirth: string;
  injuryDate: string;
}

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  recommendations?: RecommendationItem[];
}

interface RecommendationItem {
  category: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

interface MLChatInterfaceProps {
  patientInfo: PatientInfo;
  onBack: () => void;
  onLogout: () => void;
}

export const MLChatInterface: React.FC<MLChatInterfaceProps> = ({
  patientInfo,
  onBack,
  onLogout
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: Message = {
      id: 'welcome',
      type: 'ai',
      content: `Hello ${patientInfo.firstName}! I'm your AI recovery assistant. I've been trained on medical data from concussion recovery cases to provide you with personalized recommendations.\n\nTo get started, please tell me:\n• How are you feeling today?\n• What symptoms are you currently experiencing?\n• Any changes since your last assessment?\n\nBe as detailed as possible - this helps me provide better recommendations for your recovery.`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [patientInfo.firstName]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-094289b0/ml-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          patientId: patientInfo.anonymousId,
          message: inputMessage.trim(),
          patientInfo: {
            dateOfBirth: patientInfo.dateOfBirth,
            injuryDate: patientInfo.injuryDate,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      let content = data.response;
      
      // Add info about analysis method and confidence if available
      if (data.note) {
        content += `\n\n*${data.note}*`;
      }
      
      if (data.confidence && data.confidence < 1) {
        content += `\n\n**Confidence Level:** ${Math.round(data.confidence * 100)}%`;
      }
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content,
        recommendations: data.recommendations,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'system',
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment, or contact your healthcare provider if you need immediate assistance.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertCircle className="h-4 w-4" />;
      case 'medium': return <Activity className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-slate-600 hover:text-slate-900 px-2 sm:px-3 flex-shrink-0"
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="font-semibold text-slate-900 text-sm sm:text-base truncate">AI Recovery Assistant</h1>
                  <Badge variant="secondary" className="text-xs max-w-24 sm:max-w-none truncate">
                    {patientInfo.anonymousId}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-slate-600 hover:text-red-600 px-2 sm:px-3 flex-shrink-0"
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Exit</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6">
        <Card className="h-full flex flex-col">
          <CardHeader className="border-b border-slate-200 py-3 sm:py-4">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <span>Recovery Consultation</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 p-3 sm:p-4 lg:p-6" ref={scrollAreaRef}>
              <div className="space-y-3 sm:space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] sm:max-w-3xl flex items-start space-x-2 sm:space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.type === 'user' 
                          ? 'bg-blue-600' 
                          : message.type === 'ai'
                          ? 'bg-green-600'
                          : 'bg-yellow-600'
                      }`}>
                        {message.type === 'user' ? (
                          <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        ) : message.type === 'ai' ? (
                          <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        ) : (
                          <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        )}
                      </div>
                      
                      {/* Message Content */}
                      <div className={`rounded-lg p-3 sm:p-4 ${
                        message.type === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : message.type === 'ai'
                          ? 'bg-white border border-slate-200'
                          : 'bg-yellow-50 border border-yellow-200'
                      }`}>
                        <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{message.content}</p>
                        
                        {/* Recommendations */}
                        {message.recommendations && (
                          <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                            <h4 className="font-semibold text-slate-900 flex items-center text-sm sm:text-base">
                              <Activity className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                              <span>Personalized Recommendations:</span>
                            </h4>
                            <div className="space-y-2 sm:space-y-3">
                              {message.recommendations.map((rec, index) => (
                                <div key={index} className={`p-2 sm:p-3 rounded-lg border ${getSeverityColor(rec.severity)}`}>
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start sm:items-center space-x-2 mb-1 flex-wrap gap-1">
                                        {getSeverityIcon(rec.severity)}
                                        <h5 className="font-medium text-xs sm:text-sm leading-relaxed">{rec.title}</h5>
                                        <Badge variant="outline" className="text-xs flex-shrink-0">
                                          {rec.category}
                                        </Badge>
                                      </div>
                                      <p className="text-xs sm:text-sm leading-relaxed">{rec.description}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <p className="text-xs mt-2 sm:mt-3 opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      </div>
                      <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-green-600 flex-shrink-0" />
                          <span className="text-slate-600 text-sm sm:text-base">AI is analyzing your symptoms...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            {/* Message Input */}
            <div className="border-t border-slate-200 p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Textarea
                  placeholder="Describe your symptoms, how you're feeling, or ask questions about your recovery..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="resize-none text-sm sm:text-base min-h-[60px] sm:min-h-[72px]"
                  rows={2}
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 h-11 sm:h-auto sm:self-end flex-shrink-0"
                >
                  <Send className="h-4 w-4 sm:mr-0" />
                  <span className="ml-2 sm:hidden">Send</span>
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                <span className="hidden sm:inline">Press Enter to send, Shift+Enter for new line. </span>This AI provides educational information and should not replace professional medical advice.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};