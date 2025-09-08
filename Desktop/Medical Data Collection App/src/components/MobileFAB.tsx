import React from 'react';
import { Button } from './ui/button';
import { LucideIcon } from 'lucide-react';

interface FABProps {
  icon: LucideIcon;
  onClick: () => void;
  label?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}

export const FAB: React.FC<FABProps> = ({
  icon: Icon,
  onClick,
  label,
  className = '',
  variant = 'primary',
  size = 'md',
  position = 'bottom-right'
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl';
      case 'secondary':
        return 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-lg hover:shadow-xl';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'w-12 h-12';
      case 'md':
        return 'w-14 h-14';
      case 'lg':
        return 'w-16 h-16';
      default:
        return 'w-14 h-14';
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-right':
        return 'fixed bottom-4 right-4 sm:bottom-6 sm:right-6';
      case 'bottom-left':
        return 'fixed bottom-4 left-4 sm:bottom-6 sm:left-6';
      case 'bottom-center':
        return 'fixed bottom-4 left-1/2 transform -translate-x-1/2 sm:bottom-6';
      default:
        return 'fixed bottom-4 right-4 sm:bottom-6 sm:right-6';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-5 w-5';
      case 'md':
        return 'h-6 w-6';
      case 'lg':
        return 'h-7 w-7';
      default:
        return 'h-6 w-6';
    }
  };

  return (
    <Button
      onClick={onClick}
      className={`
        ${getSizeStyles()}
        ${getVariantStyles()}
        ${getPositionStyles()}
        rounded-full
        p-0
        z-50
        transition-all
        duration-200
        transform
        active:scale-95
        touch-manipulation
        ${className}
      `}
      title={label}
    >
      <Icon className={getIconSize()} />
      <span className="sr-only">{label}</span>
    </Button>
  );
};

interface FABGroupProps {
  children: React.ReactNode;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  direction?: 'vertical' | 'horizontal';
  spacing?: 'sm' | 'md' | 'lg';
}

export const FABGroup: React.FC<FABGroupProps> = ({
  children,
  position = 'bottom-right',
  direction = 'vertical',
  spacing = 'md'
}) => {
  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-right':
        return 'fixed bottom-4 right-4 sm:bottom-6 sm:right-6';
      case 'bottom-left':
        return 'fixed bottom-4 left-4 sm:bottom-6 sm:left-6';
      case 'bottom-center':
        return 'fixed bottom-4 left-1/2 transform -translate-x-1/2 sm:bottom-6';
      default:
        return 'fixed bottom-4 right-4 sm:bottom-6 sm:right-6';
    }
  };

  const getDirectionStyles = () => {
    const spacingMap = {
      sm: '8px',
      md: '12px',
      lg: '16px'
    };

    if (direction === 'vertical') {
      return {
        flexDirection: 'column-reverse' as const,
        gap: spacingMap[spacing]
      };
    } else {
      return {
        flexDirection: 'row' as const,
        gap: spacingMap[spacing]
      };
    }
  };

  return (
    <div
      className={`${getPositionStyles()} flex z-50`}
      style={getDirectionStyles()}
    >
      {children}
    </div>
  );
};

export default FAB;