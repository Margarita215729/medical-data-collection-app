// GitHub Models API integration for medical AI assistant
export interface GitHubModelsConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface MedicalAnalysisRequest {
  symptoms: string[];
  patientData?: {
    age?: number;
    gender?: string;
    injuryDate?: string;
    currentMedications?: string[];
  };
  assessmentScores?: {
    pcss?: number;
    dhi?: number;
    hit6?: number;
    phq9?: number;
    gad7?: number;
  };
}

export interface MedicalRecommendation {
  category: 'exercise' | 'lifestyle' | 'monitoring' | 'medical_attention' | 'rehabilitation';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timeframe: string;
  precautions?: string[];
}

export interface AnalysisResponse {
  recommendations: MedicalRecommendation[];
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
  };
  nextSteps: string[];
  doctorReviewRequired: boolean;
  confidence: number;
}

export class GitHubModelsService {
  private config: GitHubModelsConfig;

  constructor(apiKey: string) {
    this.config = {
      apiKey,
      baseUrl: 'https://models.inference.ai.azure.com',
      model: 'gpt-4o' // Using GPT-4o for medical analysis
    };
  }

  async chatCompletion(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          temperature: 0.3, // Lower temperature for medical consistency
          max_tokens: 1000,
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

  async analyzeMedicalData(request: MedicalAnalysisRequest): Promise<AnalysisResponse> {
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

Symptoms: ${request.symptoms.join(', ')}

Patient Information:
${request.patientData ? Object.entries(request.patientData)
  .filter(([_, value]) => value !== undefined)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n') : 'No additional patient data provided'}

Assessment Scores:
${request.assessmentScores ? Object.entries(request.assessmentScores)
  .filter(([_, value]) => value !== undefined)
  .map(([key, value]) => `- ${key.toUpperCase()}: ${value}`)
  .join('\n') : 'No assessment scores provided'}

Please provide a comprehensive analysis with specific recommendations for this patient's recovery plan.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    try {
      const response = await this.chatCompletion(messages);
      
      // Parse the response - in a real implementation, you might want to use a more structured approach
      // For now, we'll return a default structure and let the AI response be in the content
      return this.parseAnalysisResponse(response);
    } catch (error) {
      console.error('Medical analysis error:', error);
      throw new Error('Failed to analyze medical data');
    }
  }

  private parseAnalysisResponse(aiResponse: string): AnalysisResponse {
    // This is a simplified parser - in production you'd want more robust JSON parsing
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

  async generateDailyQuestions(patientHistory: any[]): Promise<string[]> {
    const systemPrompt = `You are a medical AI assistant generating personalized daily check-in questions for concussion patients.

Create 5-7 relevant questions based on the patient's symptom history and recovery progress. Questions should:
- Track symptom progression
- Monitor recovery milestones
- Identify concerning changes
- Be easy to understand and answer
- Follow evidence-based concussion monitoring practices

Return only an array of question strings, no additional text.`;

    const userPrompt = `Based on this patient's recent history, generate today's check-in questions:
${JSON.stringify(patientHistory, null, 2)}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    try {
      const response = await this.chatCompletion(messages);
      
      // Parse questions from response
      const lines = response.split('\n').filter(line => line.trim().length > 0);
      return lines.slice(0, 7); // Limit to 7 questions max
    } catch (error) {
      console.error('Error generating daily questions:', error);
      
      // Fallback questions
      return [
        'How would you rate your overall symptoms today (0-10)?',
        'Did you experience any headaches today?',
        'How was your sleep quality last night?',
        'Did you feel dizzy or have balance issues today?',
        'How was your concentration and focus today?',
        'Did you engage in any physical activity today?',
        'Are there any new or worsening symptoms to report?'
      ];
    }
  }
}

export default GitHubModelsService;