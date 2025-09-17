import React, { useState } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Menu, Users, UserPlus, FileText, Download, Brain, LogOut, Home } from 'lucide-react';
import { User } from '../App';

interface MobileNavProps {
  user: User;
  currentView: string;
  onNavigate: (view: any) => void;
  onLogout: () => void;
  onExport?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ 
  user, 
  currentView, 
  onNavigate, 
  onLogout,
  onExport 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigation = (view: any) => {
    onNavigate(view);
    setIsOpen(false);
  };

  const menuItems = [
    {
      icon: Home,
      label: 'Dashboard',
      action: () => handleNavigation('dashboard'),
      active: currentView === 'dashboard'
    },
    {
      icon: Users,
      label: 'All Patients',
      action: () => handleNavigation('patients'),
      active: currentView === 'patients'
    },
    {
      icon: UserPlus,
      label: 'Add Patient',
      action: () => handleNavigation('add-patient'),
      active: currentView === 'add-patient'
    },
    {
      icon: Brain,
      label: 'ML Reviews',
      action: () => handleNavigation('ml-reviews'),
      active: currentView === 'ml-reviews'
    },
    ...(onExport ? [{
      icon: Download,
      label: 'Export Data',
      action: () => {
        onExport();
        setIsOpen(false);
      },
      active: false
    }] : [])
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="md:hidden p-2"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader className="border-b pb-4 mb-4">
          <SheetTitle className="text-left">
            🏥 MedData ML
          </SheetTitle>
          <div className="text-sm text-slate-600 text-left">
            {user.user_metadata.name}
            <br />
            <span className="text-xs text-slate-500">{user.user_metadata.role}</span>
          </div>
        </SheetHeader>
        
        <nav className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Button
                key={index}
                variant={item.active ? "secondary" : "ghost"}
                className="w-full justify-start h-12 text-left"
                onClick={item.action}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="outline"
            className="w-full justify-start h-12 text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => {
              onLogout();
              setIsOpen(false);
            }}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};