import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useScreenSize } from './ui/use-mobile';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { 
  ArrowLeft, 
  Bot, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  User,
  MessageSquare,
  Activity,
  Brain,
  FileText,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  BarChart3,
  TrendingUp,
  Target,
  Zap,
  RefreshCw
} from 'lucide-react';

interface MLReview {
  conversationId: string;
  patientId: string;
  aiResponse: string;
  recommendations: RecommendationItem[];
  urgencyLevel: string;
  timestamp: string;
  doctorReviewed: boolean;
  doctorApproved?: boolean;
  doctorNotes?: string;
  modifiedRecommendations?: RecommendationItem[];
  confidence?: number;
  analysisMethod?: 'github-models' | 'rule-based';
  symptoms?: any[];
}

interface RecommendationItem {
  category: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

interface MLReviewDashboardProps {
  accessToken: string;
  onBack: () => void;
}

export const MLReviewDashboard: React.FC<MLReviewDashboardProps> = ({
  accessToken,
  onBack
}) => {
  const [reviews, setReviews] = useState<MLReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<MLReview | null>(null);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'modify' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [modelMetrics, setModelMetrics] = useState<any>(null);
  const [showInsights, setShowInsights] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const screenSize = useScreenSize();

  useEffect(() => {
    loadMLReviews();
    loadModelMetrics();
  }, []);

  const loadMLReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-094289b0/ml-reviews`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load reviews: ${response.status}`);
      }

      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error loading ML reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadModelMetrics = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-094289b0/ml-metrics`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setModelMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Error loading model metrics:', error);
    }
  };

  const loadInsights = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-094289b0/ml-insights`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights);
      }
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  };

  const triggerRetraining = async () => {
    try {
      setSubmitting(true);
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-094289b0/ml-retrain`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        alert('Model retraining completed successfully!');
        loadModelMetrics(); // Refresh metrics
      } else {
        throw new Error('Failed to trigger retraining');
      }
    } catch (error) {
      console.error('Error triggering retraining:', error);
      alert('Error triggering retraining. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewSubmit = async (approved: boolean) => {
    if (!selectedReview) return;

    try {
      setSubmitting(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-094289b0/ml-reviews/${selectedReview.conversationId}/approve`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            approved,
            doctorNotes,
            modifiedRecommendations: approved ? null : selectedReview.recommendations
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to submit review: ${response.status}`);
      }

      // Update local state
      setReviews(prev => prev.filter(review => review.conversationId !== selectedReview.conversationId));
      setSelectedReview(null);
      setDoctorNotes('');
      setReviewAction(null);
      
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 sm:h-64">
        <div className="text-center">
          <Brain className="h-6 w-6 sm:h-8 sm:w-8 animate-pulse text-blue-600 mx-auto mb-2" />
          <p className="text-slate-600 text-sm sm:text-base">Loading ML reviews...</p>
        </div>
      </div>
    );
  }

  if (selectedReview) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-start space-x-2 sm:space-x-4 min-w-0 flex-1">
            <Button
              variant="ghost"
              onClick={() => setSelectedReview(null)}
              className="text-slate-600 hover:text-slate-900 px-2 sm:px-3 flex-shrink-0"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Back to Reviews</span>
            </Button>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-semibold">Review ML Recommendation</h2>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm text-slate-600">
                <span>Patient ID: {selectedReview.patientId}</span>
                <div className="flex items-center space-x-2">
                  {selectedReview.analysisMethod && (
                    <Badge variant="outline" className="text-xs">
                      {selectedReview.analysisMethod === 'github-models' ? '🤖 GitHub Models' : '📋 Rule-based'}
                    </Badge>
                  )}
                  {selectedReview.confidence && (
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(selectedReview.confidence * 100)}% confidence
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          <Badge className={getUrgencyColor(selectedReview.urgencyLevel)}>
            {selectedReview.urgencyLevel.toUpperCase()} URGENCY
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* AI Response */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                <span>AI Response</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48 sm:h-64">
                <div className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">{selectedReview.aiResponse}</div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                <span>AI Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48 sm:h-64">
                <div className="space-y-2 sm:space-y-3">
                  {selectedReview.recommendations.map((rec, index) => (
                    <div key={index} className={`p-2 sm:p-3 rounded-lg border ${getSeverityColor(rec.severity)}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0 mb-1">
                        <h5 className="font-medium text-sm sm:text-base">{rec.title}</h5>
                        <Badge variant="outline" className="text-xs self-start sm:self-center">
                          {rec.category}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm leading-relaxed">{rec.description}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Review Actions */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Doctor Review</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Review Notes</label>
              <Textarea
                placeholder="Add your professional assessment and any modifications to the AI recommendations..."
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                rows={screenSize === 'mobile' ? 3 : 4}
                className="text-sm sm:text-base"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button
                onClick={() => handleReviewSubmit(true)}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 h-11 sm:h-10 text-sm sm:text-base flex-1 sm:flex-none"
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                {submitting ? 'Submitting...' : screenSize === 'mobile' ? 'Approve' : 'Approve Recommendations'}
              </Button>
              <Button
                onClick={() => handleReviewSubmit(false)}
                disabled={submitting}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 h-11 sm:h-10 text-sm sm:text-base flex-1 sm:flex-none"
              >
                <ThumbsDown className="h-4 w-4 mr-2" />
                {submitting ? 'Submitting...' : screenSize === 'mobile' ? 'Modify' : 'Needs Modification'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex items-start space-x-2 sm:space-x-4 min-w-0 flex-1">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-slate-600 hover:text-slate-900 px-2 sm:px-3 flex-shrink-0"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">ML Review Dashboard</h1>
            <p className="text-xs sm:text-base text-slate-600 leading-relaxed">
              {screenSize === 'mobile' ? 'Review AI recommendations' : 'Review and approve AI-generated patient recommendations'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="self-start sm:self-center">
            {reviews.length} Pending
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowInsights(!showInsights);
              if (!showInsights && !insights) loadInsights();
            }}
            className="text-xs px-2 py-1"
          >
            <BarChart3 className="h-3 w-3 mr-1" />
            {showInsights ? 'Hide' : 'Show'} Metrics
          </Button>
        </div>
      </div>

      {/* ML Learning Metrics */}
      {showInsights && modelMetrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base">
                <Brain className="h-4 w-4 text-blue-600" />
                <span>Model Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-green-50 p-2 rounded-lg">
                  <div className="text-green-600 font-medium">GitHub Models AI</div>
                  <div className="text-lg font-bold">{modelMetrics.githubModels?.accuracyRate?.toFixed(1) || 0}%</div>
                  <div className="text-xs text-slate-600">{modelMetrics.githubModels?.totalReviews || 0} reviews</div>
                </div>
                <div className="bg-blue-50 p-2 rounded-lg">
                  <div className="text-blue-600 font-medium">Rule-based AI</div>
                  <div className="text-lg font-bold">{modelMetrics.ruleBased?.accuracyRate?.toFixed(1) || 0}%</div>
                  <div className="text-xs text-slate-600">{modelMetrics.ruleBased?.totalReviews || 0} reviews</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <div className="text-xs text-slate-600">
                  Training data: {modelMetrics.trainingDataCount || 0} cases
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={triggerRetraining}
                  disabled={submitting}
                  className="text-xs px-2 py-1"
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${submitting ? 'animate-spin' : ''}`} />
                  {submitting ? 'Retraining...' : 'Retrain'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {insights && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span>Learning Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-purple-50 p-2 rounded-lg">
                    <div className="text-purple-600 font-medium">Approval Rate</div>
                    <div className="text-lg font-bold">{(insights.approvalRate * 100).toFixed(1)}%</div>
                    <div className="text-xs text-slate-600">{insights.totalCasesAnalyzed} cases analyzed</div>
                  </div>
                  <div className="bg-orange-50 p-2 rounded-lg">
                    <div className="text-orange-600 font-medium">Recent Trend</div>
                    <div className="text-lg font-bold">{(insights.improvementTrends?.last7Days * 100).toFixed(1)}%</div>
                    <div className="text-xs text-slate-600">Last 7 days</div>
                  </div>
                </div>
                
                {insights.mostCommonApprovedSymptoms?.length > 0 && (
                  <div className="pt-2">
                    <div className="text-xs font-medium text-slate-700 mb-1">Top Approved Symptoms:</div>
                    <div className="flex flex-wrap gap-1">
                      {insights.mostCommonApprovedSymptoms.slice(0, 3).map((item: any, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {item.symptom} ({item.count})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Review List */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-8 sm:py-12">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 sm:h-12 sm:w-12 text-green-600 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-slate-900 mb-2">All Caught Up!</h3>
              <p className="text-xs sm:text-base text-slate-600 leading-relaxed">
                No pending ML recommendations require review at this time.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {reviews.map((review) => (
            <Card key={review.conversationId} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 lg:gap-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                      <div className="flex items-center space-x-2">
                        <User className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600 flex-shrink-0" />
                        <span className="font-medium text-sm sm:text-base">Patient {review.patientId}</span>
                      </div>
                      <div className="flex items-center space-x-2 flex-wrap">
                        <Badge className={`${getUrgencyColor(review.urgencyLevel)} text-xs`}>
                          {review.urgencyLevel}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {review.recommendations.length} recommendations
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-slate-600">
                        {new Date(review.timestamp).toLocaleString()}
                      </span>
                    </div>

                    {/* Expandable content for mobile */}
                    {screenSize === 'mobile' ? (
                      <div>
                        <button
                          onClick={() => setExpandedCard(expandedCard === review.conversationId ? null : review.conversationId)}
                          className="flex items-center justify-between w-full text-left"
                        >
                          <span className="text-xs text-slate-700 line-clamp-1">
                            {review.aiResponse.substring(0, 80)}...
                          </span>
                          {expandedCard === review.conversationId ? (
                            <ChevronUp className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          )}
                        </button>
                        {expandedCard === review.conversationId && (
                          <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                            {review.aiResponse.substring(0, 300)}...
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-700 line-clamp-2 leading-relaxed">
                        {review.aiResponse.substring(0, 150)}...
                      </p>
                    )}
                  </div>
                  
                  <Button
                    onClick={() => setSelectedReview(review)}
                    className="ml-0 lg:ml-4 h-11 lg:h-10 text-sm lg:text-base"
                    size={screenSize === 'mobile' ? 'default' : 'default'}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};