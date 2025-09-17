import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
  fullScreen?: boolean;
}

export const MobileModal: React.FC<MobileModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  showCloseButton = true,
  fullScreen = false
}) => {
  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Prevent iOS rubber band scrolling
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className={`fixed inset-0 z-50 flex ${
        fullScreen ? 'bg-white' : 'bg-black bg-opacity-50 items-end sm:items-center justify-center'
      }`}
      onClick={fullScreen ? undefined : (e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className={`
          ${fullScreen 
            ? 'w-full h-full' 
            : 'w-full max-w-lg mx-4 sm:mx-auto max-h-[90vh] sm:max-h-[80vh]'
          }
          ${fullScreen ? '' : 'animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95'}
          ${className}
        `}
      >
        <Card className={`${fullScreen ? 'h-full rounded-none border-none' : 'rounded-lg'} shadow-xl`}>
          {/* Header */}
          <CardHeader className={`
            ${fullScreen ? 'sticky top-0 z-10 bg-white border-b' : ''} 
            flex flex-row items-center justify-between py-3 sm:py-4 px-4 sm:px-6
          `}>
            <CardTitle className="text-lg sm:text-xl font-semibold truncate pr-4">
              {title}
            </CardTitle>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="flex-shrink-0 h-8 w-8 p-0 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            )}
          </CardHeader>
          
          {/* Content */}
          <CardContent className={`
            ${fullScreen ? 'flex-1 overflow-y-auto' : 'max-h-[calc(90vh-4rem)] sm:max-h-[calc(80vh-4rem)] overflow-y-auto'} 
            p-4 sm:p-6
          `}>
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Use portal to render modal at body level
  return createPortal(modalContent, document.body);
};

// Hook for managing modal state
export const useModal = (initialOpen = false) => {
  const [isOpen, setIsOpen] = React.useState(initialOpen);

  const openModal = React.useCallback(() => setIsOpen(true), []);
  const closeModal = React.useCallback(() => setIsOpen(false), []);
  const toggleModal = React.useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal
  };
};

export default MobileModal;