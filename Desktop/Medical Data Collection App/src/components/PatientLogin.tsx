import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  ArrowLeft, 
  Activity, 
  Heart, 
  Brain, 
  Shield, 
  Users, 
  MessageCircle,
  CheckSquare,
  Star
} from 'lucide-react';

interface PatientLoginProps {
  onEnterPortal: () => void;
  onBackToStaffLogin: () => void;
}

export const PatientLogin: React.FC<PatientLoginProps> = ({
  onEnterPortal,
  onBackToStaffLogin
}) => {
  const [patientCode, setPatientCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEnterPortal = async () => {
    setLoading(true);
    
    // Simulate validation delay
    setTimeout(() => {
      onEnterPortal();
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Heart className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-semibold text-slate-900 truncate">Recovery Assistant</h1>
                <p className="text-xs sm:text-sm text-slate-600 hidden sm:block">Your AI-powered recovery companion</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToStaffLogin}
              className="text-slate-600 hover:text-slate-900 text-xs sm:text-sm px-2 sm:px-3"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Staff Login</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 items-start lg:items-center">
          {/* Left side - Information */}
          <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
            <div>
              <Badge className="bg-blue-100 text-blue-800 mb-3 sm:mb-4 text-xs sm:text-sm">
                For Patients
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-4 sm:mb-6 leading-tight">
                Welcome to Your Recovery Journey
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed">
                Get personalized recovery guidance with our AI assistant trained on medical data 
                to support your concussion rehabilitation.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900 mb-1 text-sm sm:text-base">AI-Powered Guidance</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Personalized recommendations based on your symptoms and recovery progress
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900 mb-1 text-sm sm:text-base">24/7 Support</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Chat with your AI assistant anytime for immediate recovery support
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckSquare className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900 mb-1 text-sm sm:text-base">Daily Check-ins</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Track your progress with simple daily questionnaires
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900 mb-1 text-sm sm:text-base">Privacy Protected</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Your data is encrypted and anonymized for maximum privacy
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-200">
              <div className="flex items-center mb-2 sm:mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-slate-700 italic mb-2 sm:mb-3 text-sm sm:text-base leading-relaxed">
                "The AI assistant helped me understand my symptoms better and gave me 
                practical exercises that really made a difference in my recovery."
              </p>
              <p className="text-xs sm:text-sm text-slate-600">— Recovery Patient</p>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="flex justify-center order-1 lg:order-2">
            <Card className="w-full max-w-md shadow-xl bg-white/90 backdrop-blur-sm border-0">
              <CardHeader className="text-center pb-4 sm:pb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <CardTitle className="text-xl sm:text-2xl">Enter Recovery Portal</CardTitle>
                <p className="text-slate-600 mt-2 text-sm sm:text-base">
                  Start your personalized recovery journey today
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="patientCode" className="text-sm sm:text-base">Patient Access Code (Optional)</Label>
                  <Input
                    id="patientCode"
                    placeholder="Enter your access code if provided"
                    value={patientCode}
                    onChange={(e) => setPatientCode(e.target.value)}
                    className="h-10 sm:h-12 text-sm sm:text-base"
                  />
                  <p className="text-xs text-slate-500">
                    Don't have a code? You can still access the portal as a new patient.
                  </p>
                </div>

                <Button 
                  onClick={handleEnterPortal}
                  disabled={loading}
                  className="w-full h-11 sm:h-12 text-base sm:text-lg bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 font-medium"
                >
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  {loading ? 'Entering Portal...' : 'Enter Recovery Portal'}
                </Button>

                <div className="text-center">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-slate-500">How it works</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-slate-600">
                  <div className="flex items-center space-x-3">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">1</span>
                    <span className="leading-relaxed">Create your secure, anonymous profile</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">2</span>
                    <span className="leading-relaxed">Chat with your AI recovery assistant</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">3</span>
                    <span className="leading-relaxed">Track progress with daily check-ins</span>
                  </div>
                </div>

                <div className="pt-3 sm:pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs text-slate-500">
                    <Shield className="h-3 w-3 flex-shrink-0" />
                    <span className="text-center leading-relaxed">HIPAA compliant • End-to-end encrypted • Anonymous data</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-8 sm:mt-16 text-center px-4">
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
            This AI assistant provides educational information and should not replace professional medical advice. 
            Always consult with your healthcare provider for medical decisions.
          </p>
        </div>
      </main>
    </div>
  );
};