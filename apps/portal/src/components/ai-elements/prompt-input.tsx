'use client';

import React, { ComponentProps, FormEvent, KeyboardEvent, useEffect, useRef } from 'react';
import { ArrowUp, StopFilledAlt } from '@carbon/icons-react';
import { cn } from '@/lib/utils';

export interface PromptInputMessage {
  text: string;
}

export type PromptInputProps = Omit<ComponentProps<'form'>, 'onSubmit'> & {
  onSubmit: (message: PromptInputMessage, event: FormEvent<HTMLFormElement>) => void;
};

export const PromptInput = ({
  className,
  onSubmit,
  children,
  ...props
}: PromptInputProps) => {
  return (
    <form
      style={{ outline: 'none' }}
      className={cn(
        'relative flex items-end gap-2 p-2 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] focus-within:border-[var(--border-strong)] transition-all outline-none focus:outline-none focus-visible:outline-none focus-within:outline-none',
        className
      )}
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const textarea = form.querySelector('textarea');
        const text = textarea?.value.trim() ?? '';
        if (text) {
          onSubmit({ text }, e);
        }
      }}
      {...props}
    >
      {children}
    </form>
  );
};

export type PromptInputTextareaProps = ComponentProps<'textarea'> & {
  maxHeight?: number;
};

export const PromptInputTextarea = React.forwardRef<HTMLTextAreaElement, PromptInputTextareaProps>(
  (
    {
      className,
      placeholder = 'Ask TRIX anything about Trionyx...',
      maxHeight = 160,
      rows = 1,
      value,
      onChange,
      onKeyDown,
      ...props
    },
    forwardedRef
  ) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef = (forwardedRef as React.RefObject<HTMLTextAreaElement | null>) ?? internalRef;

    useEffect(() => {
      const el = typeof forwardedRef === 'function' ? internalRef.current : (textareaRef?.current ?? internalRef.current);
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    }, [value, maxHeight, forwardedRef, textareaRef]);

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;

      if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        const form = e.currentTarget.form;
        const submitBtn = form?.querySelector('button[type="submit"]') as HTMLButtonElement | null;
        if (submitBtn && !submitBtn.disabled) {
          form?.requestSubmit();
        }
      }
    };

    return (
      <textarea
        ref={(node) => {
          (internalRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
          if (typeof forwardedRef === 'function') {
            forwardedRef(node);
          } else if (forwardedRef) {
            (forwardedRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
          }
        }}
        rows={rows}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{ outline: 'none' }}
        className={cn(
          'flex-1 min-h-[40px] max-h-[160px] py-2 px-3 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm leading-relaxed border-0 outline-none focus:outline-none focus-visible:outline-none resize-none font-sans',
          className
        )}
        {...props}
      />
    );
  }
);

PromptInputTextarea.displayName = 'PromptInputTextarea';

export type PromptInputSubmitProps = ComponentProps<'button'> & {
  status?: 'ready' | 'streaming' | 'submitted' | 'error';
  onStop?: () => void;
};

export const PromptInputSubmit = ({
  className,
  status = 'ready',
  disabled,
  onStop,
  children,
  ...props
}: PromptInputSubmitProps) => {
  const isBusy = status === 'streaming' || status === 'submitted';

  return (
    <button
      type={isBusy && onStop ? 'button' : 'submit'}
      disabled={!isBusy && disabled}
      onClick={isBusy && onStop ? (e) => { e.preventDefault(); onStop(); } : undefined}
      aria-label={isBusy ? 'Stop generation' : 'Send message'}
      style={{ outline: 'none' }}
      className={cn(
        'flex items-center justify-center shrink-0 size-9 rounded-lg transition-colors cursor-pointer outline-none focus:outline-none focus-visible:outline-none',
        isBusy
          ? 'bg-[var(--text-secondary)] text-[var(--background)] hover:bg-[var(--text-primary)]'
          : 'bg-[var(--accent,#F26522)] text-white hover:opacity-90 disabled:bg-[var(--surface-subtle)] disabled:text-[var(--text-muted)] disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children ?? (isBusy ? <StopFilledAlt size={18} /> : <ArrowUp size={18} />)}
    </button>
  );
};
