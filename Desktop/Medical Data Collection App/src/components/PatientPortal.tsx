import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { MLChatInterface } from './MLChatInterface';
import { DailyQuestionnaire } from './DailyQuestionnaire';
import { FAB, FABGroup } from './MobileFAB';
import { useScreenSize } from './ui/use-mobile';
import { User, MessageCircle, Activity, Calendar, LogOut, CheckSquare, Plus } from 'lucide-react';

interface PatientPortalProps {
  onLogout: () => void;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({ onLogout }) => {
  const [patientInfo, setPatientInfo] = useState({
    firstName: '',
    lastName: '',
    anonymousId: '',
    dateOfBirth: '',
    injuryDate: '',
  });
  const [isRegistered, setIsRegistered] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const screenSize = useScreenSize();

  // Check if patient is already registered
  useEffect(() => {
    const savedPatient = localStorage.getItem('patient-info');
    if (savedPatient) {
      const parsed = JSON.parse(savedPatient);
      setPatientInfo(parsed);
      setIsRegistered(true);
    }
  }, []);

  const handleRegister = () => {
    if (!patientInfo.firstName || !patientInfo.lastName || !patientInfo.dateOfBirth) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Generate anonymous ID
    const anonymousId = 'PAT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const updatedInfo = { ...patientInfo, anonymousId };
    
    setPatientInfo(updatedInfo);
    localStorage.setItem('patient-info', JSON.stringify(updatedInfo));
    setIsRegistered(true);
  };

  const handleStartChat = () => {
    setShowChat(true);
  };

  const handleStartQuestionnaire = () => {
    setShowQuestionnaire(true);
  };

  const handleQuestionnaireComplete = (data: any) => {
    console.log('Daily questionnaire completed:', data);
    // Here you would typically save the data to the backend
    setShowQuestionnaire(false);
    alert('Daily check-in completed successfully! Your responses have been recorded.');
  };

  if (showChat) {
    return (
      <MLChatInterface 
        patientInfo={patientInfo}
        onBack={() => setShowChat(false)}
        onLogout={onLogout}
      />
    );
  }

  if (showQuestionnaire) {
    return (
      <DailyQuestionnaire
        patientInfo={patientInfo}
        onBack={() => setShowQuestionnaire(false)}
        onComplete={handleQuestionnaireComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h1 className="text-base sm:text-xl font-semibold text-slate-900 truncate">Recovery Assistant</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-slate-600 hover:text-red-600 px-2 sm:px-3 text-sm"
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Exit</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {!isRegistered ? (
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center pb-4 sm:pb-6">
              <CardTitle className="flex items-center justify-center space-x-2 text-lg sm:text-xl">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                <span>Welcome to Recovery Assistant</span>
              </CardTitle>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Please provide some basic information to get started with your personalized recovery support.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="Enter your first name"
                  value={patientInfo.firstName}
                  onChange={(e) => setPatientInfo(prev => ({...prev, firstName: e.target.value}))}
                  className="h-11 text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Enter your last name"
                  value={patientInfo.lastName}
                  onChange={(e) => setPatientInfo(prev => ({...prev, lastName: e.target.value}))}
                  className="h-11 text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-sm">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={patientInfo.dateOfBirth}
                  onChange={(e) => setPatientInfo(prev => ({...prev, dateOfBirth: e.target.value}))}
                  className="h-11 text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="injuryDate" className="text-sm">Date of Injury (if known)</Label>
                <Input
                  id="injuryDate"
                  type="date"
                  value={patientInfo.injuryDate}
                  onChange={(e) => setPatientInfo(prev => ({...prev, injuryDate: e.target.value}))}
                  className="h-11 text-sm"
                />
              </div>
              
              <Button onClick={handleRegister} className="w-full h-11 text-sm font-medium">
                Start Recovery Journey
              </Button>
              
              <div className="text-xs text-slate-500 text-center leading-relaxed">
                Your information is kept private and secure. We use anonymous identifiers to protect your privacy.
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Welcome Message */}
            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <div className="text-center space-y-3 sm:space-y-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
                    Welcome back, {patientInfo.firstName}!
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
                    I'm your AI-powered recovery assistant, trained on medical data to help guide your 
                    concussion recovery journey. Share your current symptoms and I'll provide personalized 
                    treatment recommendations.
                  </p>
                  <Badge variant="secondary" className="mx-auto text-xs">
                    Patient ID: {patientInfo.anonymousId}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <Card>
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-slate-600">Recovery Started</p>
                      <p className="font-semibold text-sm sm:text-base">
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-slate-600">AI Assistant</p>
                      <p className="font-semibold text-sm sm:text-base">Ready to Help</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="sm:col-span-2 lg:col-span-1">
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <CheckSquare className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-slate-600">Daily Check-in</p>
                      <p className="font-semibold text-sm sm:text-base">Track Progress</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              <Card>
                <CardContent className="pt-4 sm:pt-6">
                  <div className="text-center space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold">AI Recovery Assistant</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Chat with your AI assistant for personalized recommendations based on your symptoms.
                    </p>
                    <Button 
                      onClick={handleStartChat} 
                      className="w-full h-11 sm:h-12 bg-blue-600 hover:bg-blue-700 text-sm sm:text-base font-medium"
                    >
                      <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Start Recovery Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 sm:pt-6">
                  <div className="text-center space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold">Daily Check-in</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Complete your daily symptom assessment to track your progress and help your care team.
                    </p>
                    <Button 
                      onClick={handleStartQuestionnaire} 
                      variant="outline"
                      className="w-full h-11 sm:h-12 border-purple-300 text-purple-600 hover:bg-purple-50 text-sm sm:text-base font-medium"
                    >
                      <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Complete Daily Check-in
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Information Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">How It Works</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-slate-600">
                    <li className="flex items-start">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5 flex-shrink-0">1</span>
                      <span className="leading-relaxed">Describe your current symptoms and how you're feeling</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5 flex-shrink-0">2</span>
                      <span className="leading-relaxed">AI analyzes your input using medical recovery data</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5 flex-shrink-0">3</span>
                      <span className="leading-relaxed">Receive personalized treatment recommendations</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Privacy & Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-slate-600">
                    <li className="flex items-start">
                      <span className="mr-2 mt-0.5 text-blue-600">•</span>
                      <span className="leading-relaxed">Your data is encrypted and secure</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-0.5 text-blue-600">•</span>
                      <span className="leading-relaxed">Anonymous IDs protect your identity</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-0.5 text-blue-600">•</span>
                      <span className="leading-relaxed">Medical data is separated from personal info</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-0.5 text-blue-600">•</span>
                      <span className="leading-relaxed">Conversations are confidential</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Mobile FAB for quick actions */}
            {screenSize === 'mobile' && (
              <FABGroup position="bottom-right" direction="vertical">
                <FAB
                  icon={CheckSquare}
                  onClick={handleStartQuestionnaire}
                  label="Daily Check-in"
                  variant="secondary"
                  size="sm"
                />
                <FAB
                  icon={MessageCircle}
                  onClick={handleStartChat}
                  label="Chat with AI"
                  variant="primary"
                />
              </FABGroup>
            )}
          </div>
        )}
      </main>
    </div>
  );
};