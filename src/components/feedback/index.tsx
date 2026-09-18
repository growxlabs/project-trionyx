import React, { useState } from 'react';
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  InfoIcon,
  CloseIcon,
  SpinnerIcon,
} from '../ui/Icons';
import { Button } from '../ui/Button';

/* =========================================================================
   1. ALERT COMPONENT
   ========================================================================= */

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  variant?: AlertVariant;
  title: string;
  description?: string;
  onClose?: () => void;
  className?: string;
}

const alertConfig: Record<
  AlertVariant,
  { bg: string; border: string; text: string; icon: React.ReactNode }
> = {
  info: {
    bg: 'bg-[#FAF8F6]',
    border: 'border-[#EFEDEB]',
    text: 'text-[#151515]',
    icon: <InfoIcon size={18} color="default" />,
  },
  success: {
    bg: 'bg-[#F0FDF4]',
    border: 'border-[#DCFCE7]',
    text: 'text-[#15803D]',
    icon: <CheckCircleIcon size={18} color="success" />,
  },
  warning: {
    bg: 'bg-[#FFFBEB]',
    border: 'border-[#FEF3C7]',
    text: 'text-[#B45309]',
    icon: <AlertTriangleIcon size={18} color="warning" />,
  },
  error: {
    bg: 'bg-[#FEF2F2]',
    border: 'border-[#FEE2E2]',
    text: 'text-[#E52421]',
    icon: <AlertCircleIcon size={18} color="brandRed" />,
  },
};

export const Alert = ({
  variant = 'info',
  title,
  description,
  onClose,
  className = '',
}: AlertProps) => {
  const { bg, border, text, icon } = alertConfig[variant];

  return (
    <div
      role="alert"
      className={`p-3.5 rounded-[4px] border ${bg} ${border} flex items-start gap-3 transition-all ${className}`}
    >
      <span className="shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <h5 className={`text-[13px] font-semibold leading-tight ${text}`}>{title}</h5>
        {description && (
          <p className="text-[12px] text-[#626262] mt-1 leading-normal">{description}</p>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-[#626262] hover:text-[#151515] p-0.5 rounded-xs"
          aria-label="Close alert"
        >
          <CloseIcon size={14} color="inherit" />
        </button>
      )}
    </div>
  );
};

/* =========================================================================
   2. TOOLTIP
   ========================================================================= */

export const Tooltip = ({
  content,
  children,
  position = 'top',
}: {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={`absolute left-1/2 -translate-x-1/2 z-50 px-2.5 py-1 text-[11px] font-mono text-white bg-[#151515] rounded-[3px] shadow-sm whitespace-nowrap pointer-events-none transition-opacity ${
            position === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          }`}
        >
          {content}
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   3. TOAST NOTIFICATION
   ========================================================================= */

export interface ToastProps {
  title: string;
  message?: string;
  variant?: AlertVariant;
  onDismiss?: () => void;
}

export const Toast = ({ title, message, variant = 'info', onDismiss }: ToastProps) => {
  return (
    <div className="flex items-start gap-3 p-3.5 bg-white border border-[#EFEDEB] rounded-[6px] shadow-[0_8px_24px_rgba(21,21,21,0.08)] max-w-sm w-full">
      <span className="shrink-0 mt-0.5">{alertConfig[variant].icon}</span>
      <div className="flex-1 min-w-0">
        <h6 className="text-[13px] font-semibold text-[#151515]">{title}</h6>
        {message && <p className="text-[12px] text-[#626262] mt-0.5">{message}</p>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-[#626262] hover:text-[#151515] p-1"
          aria-label="Dismiss"
        >
          <CloseIcon size={14} color="inherit" />
        </button>
      )}
    </div>
  );
};

/* =========================================================================
   4. MODAL DIALOG
   ========================================================================= */

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: ModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#151515]/50 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg bg-white rounded-[6px] border border-[#EFEDEB] shadow-[0_16px_32px_rgba(21,21,21,0.12)] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between p-5 border-b border-[#EFEDEB]">
          <div>
            <h4 className="text-[16px] font-bold text-[#151515]">{title}</h4>
            {subtitle && <p className="text-[12px] text-[#626262] mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#626262] hover:text-[#151515] hover:bg-[#FAF8F6] rounded-[3px]"
            aria-label="Close modal"
          >
            <CloseIcon size={16} color="inherit" />
          </button>
        </div>

        <div className="p-5">{children}</div>

        {footer && <div className="p-4 bg-[#FAF8F6] border-t border-[#EFEDEB] flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
};

/* =========================================================================
   5. DRAWER
   ========================================================================= */

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Drawer = ({ open, onClose, title, children }: DrawerProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#151515]/40 backdrop-blur-[2px]">
      <div
        role="dialog"
        className="w-full max-w-md h-full bg-white border-l border-[#EFEDEB] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
      >
        <div className="flex items-center justify-between p-4 border-b border-[#EFEDEB]">
          <h4 className="text-[16px] font-bold text-[#151515]">{title}</h4>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#626262] hover:text-[#151515] rounded-[3px]"
            aria-label="Close drawer"
          >
            <CloseIcon size={16} color="inherit" />
          </button>
        </div>
        <div className="flex-1 p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

/* =========================================================================
   6. SKELETON LOADER
   ========================================================================= */

export const Skeleton = ({
  className = '',
  width,
  height,
}: {
  className?: string;
  width?: string;
  height?: string;
}) => {
  return (
    <div
      style={{ width, height }}
      className={`animate-pulse bg-[#EFEDEB] rounded-[3px] ${className}`}
    />
  );
};

/* =========================================================================
   7. EMPTY STATE
   ========================================================================= */

export const EmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}) => {
  return (
    <div className="p-10 border border-dashed border-[#EFEDEB] rounded-[6px] text-center bg-[#FAF8F6] flex flex-col items-center justify-center">
      {icon && <div className="mb-3 text-[#626262]">{icon}</div>}
      <h5 className="text-[15px] font-bold text-[#151515]">{title}</h5>
      <p className="text-[13px] text-[#626262] max-w-sm mt-1 mb-4 leading-relaxed">
        {description}
      </p>
      {actionLabel && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

/* =========================================================================
   8. LOADING INDICATOR
   ========================================================================= */

export const LoadingIndicator = ({ label = 'Loading specifications...' }: { label?: string }) => {
  return (
    <div className="flex items-center gap-2.5 text-[#626262] py-4">
      <SpinnerIcon size={18} color="brandOrange" />
      <span className="text-[13px] font-mono">{label}</span>
    </div>
  );
};
