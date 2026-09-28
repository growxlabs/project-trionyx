import React from 'react';

interface EmptyOperationalStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyOperationalState({
  title,
  description,
  action,
  className = '',
}: EmptyOperationalStateProps) {
  return (
    <div className={`p-8 text-center bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] ${className}`}>
      <h3 className="text-[14.5px] font-semibold text-[var(--text-primary)] m-0">
        {title}
      </h3>
      <p className="text-[13px] text-[var(--text-secondary)] mt-1.5 mb-0 max-w-md mx-auto leading-relaxed">
        {description}
      </p>
      {action && (
        <div className="mt-4 flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
}
