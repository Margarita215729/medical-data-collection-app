import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useScreenSize } from './ui/use-mobile';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ArrowLeft, Save } from 'lucide-react';

interface PatientFormProps {
  accessToken: string;
  onPatientAdded: () => void;
  onCancel: () => void;
}

export function PatientForm({ accessToken, onPatientAdded, onCancel }: PatientFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: ''
  });
  const [loading, setLoading] = useState(false);
  const screenSize = useScreenSize();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName) {
      alert('Please fill in first and last name');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-094289b0/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Patient successfully added!\nAnonymous ID: ${data.anonymousId}`);
        onPatientAdded();
      } else {
        alert(data.error || 'Error adding patient');
      }
    } catch (error) {
      console.error('Error adding patient:', error);
      alert('Server connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex items-center space-x-2 sm:space-x-4">
        <Button variant="outline" onClick={onCancel} className="h-9 sm:h-10 text-sm">
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <h1 className="text-lg sm:text-xl font-semibold">Add New Patient</h1>
      </div>

      <Card>
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Basic Information</CardTitle>
          <p className="text-xs sm:text-sm text-slate-600">
            Personal data will be stored separately from medical data
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                  className="h-10 sm:h-11 text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                  className="h-10 sm:h-11 text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-sm">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="h-10 sm:h-11 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange('gender', value)}
                >
                  <SelectTrigger className="h-10 sm:h-11 text-sm">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="not_specified">Not specified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
              <h3 className="text-xs sm:text-sm font-medium text-blue-900 mb-2">
                🔒 Security Information
              </h3>
              <div className="text-xs text-blue-700 space-y-1 leading-relaxed">
                <p>• Each patient is automatically assigned an anonymous ID</p>
                <p>• Personal data is stored separately from medical data</p>
                <p>• CSV export contains only anonymous data</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-10 sm:h-11 text-sm font-medium"
              >
                <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                {loading ? 'Saving...' : 'Add Patient'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="h-10 sm:h-11 text-sm"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}