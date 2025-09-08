import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useScreenSize } from './ui/use-mobile';
import { Patient } from '../App';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Search, ArrowLeft, UserPlus, FileText } from 'lucide-react';

interface PatientListProps {
  accessToken: string;
  onPatientSelect: (patient: Patient) => void;
  onNavigate: (view: 'dashboard' | 'add-patient') => void;
}

export function PatientList({ accessToken, onPatientSelect, onNavigate }: PatientListProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const screenSize = useScreenSize();

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = patients.filter(patient =>
        patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.anonymousId.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [searchTerm, patients]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-094289b0/patients`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setPatients(data.patients || []);
      } else {
        console.error('Error loading patients:', data.error);
        alert(data.error || 'Error loading patients');
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      alert('Server connection error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US');
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return '';
    const birth = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 sm:h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
          <p className="text-slate-600 text-sm sm:text-base">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button variant="outline" onClick={() => onNavigate('dashboard')} className="h-9 sm:h-10 text-sm">
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <h1 className="text-lg sm:text-xl font-semibold">Patient List</h1>
        </div>
        <Button onClick={() => onNavigate('add-patient')} className="h-9 sm:h-10 text-sm w-full sm:w-auto">
          <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
          Add Patient
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, surname or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 sm:h-11 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Counter */}
      <div className="text-xs sm:text-sm text-slate-600">
        Found: {filteredPatients.length} of {patients.length} patients
      </div>

      {/* Patient List */}
      <div className="space-y-3">
        {filteredPatients.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  {patients.length === 0 ? 'No Patients' : 'No Patients Found'}
                </h3>
                <p className="text-slate-600 mb-4">
                  {patients.length === 0 
                    ? 'Add your first patient to get started'
                    : 'Try adjusting your search query'
                  }
                </p>
                {patients.length === 0 && (
                  <Button onClick={() => onNavigate('add-patient')}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add First Patient
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredPatients.map((patient) => (
            <Card key={patient.anonymousId} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                      <h3 className="text-base sm:text-lg font-medium text-slate-900">
                        {patient.firstName} {patient.lastName}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 w-fit">
                        {patient.anonymousId}
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 text-xs sm:text-sm text-slate-600">
                      {patient.dateOfBirth && (
                        <span>
                          Age: {calculateAge(patient.dateOfBirth)} years
                        </span>
                      )}
                      {patient.gender && (
                        <span>
                          Gender: {patient.gender === 'male' ? 'M' : patient.gender === 'female' ? 'F' : patient.gender}
                        </span>
                      )}
                      <span>
                        Added: {formatDate(patient.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => onPatientSelect(patient)}
                    variant="outline"
                    className="h-9 sm:h-10 text-sm w-full sm:w-auto"
                  >
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Medical Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}