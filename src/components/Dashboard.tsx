import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { User } from '../App';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Users, UserPlus, FileText, Download, Activity, Brain, MessageSquare } from 'lucide-react';

interface DashboardProps {
  user: User;
  onNavigate: (view: 'patients' | 'add-patient' | 'ml-reviews') => void;
  accessToken: string;
}

export function Dashboard({ user, onNavigate, accessToken }: DashboardProps) {
  const [stats, setStats] = useState({
    totalPatients: 0,
    recentPatients: 0,
    completedAssessments: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // API call to get statistics can be added here
      // Using placeholders for now
      setStats({
        totalPatients: 0,
        recentPatients: 0,
        completedAssessments: 0
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleExportCSV = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-094289b0/export/csv`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `concussion_data_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Data export error');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportTrainingData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-094289b0/export/training-data`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ml_training_data_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Training data export error');
      }
    } catch (error) {
      console.error('Training data export error:', error);
      alert('Error exporting training data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">
          Welcome, {user.user_metadata.name}!
        </h2>
        <p className="text-sm sm:text-base text-slate-600">
          Specialty: {user.user_metadata.role}
        </p>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          System for collecting concussion rehabilitation data
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total Patients
            </CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.totalPatients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              New This Week
            </CardTitle>
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.recentPatients}</div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Completed Assessments
            </CardTitle>
            <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.completedAssessments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Patient Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            <Button 
              onClick={() => onNavigate('add-patient')}
              className="w-full h-10 sm:h-11 text-sm sm:text-base"
            >
              <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Add New Patient
            </Button>
            <Button 
              onClick={() => onNavigate('patients')}
              variant="outline"
              className="w-full h-10 sm:h-11 text-sm sm:text-base"
            >
              <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              View All Patients
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Data Export</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            <Button 
              onClick={handleExportCSV}
              variant="outline"
              className="w-full h-10 sm:h-11 text-sm sm:text-base"
              disabled={loading}
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              {loading ? 'Exporting...' : 'Download Patient Data CSV'}
            </Button>
            <Button 
              onClick={handleExportTrainingData}
              variant="outline"
              className="w-full h-10 sm:h-11 text-sm sm:text-base"
              disabled={loading}
            >
              <Brain className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              {loading ? 'Exporting...' : 'Download AI Training Data'}
            </Button>
            <p className="text-xs text-slate-600 leading-relaxed">
              Export anonymized data and AI feedback for model improvement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">AI Assistant Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            <Button 
              onClick={() => onNavigate('ml-reviews')}
              variant="outline"
              className="w-full h-10 sm:h-11 text-sm sm:text-base"
            >
              <Brain className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Review ML Recommendations
            </Button>
            <p className="text-xs text-slate-600 leading-relaxed">
              Review and approve AI-generated patient treatment recommendations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-700">🔒 Data Security</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-slate-600">
            <p>✅ Personal data separated from medical data</p>
            <p>✅ Each patient has an anonymous identifier</p>
            <p>✅ CSV export contains only anonymized data</p>
            <p>✅ Medical confidentiality compliance</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}