import React from 'react';
import { SearchIcon, CheckIcon, AlertCircleIcon } from './Icons';

/* =========================================================================
   FORM LABELS & FEEDBACK MESSAGES
   ========================================================================= */

export const FormLabel = ({
  children,
  required = false,
  htmlFor,
  className = '',
}: {
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
  className?: string;
}) => (
  <label
    htmlFor={htmlFor}
    className={`block text-[12px] font-semibold tracking-wide uppercase text-[#151515] mb-1.5 ${className}`}
  >
    {children}
    {required && <span className="text-[#E52421] ml-0.5">*</span>}
  </label>
);

export const HelperText = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => <p className={`text-[12px] text-[#626262] mt-1.5 leading-normal ${className}`}>{children}</p>;

export const ErrorMessage = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <p className={`flex items-center gap-1.5 text-[12px] text-[#E52421] font-medium mt-1.5 ${className}`}>
    <AlertCircleIcon size={14} color="brandRed" />
    <span>{children}</span>
  </p>
);

/* =========================================================================
   TEXT INPUT & SEARCH INPUT
   ========================================================================= */

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ error, success, leadingIcon, trailingIcon, disabled, className = '', ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {leadingIcon && (
          <span className="absolute left-3 text-[#626262] pointer-events-none shrink-0 flex items-center">
            {leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          disabled={disabled}
          className={`w-full h-10 bg-white text-[#151515] placeholder:text-[#626262]/60 text-[14px] rounded-[4px] border transition-all duration-150 outline-none
            ${leadingIcon ? 'pl-9' : 'pl-3.5'}
            ${trailingIcon ? 'pr-9' : 'pr-3.5'}
            ${
              error
                ? 'border-[#E52421] focus:border-[#E52421] focus:ring-2 focus:ring-[#E52421]/15'
                : success
                ? 'border-[#16A34A] focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/15'
                : 'border-[#EFEDEB] hover:border-[#D8D5D0] focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/15'
            }
            disabled:bg-[#FAF8F6] disabled:text-[#626262] disabled:cursor-not-allowed disabled:border-[#EFEDEB]
            ${className}`}
          {...props}
        />
        {trailingIcon && (
          <span className="absolute right-3 text-[#626262] pointer-events-none shrink-0 flex items-center">
            {trailingIcon}
          </span>
        )}
      </div>
    );
  }
);
TextInput.displayName = 'TextInput';

export const SearchInput = React.forwardRef<HTMLInputElement, Omit<TextInputProps, 'leadingIcon'>>(
  ({ placeholder = 'Search products, coatings, films...', ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        type="search"
        placeholder={placeholder}
        leadingIcon={<SearchIcon size={16} color="muted" />}
        {...props}
      />
    );
  }
);
SearchInput.displayName = 'SearchInput';

/* =========================================================================
   TEXTAREA
   ========================================================================= */

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, disabled, rows = 4, className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        className={`w-full p-3 bg-white text-[#151515] placeholder:text-[#626262]/60 text-[14px] rounded-[4px] border transition-all duration-150 outline-none resize-y
          ${
            error
              ? 'border-[#E52421] focus:border-[#E52421] focus:ring-2 focus:ring-[#E52421]/15'
              : 'border-[#EFEDEB] hover:border-[#D8D5D0] focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/15'
          }
          disabled:bg-[#FAF8F6] disabled:text-[#626262] disabled:cursor-not-allowed
          ${className}`}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

/* =========================================================================
   SELECT
   ========================================================================= */

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, disabled, children, className = '', ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          disabled={disabled}
          className={`w-full h-10 px-3.5 pr-9 bg-white text-[#151515] text-[14px] rounded-[4px] border appearance-none transition-all duration-150 outline-none cursor-pointer
            ${
              error
                ? 'border-[#E52421] focus:border-[#E52421] focus:ring-2 focus:ring-[#E52421]/15'
                : 'border-[#EFEDEB] hover:border-[#D8D5D0] focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/15'
            }
            disabled:bg-[#FAF8F6] disabled:text-[#626262] disabled:cursor-not-allowed
            ${className}`}
          {...props}
        >
          {children}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#626262]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>
    );
  }
);
Select.displayName = 'Select';

/* =========================================================================
   CHECKBOX & RADIO
   ========================================================================= */

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, disabled, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? `check-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    return (
      <label
        htmlFor={inputId}
        className={`inline-flex items-start gap-2.5 select-none cursor-pointer group ${
          disabled ? 'cursor-not-allowed opacity-50' : ''
        } ${className}`}
      >
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            id={inputId}
            type="checkbox"
            ref={ref}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <div className="w-4 h-4 rounded-[2px] border border-[#EFEDEB] bg-white transition-all peer-checked:bg-[#FF6A00] peer-checked:border-[#FF6A00] peer-focus-visible:ring-2 peer-focus-visible:ring-[#FF6A00]/20 group-hover:border-[#D8D5D0]" />
          <span className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">
            <CheckIcon size={12} color="inverse" strokeWidth={2.5} />
          </span>
        </div>
        {(label || description) && (
          <div className="text-[13px] leading-tight">
            {label && <span className="font-medium text-[#151515] block">{label}</span>}
            {description && <span className="text-[#626262] text-[12px] block mt-0.5">{description}</span>}
          </div>
        )}
      </label>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, disabled, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? `radio-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    return (
      <label
        htmlFor={inputId}
        className={`inline-flex items-start gap-2.5 select-none cursor-pointer group ${
          disabled ? 'cursor-not-allowed opacity-50' : ''
        } ${className}`}
      >
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            id={inputId}
            type="radio"
            ref={ref}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <div className="w-4 h-4 rounded-full border border-[#EFEDEB] bg-white transition-all peer-checked:border-[#FF6A00] peer-focus-visible:ring-2 peer-focus-visible:ring-[#FF6A00]/20 group-hover:border-[#D8D5D0]" />
          <div className="w-2 h-2 rounded-full bg-[#FF6A00] absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>
        {(label || description) && (
          <div className="text-[13px] leading-tight">
            {label && <span className="font-medium text-[#151515] block">{label}</span>}
            {description && <span className="text-[#626262] text-[12px] block mt-0.5">{description}</span>}
          </div>
        )}
      </label>
    );
  }
);
Radio.displayName = 'Radio';

/* =========================================================================
   TOGGLE SWITCH
   ========================================================================= */

export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
}

export const ToggleSwitch = ({
  checked,
  onChange,
  label,
  disabled = false,
  id,
}: ToggleSwitchProps) => {
  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center gap-3 select-none cursor-pointer ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-[#FF6A00] ${
          checked ? 'bg-[#FF6A00]' : 'bg-[#EFEDEB]'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
      {label && <span className="text-[13px] font-medium text-[#151515]">{label}</span>}
    </label>
  );
};

/* =========================================================================
   FILE INPUT (AUTOMOTIVE SPECIFICATION / DEALER UPLOAD)
   ========================================================================= */

export const FileInput = ({
  label = 'Upload technical specification or certification',
  hint = 'PDF, CAD, or PNG up to 10MB',
  disabled = false,
  onChange,
}: {
  label?: string;
  hint?: string;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <div
      className={`border border-dashed border-[#EFEDEB] rounded-[4px] p-6 text-center bg-[#FAF8F6] hover:border-[#D8D5D0] transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-1.5">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#626262"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span className="text-[13px] font-semibold text-[#151515]">{label}</span>
        <span className="text-[11px] text-[#626262]">{hint}</span>
        <input
          type="file"
          disabled={disabled}
          onChange={onChange}
          className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
};
