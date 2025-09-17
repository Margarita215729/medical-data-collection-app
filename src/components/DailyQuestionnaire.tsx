import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ArrowLeft, Save, Calendar, Activity, Brain, Loader2 } from 'lucide-react';

interface DailyQuestionnaireProps {
  patientInfo: any;
  onBack: () => void;
  onComplete: (data: any) => void;
}

export const DailyQuestionnaire: React.FC<DailyQuestionnaireProps> = ({
  patientInfo,
  onBack,
  onComplete
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [questionsSource, setQuestionsSource] = useState<'ai' | 'fallback'>('fallback');

  const defaultQuestions = [
    {
      id: 'headache',
      question: 'How severe is your headache today?',
      category: 'Physical Symptoms'
    },
    {
      id: 'dizziness',
      question: 'How dizzy or unbalanced do you feel?',
      category: 'Physical Symptoms'
    },
    {
      id: 'nausea',
      question: 'Are you experiencing nausea?',
      category: 'Physical Symptoms'
    },
    {
      id: 'vision',
      question: 'How are your vision problems today?',
      category: 'Visual/Cognitive'
    },
    {
      id: 'concentration',
      question: 'How difficult is it to concentrate?',
      category: 'Visual/Cognitive'
    },
    {
      id: 'memory',
      question: 'Are you having memory problems?',
      category: 'Visual/Cognitive'
    },
    {
      id: 'sleep',
      question: 'How well did you sleep last night?',
      category: 'Sleep/Energy'
    },
    {
      id: 'fatigue',
      question: 'How tired do you feel today?',
      category: 'Sleep/Energy'
    },
    {
      id: 'mood',
      question: 'How is your mood today?',
      category: 'Emotional'
    },
    {
      id: 'anxiety',
      question: 'How anxious or worried do you feel?',
      category: 'Emotional'
    }
  ];

  useEffect(() => {
    loadPersonalizedQuestions();
  }, [patientInfo]);

  const loadPersonalizedQuestions = async () => {
    setLoadingQuestions(true);
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-094289b0/daily-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          patientId: patientInfo.anonymousId
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.questions && data.questions.length > 0) {
          // Convert AI questions to our format
          const aiQuestions = data.questions.map((q: string, index: number) => ({
            id: `ai_question_${index}`,
            question: q.endsWith('?') ? q : q + '?',
            category: index < 3 ? 'Physical Symptoms' : 
                     index < 5 ? 'Cognitive' : 
                     index < 7 ? 'Daily Function' : 'General'
          }));
          
          setQuestions(aiQuestions);
          setQuestionsSource('ai');
          console.log('✅ Loaded AI-generated questions');
        } else {
          throw new Error('No questions returned');
        }
      } else {
        throw new Error('Failed to fetch questions');
      }
    } catch (error) {
      console.log('Using fallback questions:', error);
      setQuestions(defaultQuestions);
      setQuestionsSource('fallback');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const scaleOptions = [
    { value: 0, label: 'None', description: 'No symptoms' },
    { value: 1, label: 'Mild', description: 'Barely noticeable' },
    { value: 2, label: 'Mild-Moderate', description: 'Noticeable but manageable' },
    { value: 3, label: 'Moderate', description: 'Interferes with activities' },
    { value: 4, label: 'Moderate-Severe', description: 'Significantly bothersome' },
    { value: 5, label: 'Severe', description: 'Prevents normal activities' },
    { value: 6, label: 'Very Severe', description: 'Overwhelming symptoms' }
  ];

  const handleResponseChange = (value: string) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestion]: parseInt(value)
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    
    try {
      const questionnaireData = {
        patientId: patientInfo.anonymousId,
        date: new Date().toISOString().split('T')[0],
        responses: questions.reduce((acc, question, index) => {
          acc[question.id] = responses[index] || 0;
          return acc;
        }, {} as Record<string, number>),
        totalScore: Object.values(responses).reduce((sum, score) => sum + (score || 0), 0),
        completedAt: new Date().toISOString()
      };

      onComplete(questionnaireData);
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      alert('Error submitting questionnaire. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;
  const isLastQuestion = questions.length > 0 && currentQuestion === questions.length - 1;
  const canProceed = responses[currentQuestion] !== undefined;

  if (loadingQuestions) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Brain className="h-6 w-6 text-blue-600" />
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold">Personalizing Your Check-in</h3>
              <p className="text-sm text-slate-600">
                Our AI is creating personalized questions based on your recovery progress...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-slate-600 hover:text-slate-900 px-2 sm:px-3 min-w-0 flex-shrink-0"
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  {questionsSource === 'ai' ? (
                    <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  ) : (
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <h1 className="font-semibold text-slate-900 text-sm sm:text-base truncate">Daily Check-in</h1>
                    {questionsSource === 'ai' && (
                      <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                        AI Personalized
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Progress */}
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Progress</span>
                  <span className="font-medium">{currentQuestion + 1} of {questions.length}</span>
                </div>
                <Progress value={progress} className="h-2 sm:h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Question */}
          <Card>
            <CardHeader className="pb-4 sm:pb-6">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0 mt-1" />
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg">
                    Question {currentQuestion + 1}
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Category: {questions[currentQuestion]?.category}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-lg sm:text-xl font-medium text-slate-900 mb-4 sm:mb-6 leading-relaxed">
                  {questions[currentQuestion]?.question}
                </h3>
                
                <RadioGroup
                  value={responses[currentQuestion]?.toString() || ''}
                  onValueChange={handleResponseChange}
                  className="space-y-2 sm:space-y-3"
                >
                  {scaleOptions.map((option) => (
                    <div key={option.value} className="flex items-start space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors min-h-[56px] touch-manipulation">
                      <RadioGroupItem 
                        value={option.value.toString()} 
                        id={`option-${option.value}`}
                        className="mt-1 border-2 border-slate-400 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <Label htmlFor={`option-${option.value}`} className="cursor-pointer block">
                          <div className="flex items-start sm:items-center justify-between gap-2">
                            <span className="font-medium text-sm sm:text-base leading-relaxed">{option.value} - {option.label}</span>
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded flex-shrink-0 min-w-[24px] text-center">
                              {option.value}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                            {option.description}
                          </p>
                        </Label>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className="h-11 sm:h-10 text-sm sm:text-base order-2 sm:order-1"
                >
                  Previous
                </Button>
                
                <div className="flex space-x-3 order-1 sm:order-2">
                  {!isLastQuestion ? (
                    <Button
                      onClick={handleNext}
                      disabled={!canProceed}
                      className="bg-blue-600 hover:bg-blue-700 h-11 sm:h-10 text-sm sm:text-base flex-1 sm:flex-none"
                    >
                      Next Question
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={!canProceed || submitting}
                      className="bg-green-600 hover:green-700 h-11 sm:h-10 text-sm sm:text-base flex-1 sm:flex-none"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {submitting ? 'Submitting...' : 'Complete Check-in'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info */}
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="text-center text-xs sm:text-sm text-slate-600 space-y-2 sm:space-y-3">
                <p className="leading-relaxed">
                  This daily check-in helps track your recovery progress and provides 
                  your medical team with important information about your symptoms.
                </p>
                <p className="leading-relaxed">
                  All responses are confidential and help improve your treatment plan.
                </p>
                {questionsSource === 'ai' && (
                  <div className="mt-3 flex items-center justify-center space-x-2 text-xs text-blue-600 bg-blue-50 rounded-lg p-2">
                    <Brain className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="text-center leading-relaxed">Questions personalized by AI based on your recovery history</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};