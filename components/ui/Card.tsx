
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-surface border border-border rounded-lg shadow-md p-4 sm:p-6 ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => {
  return <div className={`border-b border-border pb-4 mb-4 ${className}`}>{children}</div>;
}

export const CardTitle: React.FC<CardProps> = ({ children, className = '' }) => {
  return <h3 className={`text-lg font-semibold text-text ${className}`}>{children}</h3>;
}

export const CardContent: React.FC<CardProps> = ({ children, className = '' }) => {
  return <div className={className}>{children}</div>;
}

export default Card;
