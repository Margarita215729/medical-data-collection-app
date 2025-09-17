import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Textarea } from './ui/textarea';
import { useScreenSize } from './ui/use-mobile';
import { Patient, MedicalData } from '../App';
import { projectId } from '../utils/supabase/info';
import { ArrowLeft, Save, Activity, Eye, Brain, Zap, Ear, MessageCircle, Heart, Stethoscope, Smile, Frown, FileText } from 'lucide-react';

interface MedicalDataFormProps {
  patient: Patient;
  accessToken: string;
  onBack: () => void;
}

export function MedicalDataForm({ patient, accessToken, onBack }: MedicalDataFormProps) {
  const [medicalData, setMedicalData] = useState<MedicalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('pcss');
  const screenSize = useScreenSize();

  useEffect(() => {
    loadMedicalData();
  }, []);

  const loadMedicalData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-094289b0/patients/${patient.anonymousId}/medical`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        setMedicalData(data.medicalData);
      } else {
        console.error('Error loading medical data:', data.error);
        alert(data.error || 'Error loading medical data');
      }
    } catch (error) {
      console.error('Error loading medical data:', error);
      alert('Server connection error');
    } finally {
      setLoading(false);
    }
  };

  const saveMedicalData = async (sectionData: any, section: string) => {
    setSaving(true);
    try {
      const updateData = {
        [section]: sectionData
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-094289b0/patients/${patient.anonymousId}/medical`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(updateData)
        }
      );

      const data = await response.json();
      
      if (data.success) {
        // Обновляем локальное состояние
        setMedicalData(prev => prev ? {
          ...prev,
          [section]: sectionData,
          lastUpdated: new Date().toISOString()
        } : null);
        alert('Data saved successfully');
      } else {
        alert(data.error || 'Error saving data');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Server connection error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 sm:h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
          <p className="text-slate-600 text-sm sm:text-base">Loading medical data...</p>
        </div>
      </div>
    );
  }

  const PCSSForm = () => {
    const [symptoms, setSymptoms] = useState(medicalData?.pcss?.symptoms || {});
    
    const symptomsList = [
      'Headache',
      'Nausea',
      'Vomiting',
      'Balance problems',
      'Dizziness',
      'Fatigue',
      'Trouble falling asleep',
      'Sleeping more than usual',
      'Sensitivity to light',
      'Sensitivity to noise',
      'Irritability',
      'Sadness',
      'Nervousness',
      'Feeling more emotional',
      'Numbness or tingling',
      'Feeling slowed down',
      'Difficulty concentrating',
      'Difficulty remembering',
      'Visual problems'
    ];

    const handleSymptomChange = (symptom: string, value: number) => {
      setSymptoms(prev => ({
        ...prev,
        [symptom]: value
      }));
    };

    const calculateTotal = () => {
      return Object.values(symptoms).reduce((sum: number, value: any) => sum + (Number(value) || 0), 0);
    };

    const handleSave = () => {
      const pcssData = {
        symptoms,
        totalScore: calculateTotal()
      };
      saveMedicalData(pcssData, 'pcss');
    };

    return (
      <Card>
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <Brain className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>PCSS - Post-Concussion Symptom Scale</span>
          </CardTitle>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Rate each symptom on a scale from 0 (none) to 6 (severe)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {symptomsList.map((symptom) => (
              <div key={symptom} className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium">{symptom}</Label>
                <Select
                  value={symptoms[symptom]?.toString() || '0'}
                  onValueChange={(value) => handleSymptomChange(symptom, parseInt(value))}
                >
                  <SelectTrigger className="h-11 sm:h-10 text-sm sm:text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5, 6].map(score => (
                      <SelectItem key={score} value={score.toString()}>
                        {score} - {score === 0 ? 'None' : score <= 2 ? 'Mild' : score <= 4 ? 'Moderate' : 'Severe'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          
          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-900">
              Total Score: {calculateTotal()} / 114
            </p>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full h-11 sm:h-10 text-sm sm:text-base">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save PCSS'}
          </Button>
        </CardContent>
      </Card>
    );
  };

  const VOMSForm = () => {
    const [vomsData, setVomsData] = useState(medicalData?.voms || {
      npcDistance: '',
      symptomsScore: '',
      items: {}
    });

    const vomsTests = [
      { key: 'smooth_pursuits', name: 'Smooth Pursuits', description: 'Horizontal and vertical' },
      { key: 'saccades', name: 'Saccades', description: 'Rapid eye movements' },
      { key: 'vor_horizontal', name: 'VOR Horizontal', description: 'Vestibulo-ocular reflex' },
      { key: 'vor_vertical', name: 'VOR Vertical', description: 'Vestibulo-ocular reflex' },
      { key: 'vms', name: 'VMS', description: 'Visual Motion Sensitivity' }
    ];

    const handleVomsChange = (field: string, value: any) => {
      setVomsData(prev => ({
        ...prev,
        [field]: value
      }));
    };

    const handleItemChange = (testKey: string, field: string, value: any) => {
      setVomsData(prev => ({
        ...prev,
        items: {
          ...prev.items,
          [testKey]: {
            ...prev.items[testKey],
            [field]: value
          }
        }
      }));
    };

    const handleSave = () => {
      saveMedicalData(vomsData, 'voms');
    };

    return (
      <Card>
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>VOMS - Vestibular/Ocular Motor Screening</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium">Near Point of Convergence (cm)</Label>
              <Input
                type="number"
                value={vomsData.npcDistance}
                onChange={(e) => handleVomsChange('npcDistance', e.target.value)}
                placeholder="Enter distance"
                className="h-11 sm:h-10 text-sm sm:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium">Total Symptom Score</Label>
              <Input
                type="number"
                value={vomsData.symptomsScore}
                onChange={(e) => handleVomsChange('symptomsScore', e.target.value)}
                placeholder="0-10"
                className="h-11 sm:h-10 text-sm sm:text-base"
              />
            </div>
          </div>

          {vomsTests.map((test) => (
            <div key={test.key} className="border rounded-lg p-3 sm:p-4 space-y-3">
              <h4 className="font-medium text-sm sm:text-base">{test.name}</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{test.description}</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium">Symptoms (0-10)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={vomsData.items[test.key]?.symptoms || ''}
                    onChange={(e) => handleItemChange(test.key, 'symptoms', e.target.value)}
                    placeholder="0"
                    className="h-11 sm:h-10 text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium">Dizziness</Label>
                  <Select
                    value={vomsData.items[test.key]?.dizziness || ''}
                    onValueChange={(value) => handleItemChange(test.key, 'dizziness', value)}
                  >
                    <SelectTrigger className="h-11 sm:h-10 text-sm sm:text-base">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium">Nausea</Label>
                  <Select
                    value={vomsData.items[test.key]?.nausea || ''}
                    onValueChange={(value) => handleItemChange(test.key, 'nausea', value)}
                  >
                    <SelectTrigger className="h-11 sm:h-10 text-sm sm:text-base">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}

          <Button onClick={handleSave} disabled={saving} className="w-full h-11 sm:h-10 text-sm sm:text-base">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save VOMS'}
          </Button>
        </CardContent>
      </Card>
    );
  };

  // DHI Form Component
  const DHIForm = () => {
    const dhiQuestions = [
      "Does looking up increase your problem?",
      "Because of your problem, do you feel frustrated?",
      "Because of your problem, do you restrict your travel for business or recreation?",
      "Does walking down the aisle of a supermarket increase your problems?",
      "Because of your problem, do you have difficulty getting into or out of bed?",
      "Does your problem significantly restrict your participation in social activities?",
      "Because of your problem, do you have difficulty reading?",
      "Does performing more ambitious activities like sports, dancing, household chores increase your problem?",
      "Because of your problem, are you afraid to leave your home without having someone accompany you?",
      "Because of your problem, have you been embarrassed in front of others?",
      "Do quick movements of your head increase your problem?",
      "Because of your problem, do you avoid heights?",
      "Does turning over in bed increase your problem?",
      "Because of your problem, is it difficult for you to do strenuous housework or yard work?",
      "Because of your problem, are you afraid people may think you are intoxicated?",
      "Because of your problem, is it difficult for you to go for a walk by yourself?",
      "Does walking down a sidewalk increase your problem?",
      "Because of your problem, is it difficult for you to concentrate?",
      "Because of your problem, is it difficult for you to walk around your house in the dark?",
      "Because of your problem, are you afraid to stay home alone?",
      "Because of your problem, do you feel handicapped?",
      "Has the problem placed stress on your relationships with members of your family or friends?",
      "Because of your problem, are you depressed?",
      "Does your problem interfere with your job or household responsibilities?",
      "Does bending over increase your problem?"
    ];

    const handleDHIChange = (questionIndex: number, value: string) => {
      const newResponses = { ...medicalData?.dhi?.responses || {} };
      newResponses[questionIndex] = parseInt(value);
      
      // Calculate total score (Yes=4, Sometimes=2, No=0)
      const totalScore = Object.values(newResponses).reduce((sum: number, score: any) => sum + (score || 0), 0);
      
      setMedicalData(prev => ({
        ...prev,
        dhi: {
          responses: newResponses,
          totalScore
        }
      }));
    };

    const handleSave = () => {
      saveMedicalData(medicalData?.dhi, 'dhi');
    };

    return (
      <Card>
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Dizziness Handicap Inventory (DHI)</span>
          </CardTitle>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Please select the response that best describes your situation for each question.
            Total Score: {medicalData?.dhi?.totalScore || 0}/100
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {dhiQuestions.map((question, index) => (
            <div key={index} className="space-y-2 sm:space-y-3">
              <Label className="text-xs sm:text-sm font-medium leading-relaxed">{index + 1}. {question}</Label>
              <RadioGroup
                value={medicalData?.dhi?.responses?.[index]?.toString() || ''}
                onValueChange={(value) => handleDHIChange(index, value)}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded hover:bg-slate-50 min-h-[44px] touch-manipulation">
                  <RadioGroupItem 
                    value="4" 
                    id={`dhi-${index}-yes`} 
                    className="border-2 border-slate-400 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0" 
                  />
                  <Label htmlFor={`dhi-${index}-yes`} className="cursor-pointer text-xs sm:text-sm leading-relaxed flex-1">Yes (4)</Label>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded hover:bg-slate-50 min-h-[44px] touch-manipulation">
                  <RadioGroupItem 
                    value="2" 
                    id={`dhi-${index}-sometimes`} 
                    className="border-2 border-slate-400 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0" 
                  />
                  <Label htmlFor={`dhi-${index}-sometimes`} className="cursor-pointer text-xs sm:text-sm leading-relaxed flex-1">Sometimes (2)</Label>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded hover:bg-slate-50 min-h-[44px] touch-manipulation">
                  <RadioGroupItem 
                    value="0" 
                    id={`dhi-${index}-no`} 
                    className="border-2 border-slate-400 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0" 
                  />
                  <Label htmlFor={`dhi-${index}-no`} className="cursor-pointer text-xs sm:text-sm leading-relaxed flex-1">No (0)</Label>
                </div>
              </RadioGroup>
            </div>
          ))}
          
          <Button onClick={handleSave} disabled={saving} className="w-full h-11 sm:h-10 text-sm sm:text-base">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save DHI'}
          </Button>
        </CardContent>
      </Card>
    );
  };

  // HIT-6 Form Component
  const HIT6Form = () => {
    const hit6Questions = [
      "When you have headaches, how often is the pain severe?",
      "How often do headaches limit your ability to do usual daily activities?",
      "When you have a headache, how often do you wish you could lie down?",
      "In the past 4 weeks, how often have you felt too tired to do work or daily activities because of your headaches?",
      "In the past 4 weeks, how often have you felt fed up or irritated because of your headaches?",
      "In the past 4 weeks, how often did headaches limit your ability to concentrate on work or daily activities?"
    ];

    const hit6Options = [
      { value: 6, label: "Never" },
      { value: 8, label: "Seldom" },
      { value: 10, label: "Sometimes" },
      { value: 11, label: "Very Often" },
      { value: 13, label: "Always" }
    ];

    const handleHIT6Change = (questionIndex: number, value: string) => {
      const newResponses = { ...medicalData?.hit6?.responses || {} };
      newResponses[questionIndex] = parseInt(value);
      
      const totalScore = Object.values(newResponses).reduce((sum: number, score: any) => sum + (score || 0), 0);
      
      setMedicalData(prev => ({
        ...prev,
        hit6: {
          responses: newResponses,
          totalScore
        }
      }));
    };

    const handleSave = () => {
      saveMedicalData(medicalData?.hit6, 'hit6');
    };

    return (
      <Card>
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>HIT-6 - Headache Impact Test</span>
          </CardTitle>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Please select the response that best describes your headache situation.
            Total Score: {medicalData?.hit6?.totalScore || 0}/78
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {hit6Questions.map((question, index) => (
            <div key={index} className="space-y-2 sm:space-y-3">
              <Label className="text-xs sm:text-sm font-medium leading-relaxed">{index + 1}. {question}</Label>
              <RadioGroup
                value={medicalData?.hit6?.responses?.[index]?.toString() || ''}
                onValueChange={(value) => handleHIT6Change(index, value)}
                className="space-y-2"
              >
                {hit6Options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded hover:bg-slate-50 min-h-[44px] touch-manipulation">
                    <RadioGroupItem 
                      value={option.value.toString()} 
                      id={`hit6-${index}-${optIndex}`} 
                      className="border-2 border-slate-400 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0" 
                    />
                    <Label htmlFor={`hit6-${index}-${optIndex}`} className="cursor-pointer text-xs sm:text-sm leading-relaxed flex-1">
                      {option.label} ({option.value})
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
          
          <Button onClick={handleSave} disabled={saving} className="w-full h-11 sm:h-10 text-sm sm:text-base">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save HIT-6'}
          </Button>
        </CardContent>
      </Card>
    );
  };

  // PHQ-9 Form Component
  const PHQ9Form = () => {
    const phq9Questions = [
      "Little interest or pleasure in doing things",
      "Feeling down, depressed, or hopeless",
      "Trouble falling or staying asleep, or sleeping too much",
      "Feeling tired or having little energy",
      "Poor appetite or overeating",
      "Feeling bad about yourself - or that you are a failure or have let yourself or your family down",
      "Trouble concentrating on things, such as reading the newspaper or watching television",
      "Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual",
      "Thoughts that you would be better off dead, or of hurting yourself"
    ];

    const phq9Options = [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" }
    ];

    const handlePHQ9Change = (questionIndex: number, value: string) => {
      const newResponses = { ...medicalData?.phq9?.responses || {} };
      newResponses[questionIndex] = parseInt(value);
      
      const totalScore = Object.values(newResponses).reduce((sum: number, score: any) => sum + (score || 0), 0);
      
      setMedicalData(prev => ({
        ...prev,
        phq9: {
          responses: newResponses,
          totalScore
        }
      }));
    };

    const handleSave = () => {
      saveMedicalData(medicalData?.phq9, 'phq9');
    };

    return (
      <Card>
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <Frown className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>PHQ-9 - Patient Health Questionnaire</span>
          </CardTitle>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Over the last 2 weeks, how often have you been bothered by any of the following problems?
            Total Score: {medicalData?.phq9?.totalScore || 0}/27
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {phq9Questions.map((question, index) => (
            <div key={index} className="space-y-2 sm:space-y-3">
              <Label className="text-xs sm:text-sm font-medium leading-relaxed">{index + 1}. {question}</Label>
              <RadioGroup
                value={medicalData?.phq9?.responses?.[index]?.toString() || ''}
                onValueChange={(value) => handlePHQ9Change(index, value)}
                className="space-y-2"
              >
                {phq9Options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded hover:bg-slate-50 min-h-[44px] touch-manipulation">
                    <RadioGroupItem 
                      value={option.value.toString()} 
                      id={`phq9-${index}-${optIndex}`} 
                      className="border-2 border-slate-400 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0" 
                    />
                    <Label htmlFor={`phq9-${index}-${optIndex}`} className="cursor-pointer text-xs sm:text-sm leading-relaxed flex-1">
                      {option.label} ({option.value})
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
          
          <Button onClick={handleSave} disabled={saving} className="w-full h-11 sm:h-10 text-sm sm:text-base">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save PHQ-9'}
          </Button>
        </CardContent>
      </Card>
    );
  };

  // GAD-7 Form Component
  const GAD7Form = () => {
    const gad7Questions = [
      "Feeling nervous, anxious, or on edge",
      "Not being able to stop or control worrying",
      "Worrying too much about different things",
      "Trouble relaxing",
      "Being so restless that it is hard to sit still",
      "Becoming easily annoyed or irritable",
      "Feeling afraid, as if something awful might happen"
    ];

    const gad7Options = [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" }
    ];

    const handleGAD7Change = (questionIndex: number, value: string) => {
      const newResponses = { ...medicalData?.gad7?.responses || {} };
      newResponses[questionIndex] = parseInt(value);
      
      const totalScore = Object.values(newResponses).reduce((sum: number, score: any) => sum + (score || 0), 0);
      
      setMedicalData(prev => ({
        ...prev,
        gad7: {
          responses: newResponses,
          totalScore
        }
      }));
    };

    const handleSave = () => {
      saveMedicalData(medicalData?.gad7, 'gad7');
    };

    return (
      <Card>
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <Smile className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>GAD-7 - Generalized Anxiety Disorder</span>
          </CardTitle>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Over the last 2 weeks, how often have you been bothered by the following problems?
            Total Score: {medicalData?.gad7?.totalScore || 0}/21
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {gad7Questions.map((question, index) => (
            <div key={index} className="space-y-2 sm:space-y-3">
              <Label className="text-xs sm:text-sm font-medium leading-relaxed">{index + 1}. {question}</Label>
              <RadioGroup
                value={medicalData?.gad7?.responses?.[index]?.toString() || ''}
                onValueChange={(value) => handleGAD7Change(index, value)}
                className="space-y-2"
              >
                {gad7Options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded hover:bg-slate-50 min-h-[44px] touch-manipulation">
                    <RadioGroupItem 
                      value={option.value.toString()} 
                      id={`gad7-${index}-${optIndex}`} 
                      className="border-2 border-slate-400 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0" 
                    />
                    <Label htmlFor={`gad7-${index}-${optIndex}`} className="cursor-pointer text-xs sm:text-sm leading-relaxed flex-1">
                      {option.label} ({option.value})
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
          
          <Button onClick={handleSave} disabled={saving} className="w-full h-11 sm:h-10 text-sm sm:text-base">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save GAD-7'}
          </Button>
        </CardContent>
      </Card>
    );
  };

  const RehabilitationForm = () => {
    const [rehabData, setRehabData] = useState(medicalData?.rehabilitationData || {});

    const rehabTypes = [
      { key: 'vestibular', name: 'Vestibular', icon: Activity, description: 'Dizziness, balance, motion' },
      { key: 'visual', name: 'Visual/Oculomotor', icon: Eye, description: 'Blurred vision, eye strain' },
      { key: 'headache', name: 'Headache', icon: Zap, description: 'Post-traumatic headaches' },
      { key: 'auditory', name: 'Auditory', icon: Ear, description: 'Tinnitus, sound sensitivity' },
      { key: 'speech', name: 'Speech/Cognitive', icon: MessageCircle, description: 'Attention, memory, organization' },
      { key: 'exertional', name: 'Exertional Intolerance', icon: Heart, description: 'Autonomic dysregulation' },
      { key: 'cervical', name: 'Cervical', icon: Stethoscope, description: 'Neck-related symptoms' }
    ];

    const handleRehabChange = (type: string, field: string, value: any) => {
      setRehabData(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          [field]: value
        }
      }));
    };

    const handleSave = () => {
      saveMedicalData(rehabData, 'rehabilitationData');
    };

    return (
      <Card>
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Rehabilitation Programs</CardTitle>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Track progress across different rehabilitation areas
          </p>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {rehabTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <div key={type.key} className="border rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
                <div className="flex items-start sm:items-center space-x-2 sm:space-x-3">
                  <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0 mt-1 sm:mt-0" />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-sm sm:text-base">{type.name}</h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{type.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium">Status</Label>
                    <Select
                      value={rehabData[type.key]?.status || ''}
                      onValueChange={(value) => handleRehabChange(type.key, 'status', value)}
                    >
                      <SelectTrigger className="h-11 sm:h-10 text-sm sm:text-base">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium">Progress (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={rehabData[type.key]?.progress || ''}
                      onChange={(e) => handleRehabChange(type.key, 'progress', e.target.value)}
                      placeholder="0-100"
                      className="h-11 sm:h-10 text-sm sm:text-base"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium">Dosage/Frequency</Label>
                    <Input
                      value={rehabData[type.key]?.dosage || ''}
                      onChange={(e) => handleRehabChange(type.key, 'dosage', e.target.value)}
                      placeholder="e.g., 15-30 min daily"
                      className="h-11 sm:h-10 text-sm sm:text-base"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium">Notes</Label>
                  <Textarea
                    value={rehabData[type.key]?.notes || ''}
                    onChange={(e) => handleRehabChange(type.key, 'notes', e.target.value)}
                    placeholder="Notes on interventions, patient response, changes..."
                    rows={screenSize === 'mobile' ? 2 : 3}
                    className="text-sm sm:text-base"
                  />
                </div>
              </div>
            );
          })}

          <Button onClick={handleSave} disabled={saving} className="w-full h-11 sm:h-10 text-sm sm:text-base">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : screenSize === 'mobile' ? 'Save Rehab Data' : 'Save Rehabilitation Data'}
          </Button>
        </CardContent>
      </Card>
    );
  };

  // Notes Form Component
  const NotesForm = () => {
    const [notesData, setNotesData] = useState(medicalData?.doctorNotes || {
      clinicalNotes: '',
      treatmentPlan: '',
      progressNotes: '',
      recommendations: '',
      followUp: ''
    });

    const handleNotesChange = (field: string, value: string) => {
      setNotesData(prev => ({
        ...prev,
        [field]: value
      }));
    };

    const handleSave = () => {
      saveMedicalData(notesData, 'doctorNotes');
    };

    return (
      <Card>
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Doctor's Notes & Assessment</span>
          </CardTitle>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Clinical notes, treatment plans, and recommendations for patient care
          </p>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-medium">Clinical Notes</Label>
            <Textarea
              value={notesData.clinicalNotes}
              onChange={(e) => handleNotesChange('clinicalNotes', e.target.value)}
              placeholder="Enter clinical observations, symptoms, and examination findings..."
              className="min-h-24 text-sm resize-vertical"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-medium">Treatment Plan</Label>
            <Textarea
              value={notesData.treatmentPlan}
              onChange={(e) => handleNotesChange('treatmentPlan', e.target.value)}
              placeholder="Outline current treatment plan and interventions..."
              className="min-h-24 text-sm resize-vertical"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-medium">Progress Notes</Label>
            <Textarea
              value={notesData.progressNotes}
              onChange={(e) => handleNotesChange('progressNotes', e.target.value)}
              placeholder="Document patient progress and response to treatment..."
              className="min-h-24 text-sm resize-vertical"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-medium">Recommendations</Label>
            <Textarea
              value={notesData.recommendations}
              onChange={(e) => handleNotesChange('recommendations', e.target.value)}
              placeholder="Specific recommendations for continued care or modifications..."
              className="min-h-20 text-sm resize-vertical"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-medium">Follow-up Plans</Label>
            <Textarea
              value={notesData.followUp}
              onChange={(e) => handleNotesChange('followUp', e.target.value)}
              placeholder="Schedule for follow-up appointments and monitoring..."
              className="min-h-16 text-sm resize-vertical"
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full h-11 sm:h-10 text-sm sm:text-base">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Doctor Notes'}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex items-start space-x-2 sm:space-x-4 min-w-0 flex-1">
          <Button variant="outline" onClick={onBack} className="px-2 sm:px-3 flex-shrink-0">
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-semibold truncate">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              ID: {patient.anonymousId}
            </p>
          </div>
        </div>
        {medicalData?.lastUpdated && (
          <div className="text-xs sm:text-sm text-slate-600 self-start sm:self-center">
            Updated: {new Date(medicalData.lastUpdated).toLocaleDateString()}
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full ${screenSize === 'mobile' ? 'grid-cols-4 h-auto' : 'grid-cols-8'}`}>
          <TabsTrigger value="pcss" className="text-xs sm:text-sm px-1 sm:px-3">PCSS</TabsTrigger>
          <TabsTrigger value="voms" className="text-xs sm:text-sm px-1 sm:px-3">VOMS</TabsTrigger>
          <TabsTrigger value="dhi" className="text-xs sm:text-sm px-1 sm:px-3">DHI</TabsTrigger>
          <TabsTrigger value="hit6" className="text-xs sm:text-sm px-1 sm:px-3">HIT-6</TabsTrigger>
          {screenSize === 'mobile' && (
            <>
              <TabsTrigger value="phq9" className="text-xs px-1">PHQ-9</TabsTrigger>
              <TabsTrigger value="gad7" className="text-xs px-1">GAD-7</TabsTrigger>
              <TabsTrigger value="rehabilitation" className="text-xs px-1">Rehab</TabsTrigger>
              <TabsTrigger value="notes" className="text-xs px-1">Notes</TabsTrigger>
            </>
          )}
          {screenSize !== 'mobile' && (
            <>
              <TabsTrigger value="phq9" className="text-sm px-3">PHQ-9</TabsTrigger>
              <TabsTrigger value="gad7" className="text-sm px-3">GAD-7</TabsTrigger>
              <TabsTrigger value="rehabilitation" className="text-sm px-3">Rehab</TabsTrigger>
              <TabsTrigger value="notes" className="text-sm px-3">Notes</TabsTrigger>
            </>
          )}
        </TabsList>
        
        <TabsContent value="pcss" className="mt-4 sm:mt-6">
          <PCSSForm />
        </TabsContent>
        
        <TabsContent value="voms" className="mt-4 sm:mt-6">
          <VOMSForm />
        </TabsContent>
        
        <TabsContent value="dhi" className="mt-4 sm:mt-6">
          <DHIForm />
        </TabsContent>
        
        <TabsContent value="hit6" className="mt-4 sm:mt-6">
          <HIT6Form />
        </TabsContent>
        
        <TabsContent value="phq9" className="mt-4 sm:mt-6">
          <PHQ9Form />
        </TabsContent>
        
        <TabsContent value="gad7" className="mt-4 sm:mt-6">
          <GAD7Form />
        </TabsContent>
        
        <TabsContent value="rehabilitation" className="mt-4 sm:mt-6">
          <RehabilitationForm />
        </TabsContent>
        
        <TabsContent value="notes" className="mt-4 sm:mt-6">
          <NotesForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}