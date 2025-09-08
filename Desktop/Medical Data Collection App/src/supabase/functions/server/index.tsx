import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

// GitHub Models API integration
class GitHubModelsService {
  private apiKey: string;
  private baseUrl: string = 'https://models.inference.ai.azure.com';
  private model: string = 'gpt-4o';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async chatCompletion(messages: any[]): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.3,
          max_tokens: 1500,
          top_p: 0.9,
        }),
      });

      if (!response.ok) {
        throw new Error(`GitHub Models API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error('GitHub Models API error:', error);
      throw new Error('Failed to get AI response');
    }
  }

  async analyzeMedicalData(symptoms: string[], patientData: any, assessmentScores: any): Promise<any> {
    const systemPrompt = `You are a specialized medical AI assistant for concussion recovery analysis. 

Your role is to:
1. Analyze patient symptoms and assessment scores
2. Provide evidence-based recommendations
3. Identify when medical professional review is needed
4. Prioritize patient safety above all else

Guidelines:
- Always recommend doctor consultation for concerning symptoms
- Base recommendations on established concussion rehabilitation protocols
- Consider individual patient factors (age, injury timeline, etc.)
- Provide specific, actionable advice
- Include appropriate precautions and contraindications

Assessment Scales Context:
- PCSS: Post-Concussion Symptom Scale (0-132, higher = more symptoms)
- DHI: Dizziness Handicap Inventory (0-100, higher = more disability)
- HIT-6: Headache Impact Test (36-78, >60 = severe impact)
- PHQ-9: Depression screening (0-27, >15 = severe)
- GAD-7: Anxiety screening (0-21, >15 = severe)

Respond with structured JSON containing recommendations, risk assessment, and next steps.`;

    const userPrompt = `Analyze this concussion patient data:

Symptoms: ${symptoms.join(', ')}

Patient Information:
${patientData ? Object.entries(patientData)
  .filter(([_, value]) => value !== undefined)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n') : 'No additional patient data provided'}

Assessment Scores:
${assessmentScores ? Object.entries(assessmentScores)
  .filter(([_, value]) => value !== undefined)
  .map(([key, value]) => `- ${key.toUpperCase()}: ${value}`)
  .join('\n') : 'No assessment scores provided'}

Please provide a comprehensive analysis with specific recommendations for this patient's recovery plan. 
Return your response as valid JSON with the following structure:
{
  "recommendations": [
    {
      "category": "exercise|lifestyle|monitoring|medical_attention|rehabilitation",
      "title": "string",
      "description": "string",
      "priority": "low|medium|high|urgent",
      "timeframe": "string",
      "precautions": ["string"]
    }
  ],
  "riskAssessment": {
    "level": "low|medium|high",
    "factors": ["string"]
  },
  "nextSteps": ["string"],
  "doctorReviewRequired": boolean,
  "confidence": number
}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    try {
      const response = await this.chatCompletion(messages);
      return this.parseAnalysisResponse(response);
    } catch (error) {
      console.error('Medical analysis error:', error);
      throw new Error('Failed to analyze medical data');
    }
  }

  private parseAnalysisResponse(aiResponse: string): any {
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.log('Could not parse JSON response, using default structure');
    }

    // Fallback: create structured response from text
    return {
      recommendations: [
        {
          category: 'medical_attention',
          title: 'AI Analysis Available',
          description: aiResponse.substring(0, 500) + (aiResponse.length > 500 ? '...' : ''),
          priority: 'medium',
          timeframe: 'As recommended by healthcare provider',
          precautions: ['Always consult with healthcare provider before following any recommendations']
        }
      ],
      riskAssessment: {
        level: 'medium',
        factors: ['Requires professional medical evaluation']
      },
      nextSteps: [
        'Review recommendations with healthcare provider',
        'Continue monitoring symptoms',
        'Follow up as directed'
      ],
      doctorReviewRequired: true,
      confidence: 0.7
    };
  }

  async generatePersonalizedResponse(symptoms: string[], patientInfo: any, medicalData: any): Promise<string> {
    const systemPrompt = `You are a compassionate AI medical assistant specializing in concussion recovery. 
    
Your role is to:
- Provide supportive, personalized responses to patients
- Acknowledge their symptoms with empathy
- Offer practical, evidence-based advice
- Encourage appropriate medical follow-up when needed
- Use clear, non-technical language

Guidelines:
- Always be supportive and understanding
- Provide practical tips patients can implement
- Emphasize the importance of professional medical care
- Avoid making definitive diagnoses
- Focus on symptom management and recovery strategies`;

    const userPrompt = `A concussion patient is reporting these symptoms: ${symptoms.join(', ')}

Patient context:
${patientInfo ? Object.entries(patientInfo)
  .filter(([_, value]) => value !== undefined)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n') : 'Limited patient information available'}

Recent medical data:
${medicalData ? `Last assessment: ${medicalData.lastUpdated}` : 'No recent assessments'}

Please provide a compassionate, personalized response that:
1. Acknowledges their symptoms with empathy
2. Provides 2-3 practical management strategies
3. Explains when to seek medical attention
4. Encourages continued monitoring and follow-up

Keep the response conversational, supportive, and under 400 words.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    return await this.chatCompletion(messages);
  }
}

const app = new Hono();

app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}));

app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Predefined medical staff accounts
const MEDICAL_STAFF = [
  { id: 'staff_1', email: 'doctor1@medical.com', password: 'medical2024!', name: 'Dr. Johnson', role: 'Neurologist' },
  { id: 'staff_2', email: 'doctor2@medical.com', password: 'medical2024!', name: 'Dr. Williams', role: 'Physical Therapist' },
  { id: 'staff_3', email: 'doctor3@medical.com', password: 'medical2024!', name: 'Dr. Brown', role: 'Speech Therapist' },
  { id: 'staff_4', email: 'doctor4@medical.com', password: 'medical2024!', name: 'Dr. Davis', role: 'Psychologist' }
];

// Initialize staff accounts on server startup
async function initializeStaff() {
  console.log('Initializing medical staff...');
  for (const staff of MEDICAL_STAFF) {
    try {
      // Check if user already exists
      const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) {
        console.log('Error getting user list:', listError);
        continue;
      }

      const existingUser = existingUsers.users.find(user => user.email === staff.email);
      
      if (existingUser) {
        console.log(`User ${staff.email} already exists`);
        continue;
      }

      const { data, error } = await supabase.auth.admin.createUser({
        email: staff.email,
        password: staff.password,
        user_metadata: { 
          name: staff.name, 
          role: staff.role,
          staff_id: staff.id
        },
        email_confirm: true // Automatically confirm email
      });
      
      if (error) {
        console.log(`Error creating user ${staff.email}:`, error.message);
      } else {
        console.log(`User ${staff.email} created successfully`);
      }
    } catch (error) {
      console.log(`Error creating ${staff.email}:`, error);
    }
  }
  console.log('Medical staff initialization completed');
}

// Generate anonymous ID
function generateAnonymousId(): string {
  return `PAT_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ML Analysis function for patient messages
async function analyzePatientMessage(message: string, medicalData: any, patientInfo: any) {
  const symptoms = extractSymptoms(message);
  const urgencyLevel = assessUrgency(message, symptoms);
  const recommendations = generateRecommendations(symptoms, medicalData, urgencyLevel);
  
  // Generate personalized response
  let response = `Thank you for sharing your current symptoms with me. Based on your description, I've identified several areas where we can focus your recovery efforts.\n\n`;
  
  if (urgencyLevel === 'high') {
    response += `⚠️ I notice some concerning symptoms in your description. While I'm here to support your recovery, I strongly recommend contacting your healthcare provider soon for a professional evaluation.\n\n`;
  }
  
  response += `Here's my analysis of your current situation:\n\n`;
  
  if (symptoms.length > 0) {
    response += `**Current Symptoms Detected:**\n`;
    symptoms.forEach(symptom => {
      response += `• ${symptom.name} (${symptom.severity} severity)\n`;
    });
    response += `\n`;
  }
  
  response += `I've prepared personalized treatment recommendations below based on established recovery protocols and your symptom profile. Remember to pace yourself and avoid activities that significantly worsen your symptoms.\n\n`;
  
  // Add daily questionnaire reminder
  const lastUpdate = medicalData?.lastUpdated ? new Date(medicalData.lastUpdated) : null;
  const daysSinceUpdate = lastUpdate ? Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)) : null;
  
  if (!lastUpdate || daysSinceUpdate > 1) {
    response += `📋 **Daily Check-in Reminder:** It's been ${daysSinceUpdate || 'several'} days since your last assessment. Regular monitoring helps track your progress and adjust your treatment plan. Consider completing a daily symptom questionnaire when you're ready.\n\n`;
  }
  
  response += `These recommendations will be reviewed by your medical team to ensure they're appropriate for your specific situation. Feel free to ask questions or share any concerns!`;
  
  return {
    response,
    recommendations,
    urgencyLevel,
    symptoms
  };
}

// Extract symptoms from patient message using keyword analysis
function extractSymptoms(message: string) {
  const lowerMessage = message.toLowerCase();
  const symptoms = [];
  
  // Symptom patterns with severity indicators
  const symptomPatterns = [
    {
      name: 'Headache',
      keywords: ['headache', 'head pain', 'migraine', 'head hurts'],
      severityKeywords: {
        high: ['severe', 'intense', 'excruciating', 'unbearable', 'worst'],
        medium: ['moderate', 'noticeable', 'bothering', 'persistent'],
        low: ['mild', 'slight', 'little', 'minor']
      }
    },
    {
      name: 'Dizziness',
      keywords: ['dizzy', 'dizziness', 'vertigo', 'spinning', 'unbalanced', 'lightheaded'],
      severityKeywords: {
        high: ['severe', 'constant', 'overwhelming', 'can\'t stand'],
        medium: ['moderate', 'frequent', 'noticeable'],
        low: ['mild', 'occasional', 'slight']
      }
    },
    {
      name: 'Nausea',
      keywords: ['nausea', 'nauseous', 'sick', 'queasy', 'vomiting', 'throw up'],
      severityKeywords: {
        high: ['severe', 'constant', 'vomiting', 'can\'t eat'],
        medium: ['moderate', 'frequent', 'bothering'],
        low: ['mild', 'slight', 'occasional']
      }
    },
    {
      name: 'Vision Problems',
      keywords: ['blurry', 'double vision', 'vision', 'eyes hurt', 'light sensitive', 'photophobia'],
      severityKeywords: {
        high: ['severe', 'constant', 'can\'t see', 'very blurry'],
        medium: ['moderate', 'noticeable', 'bothering'],
        low: ['mild', 'slight', 'sometimes']
      }
    },
    {
      name: 'Sleep Issues',
      keywords: ['sleep', 'tired', 'fatigue', 'exhausted', 'insomnia', 'can\'t sleep'],
      severityKeywords: {
        high: ['can\'t sleep', 'no sleep', 'exhausted', 'severe fatigue'],
        medium: ['trouble sleeping', 'tired often', 'moderate fatigue'],
        low: ['slightly tired', 'mild fatigue', 'little tired']
      }
    },
    {
      name: 'Cognitive Issues',
      keywords: ['memory', 'concentration', 'focus', 'confused', 'foggy', 'thinking'],
      severityKeywords: {
        high: ['can\'t remember', 'very confused', 'severe fog'],
        medium: ['trouble focusing', 'some memory issues', 'moderate fog'],
        low: ['slight confusion', 'mild fog', 'minor memory']
      }
    },
    {
      name: 'Mood Changes',
      keywords: ['depressed', 'anxious', 'irritable', 'mood', 'angry', 'sad', 'worried'],
      severityKeywords: {
        high: ['severe depression', 'severe anxiety', 'very irritable'],
        medium: ['moderate anxiety', 'somewhat depressed', 'often irritable'],
        low: ['mild anxiety', 'slightly sad', 'minor mood']
      }
    }
  ];
  
  symptomPatterns.forEach(pattern => {
    const hasSymptom = pattern.keywords.some(keyword => lowerMessage.includes(keyword));
    if (hasSymptom) {
      let severity = 'medium'; // default
      
      // Check for severity indicators
      for (const [level, keywords] of Object.entries(pattern.severityKeywords)) {
        if (keywords.some(keyword => lowerMessage.includes(keyword))) {
          severity = level;
          break;
        }
      }
      
      symptoms.push({
        name: pattern.name,
        severity,
        detected: true
      });
    }
  });
  
  return symptoms;
}

// Assess urgency level based on message content
function assessUrgency(message: string, symptoms: any[]) {
  const lowerMessage = message.toLowerCase();
  
  // High urgency indicators
  const highUrgencyKeywords = [
    'emergency', 'severe', 'unbearable', 'can\'t function', 'getting worse',
    'vomiting', 'can\'t see', 'can\'t walk', 'confused', 'lost consciousness',
    'seizure', 'very dizzy', 'severe headache', 'can\'t sleep at all'
  ];
  
  // Check for high urgency
  if (highUrgencyKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'high';
  }
  
  // Check for multiple severe symptoms
  const severeSymptoms = symptoms.filter(s => s.severity === 'high');
  if (severeSymptoms.length >= 2) {
    return 'high';
  }
  
  // Medium urgency for persistent symptoms
  const mediumUrgencyKeywords = [
    'persistent', 'not improving', 'worse', 'bothering', 'interfering'
  ];
  
  if (mediumUrgencyKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'medium';
  }
  
  return 'low';
}

// Machine Learning Feedback Processing System
async function processFeedbackForLearning(reviewedResponse: any, doctorId: string) {
  try {
    console.log('🧠 Processing feedback for ML improvement...');
    
    // Store feedback training data
    const trainingData = {
      originalSymptoms: reviewedResponse.symptoms,
      originalRecommendations: reviewedResponse.recommendations,
      doctorApproved: reviewedResponse.doctorApproved,
      doctorNotes: reviewedResponse.doctorNotes,
      modifiedRecommendations: reviewedResponse.modifiedRecommendations,
      patientId: reviewedResponse.patientId,
      doctorId,
      timestamp: new Date().toISOString(),
      analysisMethod: reviewedResponse.analysisMethod,
      confidence: reviewedResponse.confidence
    };
    
    // Save to training dataset
    const trainingKey = `training_data_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await kv.set(trainingKey, trainingData);
    
    // Update model performance metrics
    await updateModelMetrics(reviewedResponse.doctorApproved, reviewedResponse.analysisMethod);
    
    // Update dynamic prompt optimization
    await optimizePrompts(trainingData);
    
    console.log('✅ Feedback processed for learning system');
  } catch (error) {
    console.error('❌ Error processing feedback for learning:', error);
  }
}

// Update model performance metrics
async function updateModelMetrics(approved: boolean, analysisMethod: string) {
  try {
    const metricsKey = `model_metrics_${analysisMethod}`;
    const existingMetrics = await kv.get(metricsKey) || {
      totalReviews: 0,
      approvedCount: 0,
      rejectedCount: 0,
      accuracyRate: 0,
      lastUpdated: new Date().toISOString()
    };
    
    existingMetrics.totalReviews += 1;
    if (approved) {
      existingMetrics.approvedCount += 1;
    } else {
      existingMetrics.rejectedCount += 1;
    }
    
    existingMetrics.accuracyRate = (existingMetrics.approvedCount / existingMetrics.totalReviews) * 100;
    existingMetrics.lastUpdated = new Date().toISOString();
    
    await kv.set(metricsKey, existingMetrics);
    
    console.log(`📊 Model metrics updated: ${analysisMethod} - ${existingMetrics.accuracyRate.toFixed(1)}% accuracy`);
  } catch (error) {
    console.error('Error updating model metrics:', error);
  }
}

// Dynamic prompt optimization based on feedback
async function optimizePrompts(trainingData: any) {
  try {
    // Collect successful patterns from approved recommendations
    if (trainingData.doctorApproved) {
      const successKey = `success_patterns_${Date.now()}`;
      await kv.set(successKey, {
        symptoms: trainingData.originalSymptoms,
        recommendations: trainingData.originalRecommendations,
        patientContext: trainingData.patientId,
        timestamp: trainingData.timestamp
      });
    }
    
    // Collect failure patterns from rejected recommendations
    if (!trainingData.doctorApproved && trainingData.modifiedRecommendations) {
      const failureKey = `failure_patterns_${Date.now()}`;
      await kv.set(failureKey, {
        originalSymptoms: trainingData.originalSymptoms,
        rejectedRecommendations: trainingData.originalRecommendations,
        correctedRecommendations: trainingData.modifiedRecommendations,
        doctorNotes: trainingData.doctorNotes,
        timestamp: trainingData.timestamp
      });
    }
    
    // Update few-shot learning examples
    await updateFewShotExamples();
    
  } catch (error) {
    console.error('Error optimizing prompts:', error);
  }
}

// Update few-shot learning examples based on successful cases
async function updateFewShotExamples() {
  try {
    const successPatterns = await kv.getByPrefix('success_patterns_');
    const recentSuccesses = successPatterns
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10); // Top 10 most recent successes
    
    const fewShotExamples = {
      examples: recentSuccesses,
      lastUpdated: new Date().toISOString(),
      version: `v${Date.now()}`
    };
    
    await kv.set('few_shot_examples', fewShotExamples);
    console.log('🎯 Few-shot examples updated with latest successful patterns');
  } catch (error) {
    console.error('Error updating few-shot examples:', error);
  }
}

// Enhanced GitHubModelsService with learning capabilities
class EnhancedGitHubModelsService extends GitHubModelsService {
  async analyzeMedicalDataWithLearning(symptoms: string[], patientData: any, assessmentScores: any): Promise<any> {
    // Get few-shot examples from successful cases
    const fewShotData = await kv.get('few_shot_examples');
    const successExamples = fewShotData?.examples || [];
    
    // Get failure patterns to avoid
    const failurePatterns = await kv.getByPrefix('failure_patterns_');
    const recentFailures = failurePatterns
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
    
    // Enhanced system prompt with learning examples
    const enhancedSystemPrompt = `You are a specialized medical AI assistant for concussion recovery analysis that learns from doctor feedback.

Your role is to:
1. Analyze patient symptoms and assessment scores
2. Provide evidence-based recommendations
3. Learn from previous doctor approvals/rejections
4. Prioritize patient safety above all else

LEARNING FROM SUCCESSFUL CASES:
${successExamples.length > 0 ? successExamples.map((example, i) => 
  `Example ${i + 1}:
  Symptoms: ${example.symptoms?.map(s => s.name).join(', ') || 'N/A'}
  Successful recommendations: ${example.recommendations?.map(r => r.title).join(', ') || 'N/A'}`
).join('\n\n') : 'No successful examples yet - use standard medical protocols.'}

COMMON MISTAKES TO AVOID:
${recentFailures.length > 0 ? recentFailures.map((failure, i) =>
  `Failure ${i + 1}:
  Original symptoms: ${failure.originalSymptoms?.map(s => s.name).join(', ') || 'N/A'}
  Rejected recommendations: ${failure.rejectedRecommendations?.map(r => r.title).join(', ') || 'N/A'}
  Doctor notes: ${failure.doctorNotes || 'No notes'}
  Corrected approach: ${failure.correctedRecommendations?.map(r => r.title).join(', ') || 'N/A'}`
).join('\n\n') : 'No failure patterns identified yet.'}

Guidelines:
- Always recommend doctor consultation for concerning symptoms
- Base recommendations on established concussion rehabilitation protocols
- Consider individual patient factors (age, injury timeline, etc.)
- Provide specific, actionable advice
- Include appropriate precautions and contraindications
- Learn from the successful and failure patterns above

Assessment Scales Context:
- PCSS: Post-Concussion Symptom Scale (0-132, higher = more symptoms)
- DHI: Dizziness Handicap Inventory (0-100, higher = more disability)
- HIT-6: Headache Impact Test (36-78, >60 = severe impact)
- PHQ-9: Depression screening (0-27, >15 = severe)
- GAD-7: Anxiety screening (0-21, >15 = severe)

Respond with structured JSON containing recommendations, risk assessment, and next steps.`;

    const userPrompt = `Analyze this concussion patient data:

Symptoms: ${symptoms.join(', ')}

Patient Information:
${patientData ? Object.entries(patientData)
  .filter(([_, value]) => value !== undefined)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n') : 'No additional patient data provided'}

Assessment Scores:
${assessmentScores ? Object.entries(assessmentScores)
  .filter(([_, value]) => value !== undefined)
  .map(([key, value]) => `- ${key.toUpperCase()}: ${value}`)
  .join('\n') : 'No assessment scores provided'}

Please provide a comprehensive analysis with specific recommendations for this patient's recovery plan. Use the learning examples above to provide better recommendations.`;

    const messages = [
      { role: 'system', content: enhancedSystemPrompt },
      { role: 'user', content: userPrompt }
    ];

    try {
      const response = await this.chatCompletion(messages);
      return this.parseAnalysisResponse(response);
    } catch (error) {
      console.error('Enhanced medical analysis error:', error);
      throw new Error('Failed to analyze medical data with learning');
    }
  }
}

// Generate treatment recommendations based on symptoms and medical history
function generateRecommendations(symptoms: any[], medicalData: any, urgencyLevel: string) {
  const recommendations = [];
  
  symptoms.forEach(symptom => {
    switch (symptom.name) {
      case 'Headache':
        recommendations.push({
          category: 'Pain Management',
          title: 'Headache Relief Protocol',
          description: `Apply ice to temples for 15-20 minutes. Rest in a dark, quiet room. Consider gentle neck stretches. Avoid screens if they worsen symptoms.`,
          severity: symptom.severity
        });
        break;
        
      case 'Dizziness':
        recommendations.push({
          category: 'Vestibular Training',
          title: 'Balance and Dizziness Management',
          description: `Practice gaze stabilization exercises. Avoid sudden head movements. Consider vestibular rehabilitation exercises. Sit down immediately when feeling dizzy.`,
          severity: symptom.severity
        });
        break;
        
      case 'Vision Problems':
        recommendations.push({
          category: 'Visual Therapy',
          title: 'Vision and Eye Comfort',
          description: `Reduce screen time and take frequent breaks. Use larger fonts and high contrast settings. Practice focusing exercises. Consider tinted glasses for light sensitivity.`,
          severity: symptom.severity
        });
        break;
        
      case 'Sleep Issues':
        recommendations.push({
          category: 'Sleep Hygiene',
          title: 'Sleep Quality Improvement',
          description: `Maintain consistent sleep schedule. Create calming bedtime routine. Limit caffeine and screens before bed. Consider gentle stretching or meditation.`,
          severity: symptom.severity
        });
        break;
        
      case 'Cognitive Issues':
        recommendations.push({
          category: 'Cognitive Training',
          title: 'Memory and Focus Enhancement',
          description: `Use memory aids and lists. Break tasks into smaller steps. Practice attention exercises gradually. Take regular breaks during mental activities.`,
          severity: symptom.severity
        });
        break;
        
      case 'Mood Changes':
        recommendations.push({
          category: 'Mental Health',
          title: 'Emotional Wellness Support',
          description: `Practice mindfulness and relaxation techniques. Maintain social connections. Consider counseling support. Monitor mood patterns daily.`,
          severity: symptom.severity
        });
        break;
    }
  });
  
  // Add general recommendations based on urgency
  if (urgencyLevel === 'high') {
    recommendations.push({
      category: 'Medical Care',
      title: 'Professional Medical Evaluation',
      description: 'Contact your healthcare provider for immediate assessment of your symptoms. These recommendations should supplement, not replace, professional medical care.',
      severity: 'high'
    });
  }
  
  // Add daily monitoring recommendation
  recommendations.push({
    category: 'Monitoring',
    title: 'Daily Symptom Tracking',
    description: 'Complete daily symptom assessments to track your progress and help your medical team adjust your treatment plan.',
    severity: 'low'
  });
  
  return recommendations;
}

// Route for server health check
app.get('/make-server-094289b0/health', async (c) => {
  return c.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Route for getting patient list
app.get('/make-server-094289b0/patients', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get all patients from demographic table
    const patients = await kv.getByPrefix('patient_demo_');
    
    return c.json({ patients: patients || [] });
  } catch (error) {
    console.log('Error getting patients:', error);
    return c.json({ error: 'Server error while getting patients' }, 500);
  }
});

// Route for adding new patient
app.post('/make-server-094289b0/patients', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { firstName, lastName, dateOfBirth, gender } = await c.req.json();
    
    if (!firstName || !lastName) {
      return c.json({ error: 'First name and last name are required' }, 400);
    }

    const anonymousId = generateAnonymousId();
    const timestamp = new Date().toISOString();

    // Save demographic data (name + anonymous ID)
    const demographicData = {
      anonymousId,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      createdAt: timestamp,
      createdBy: user.id
    };

    await kv.set(`patient_demo_${anonymousId}`, demographicData);

    // Initialize empty medical data
    const medicalData = {
      anonymousId,
      pcss: null,
      voms: null,
      dhi: null,
      hit6: null,
      phq9: null,
      gad7: null,
      rehabilitationData: {},
      lastUpdated: timestamp,
      updatedBy: user.id
    };

    await kv.set(`patient_medical_${anonymousId}`, medicalData);

    return c.json({ 
      success: true, 
      anonymousId,
      message: 'Patient added successfully' 
    });
  } catch (error) {
    console.log('Error adding patient:', error);
    return c.json({ error: 'Server error while adding patient' }, 500);
  }
});

// Route for getting patient medical data
app.get('/make-server-094289b0/patients/:anonymousId/medical', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const anonymousId = c.req.param('anonymousId');
    const medicalData = await kv.get(`patient_medical_${anonymousId}`);
    
    if (!medicalData) {
      return c.json({ error: 'Medical data not found' }, 404);
    }

    return c.json({ medicalData });
  } catch (error) {
    console.log('Error getting medical data:', error);
    return c.json({ error: 'Server error while getting medical data' }, 500);
  }
});

// Route for updating medical data
app.put('/make-server-094289b0/patients/:anonymousId/medical', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const anonymousId = c.req.param('anonymousId');
    const updateData = await c.req.json();

    // Get existing medical data
    const existingData = await kv.get(`patient_medical_${anonymousId}`);
    
    if (!existingData) {
      return c.json({ error: 'Patient not found' }, 404);
    }

    // Update data
    const updatedMedicalData = {
      ...existingData,
      ...updateData,
      lastUpdated: new Date().toISOString(),
      updatedBy: user.id
    };

    await kv.set(`patient_medical_${anonymousId}`, updatedMedicalData);

    return c.json({ 
      success: true, 
      message: 'Medical data updated successfully' 
    });
  } catch (error) {
    console.log('Error updating medical data:', error);
    return c.json({ error: 'Server error while updating medical data' }, 500);
  }
});

// Route for ML chat with patient
app.post('/make-server-094289b0/ml-chat', async (c) => {
  try {
    const { patientId, message, patientInfo } = await c.req.json();
    
    if (!patientId || !message) {
      return c.json({ error: 'Patient ID and message are required' }, 400);
    }

    // Store the conversation
    const timestamp = new Date().toISOString();
    const conversationId = `chat_${patientId}_${Date.now()}`;
    
    const conversationData = {
      patientId,
      message,
      timestamp,
      patientInfo,
      reviewed: false
    };
    
    await kv.set(`conversation_${conversationId}`, conversationData);

    // Get patient's historical medical data for ML analysis
    const medicalData = await kv.get(`patient_medical_${patientId}`);
    
    // Initialize GitHub Models service
    const githubToken = Deno.env.get('GITHUB_TOKEN');
    let analysis;
    
    if (githubToken) {
      try {
        const githubModels = new EnhancedGitHubModelsService(githubToken);
        
        // Extract symptoms from message
        const symptoms = extractSymptoms(message);
        const symptomNames = symptoms.map(s => s.name);
        
        // Get assessment scores from medical data
        const assessmentScores = medicalData ? {
          pcss: medicalData.pcss?.totalScore,
          dhi: medicalData.dhi?.totalScore,
          hit6: medicalData.hit6?.totalScore,
          phq9: medicalData.phq9?.totalScore,
          gad7: medicalData.gad7?.totalScore
        } : {};
        
        // Get structured analysis from Enhanced GitHub Models with learning
        const structuredAnalysis = await githubModels.analyzeMedicalDataWithLearning(
          symptomNames,
          patientInfo,
          assessmentScores
        );
        
        // Get personalized response
        const personalizedResponse = await githubModels.generatePersonalizedResponse(
          symptomNames,
          patientInfo,
          medicalData
        );
        
        analysis = {
          response: personalizedResponse,
          recommendations: structuredAnalysis.recommendations || [],
          urgencyLevel: structuredAnalysis.riskAssessment?.level || 'medium',
          symptoms: symptoms,
          confidence: structuredAnalysis.confidence || 0.8,
          doctorReviewRequired: structuredAnalysis.doctorReviewRequired !== false
        };
        
        console.log('✅ GitHub Models analysis completed');
      } catch (githubError) {
        console.error('GitHub Models error:', githubError);
        // Fallback to rule-based analysis
        analysis = await analyzePatientMessage(message, medicalData, patientInfo);
        analysis.note = 'Generated using rule-based analysis (GitHub Models unavailable)';
      }
    } else {
      console.log('GitHub token not available, using rule-based analysis');
      // Use existing rule-based analysis
      analysis = await analyzePatientMessage(message, medicalData, patientInfo);
      analysis.note = 'Generated using rule-based analysis';
    }
    
    // Store AI response for doctor review
    const responseData = {
      conversationId,
      patientId,
      aiResponse: analysis.response,
      recommendations: analysis.recommendations,
      urgencyLevel: analysis.urgencyLevel,
      symptoms: analysis.symptoms || [],
      confidence: analysis.confidence || 0.7,
      timestamp,
      doctorReviewed: false,
      analysisMethod: githubToken ? 'github-models' : 'rule-based'
    };
    
    await kv.set(`ai_response_${conversationId}`, responseData);
    
    return c.json({
      response: analysis.response,
      recommendations: analysis.recommendations,
      urgencyLevel: analysis.urgencyLevel,
      confidence: analysis.confidence,
      note: analysis.note
    });
  } catch (error) {
    console.log('ML chat error:', error);
    return c.json({ error: 'Server error during ML chat analysis' }, 500);
  }
});

// Route for doctors to review ML recommendations
app.get('/make-server-094289b0/ml-reviews', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get all unreviewed AI responses
    const aiResponses = await kv.getByPrefix('ai_response_');
    const unreviewed = aiResponses.filter(response => !response.doctorReviewed);
    
    return c.json({ reviews: unreviewed });
  } catch (error) {
    console.log('Error getting ML reviews:', error);
    return c.json({ error: 'Server error while getting ML reviews' }, 500);
  }
});

// Route for doctors to approve/modify ML recommendations
app.post('/make-server-094289b0/ml-reviews/:responseId/approve', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const responseId = c.req.param('responseId');
    const { approved, doctorNotes, modifiedRecommendations } = await c.req.json();
    
    const responseData = await kv.get(`ai_response_${responseId}`);
    if (!responseData) {
      return c.json({ error: 'Response not found' }, 404);
    }

    // Update the response with doctor review
    const updatedResponse = {
      ...responseData,
      doctorReviewed: true,
      doctorApproved: approved,
      doctorNotes,
      modifiedRecommendations,
      reviewedBy: user.id,
      reviewedAt: new Date().toISOString()
    };

    await kv.set(`ai_response_${responseId}`, updatedResponse);
    
    // Process feedback for model improvement
    await processFeedbackForLearning(updatedResponse, user.id);
    
    return c.json({ success: true, message: 'Review recorded successfully' });
  } catch (error) {
    console.log('Error reviewing ML recommendation:', error);
    return c.json({ error: 'Server error while reviewing ML recommendation' }, 500);
  }
});

// Route for generating personalized daily questions
app.post('/make-server-094289b0/daily-questions', async (c) => {
  try {
    const { patientId } = await c.req.json();
    
    if (!patientId) {
      return c.json({ error: 'Patient ID is required' }, 400);
    }

    // Get patient's medical history and recent conversations
    const medicalData = await kv.get(`patient_medical_${patientId}`);
    const recentConversations = await kv.getByPrefix(`conversation_${patientId}_`);
    
    // Prepare patient history for AI analysis
    const patientHistory = {
      medicalData,
      recentSymptoms: recentConversations
        .slice(-5) // Last 5 conversations
        .map(conv => ({
          date: conv.timestamp,
          message: conv.message,
          symptoms: extractSymptoms(conv.message)
        }))
    };

    const githubToken = Deno.env.get('GITHUB_TOKEN');
    let questions = [];
    
    if (githubToken) {
      try {
        const githubModels = new GitHubModelsService(githubToken);
        
        const systemPrompt = `You are a medical AI assistant generating personalized daily check-in questions for concussion patients.

Create 5-7 relevant questions based on the patient's symptom history and recovery progress. Questions should:
- Track symptom progression
- Monitor recovery milestones
- Identify concerning changes
- Be easy to understand and answer
- Follow evidence-based concussion monitoring practices

Return ONLY a JSON array of question strings, no additional text or formatting.`;

        const userPrompt = `Based on this patient's recent history, generate today's check-in questions:
${JSON.stringify(patientHistory, null, 2)}`;

        const messages = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ];

        const response = await githubModels.chatCompletion(messages);
        
        try {
          // Try to parse JSON array from response
          const jsonMatch = response.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            questions = JSON.parse(jsonMatch[0]);
          } else {
            // Fallback: parse lines as questions
            questions = response.split('\n')
              .filter(line => line.trim().length > 0)
              .map(line => line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim())
              .slice(0, 7);
          }
        } catch (parseError) {
          console.log('Could not parse AI questions, using fallback');
          questions = [];
        }
        
        console.log('✅ GitHub Models daily questions generated');
      } catch (githubError) {
        console.error('GitHub Models error for daily questions:', githubError);
        questions = [];
      }
    }
    
    // Fallback questions if AI failed or unavailable
    if (questions.length === 0) {
      questions = [
        'How would you rate your overall symptoms today (0-10)?',
        'Did you experience any headaches today?',
        'How was your sleep quality last night?',
        'Did you feel dizzy or have balance issues today?',
        'How was your concentration and focus today?',
        'Did you engage in any physical activity today?',
        'Are there any new or worsening symptoms to report?'
      ];
    }
    
    return c.json({ 
      questions: questions.slice(0, 7), // Limit to 7 questions
      generatedBy: githubToken ? 'github-models' : 'fallback'
    });
  } catch (error) {
    console.log('Daily questions error:', error);
    return c.json({ error: 'Server error generating daily questions' }, 500);
  }
});

// Route for getting ML model performance metrics
app.get('/make-server-094289b0/ml-metrics', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get metrics for both analysis methods
    const githubModelsMetrics = await kv.get('model_metrics_github-models') || {
      totalReviews: 0,
      approvedCount: 0,
      rejectedCount: 0,
      accuracyRate: 0
    };
    
    const ruleBasedMetrics = await kv.get('model_metrics_rule-based') || {
      totalReviews: 0,
      approvedCount: 0,
      rejectedCount: 0,
      accuracyRate: 0
    };

    // Get training data stats
    const trainingData = await kv.getByPrefix('training_data_');
    const successPatterns = await kv.getByPrefix('success_patterns_');
    const failurePatterns = await kv.getByPrefix('failure_patterns_');
    
    const metrics = {
      githubModels: githubModelsMetrics,
      ruleBased: ruleBasedMetrics,
      trainingDataCount: trainingData.length,
      successPatternsCount: successPatterns.length,
      failurePatternsCount: failurePatterns.length,
      totalFeedbackProcessed: trainingData.length,
      lastUpdated: new Date().toISOString()
    };
    
    return c.json({ metrics });
  } catch (error) {
    console.log('Error getting ML metrics:', error);
    return c.json({ error: 'Server error while getting ML metrics' }, 500);
  }
});

// Route for getting learning insights
app.get('/make-server-094289b0/ml-insights', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get recent training data for insights
    const trainingData = await kv.getByPrefix('training_data_');
    const recentTraining = trainingData
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50);

    // Analyze common patterns
    const approvedCases = recentTraining.filter(t => t.doctorApproved);
    const rejectedCases = recentTraining.filter(t => !t.doctorApproved);
    
    // Get common symptoms in approved vs rejected cases
    const approvedSymptoms = {};
    const rejectedSymptoms = {};
    
    approvedCases.forEach(case_ => {
      case_.originalSymptoms?.forEach(symptom => {
        approvedSymptoms[symptom.name] = (approvedSymptoms[symptom.name] || 0) + 1;
      });
    });
    
    rejectedCases.forEach(case_ => {
      case_.originalSymptoms?.forEach(symptom => {
        rejectedSymptoms[symptom.name] = (rejectedSymptoms[symptom.name] || 0) + 1;
      });
    });

    const insights = {
      totalCasesAnalyzed: recentTraining.length,
      approvalRate: approvedCases.length / recentTraining.length,
      mostCommonApprovedSymptoms: Object.entries(approvedSymptoms)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([symptom, count]) => ({ symptom, count })),
      mostCommonRejectedSymptoms: Object.entries(rejectedSymptoms)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([symptom, count]) => ({ symptom, count })),
      improvementTrends: {
        last30Days: recentTraining.slice(0, 30).filter(t => t.doctorApproved).length / Math.min(30, recentTraining.length),
        last7Days: recentTraining.slice(0, 7).filter(t => t.doctorApproved).length / Math.min(7, recentTraining.length)
      }
    };
    
    return c.json({ insights });
  } catch (error) {
    console.log('Error getting ML insights:', error);
    return c.json({ error: 'Server error while getting ML insights' }, 500);
  }
});

// Route for manual model retraining trigger
app.post('/make-server-094289b0/ml-retrain', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log('🔄 Manual retraining triggered by:', user.email);
    
    // Update few-shot examples
    await updateFewShotExamples();
    
    // Clear old patterns (older than 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const allPatterns = [
      ...(await kv.getByPrefix('success_patterns_')),
      ...(await kv.getByPrefix('failure_patterns_'))
    ];
    
    let clearedCount = 0;
    for (const pattern of allPatterns) {
      if (pattern.timestamp < thirtyDaysAgo) {
        // We can't delete from KV easily, but we can mark as archived
        pattern.archived = true;
        await kv.set(pattern.key, pattern);
        clearedCount++;
      }
    }
    
    return c.json({ 
      success: true, 
      message: `Model retraining completed. ${clearedCount} old patterns archived.`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.log('Error during manual retraining:', error);
    return c.json({ error: 'Server error during retraining' }, 500);
  }
});

// Route for exporting training data for ML model improvement
app.get('/make-server-094289b0/export/training-data', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get all training data
    const trainingData = await kv.getByPrefix('training_data_');
    
    if (!trainingData || trainingData.length === 0) {
      return c.json({ error: 'No training data to export' }, 404);
    }

    // Create CSV headers for training data
    const headers = [
      'timestamp',
      'patient_id',
      'symptoms',
      'original_recommendations',
      'doctor_approved',
      'doctor_notes',
      'modified_recommendations',
      'confidence',
      'analysis_method',
      'doctor_id'
    ];

    // Create CSV rows
    const csvRows = [headers.join(',')];
    
    for (const training of trainingData) {
      const row = [
        training.timestamp || '',
        training.patientId || '',
        training.originalSymptoms?.map(s => s.name).join(';') || '',
        training.originalRecommendations?.map(r => `${r.title}:${r.description}`).join(';') || '',
        training.doctorApproved || false,
        `"${(training.doctorNotes || '').replace(/"/g, '""')}"`, // Escape quotes
        training.modifiedRecommendations?.map(r => `${r.title}:${r.description}`).join(';') || '',
        training.confidence || '',
        training.analysisMethod || '',
        training.doctorId || ''
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="ml_training_data_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    console.log('Training data export error:', error);
    return c.json({ error: 'Server error during training data export' }, 500);
  }
});

// Route for CSV data export
app.get('/make-server-094289b0/export/csv', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get all medical data
    const medicalDataList = await kv.getByPrefix('patient_medical_');
    
    if (!medicalDataList || medicalDataList.length === 0) {
      return c.json({ error: 'No data to export' }, 404);
    }

    // Create CSV headers
    const headers = [
      'anonymous_id',
      'pcss_total_score',
      'voms_npc_distance',
      'voms_symptoms_score',
      'dhi_total_score',
      'hit6_total_score',
      'phq9_total_score',
      'gad7_total_score',
      'vestibular_progress',
      'visual_progress',
      'headache_progress',
      'auditory_progress',
      'speech_progress',
      'exertional_progress',
      'cervical_progress',
      'last_updated'
    ];

    // Create CSV rows
    const csvRows = [headers.join(',')];
    
    for (const medicalData of medicalDataList) {
      const row = [
        medicalData.anonymousId || '',
        medicalData.pcss?.totalScore || '',
        medicalData.voms?.npcDistance || '',
        medicalData.voms?.symptomsScore || '',
        medicalData.dhi?.totalScore || '',
        medicalData.hit6?.totalScore || '',
        medicalData.phq9?.totalScore || '',
        medicalData.gad7?.totalScore || '',
        medicalData.rehabilitationData?.vestibular?.progress || '',
        medicalData.rehabilitationData?.visual?.progress || '',
        medicalData.rehabilitationData?.headache?.progress || '',
        medicalData.rehabilitationData?.auditory?.progress || '',
        medicalData.rehabilitationData?.speech?.progress || '',
        medicalData.rehabilitationData?.exertional?.progress || '',
        medicalData.rehabilitationData?.cervical?.progress || '',
        medicalData.lastUpdated || ''
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="concussion_data_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    console.log('CSV export error:', error);
    return c.json({ error: 'Server error during CSV export' }, 500);
  }
});

// Initialize on startup (run asynchronously to not block server)
initializeStaff().catch(error => {
  console.log('Staff initialization error:', error);
});

console.log('Medical data server started');

Deno.serve(app.fetch);