'use client';

import React, { ComponentProps, useCallback } from 'react';
import { StickToBottom, useStickToBottomContext } from 'use-stick-to-bottom';
import { ArrowDown } from '@carbon/icons-react';
import { cn } from '@/lib/utils';

export type ConversationProps = ComponentProps<typeof StickToBottom>;

export const Conversation = ({ className, ...props }: ConversationProps) => (
  <StickToBottom
    className={cn('relative flex-1 overflow-y-auto overscroll-contain scrollbar-thin', className)}
    initial="smooth"
    resize="smooth"
    role="log"
    {...props}
  />
);

export type ConversationContentProps = ComponentProps<typeof StickToBottom.Content>;

export const ConversationContent = ({ className, ...props }: ConversationContentProps) => (
  <StickToBottom.Content
    className={cn('flex flex-col gap-8 py-6 px-4 max-w-4xl mx-auto w-full', className)}
    {...props}
  />
);

export type ConversationEmptyStateProps = ComponentProps<'div'> & {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  suggestions?: { label: string; prompt: string; onClick?: () => void }[];
};

export const ConversationEmptyState = ({
  className,
  title = 'What do you want to know?',
  description = 'Search, analyse and navigate Trionyx operations.',
  icon,
  children,
  suggestions,
  ...props
}: ConversationEmptyStateProps) => (
  <div
    className={cn(
      'flex size-full flex-col items-center justify-center gap-3 py-16 px-4 text-center',
      className
    )}
    {...props}
  >
    {children ?? (
      <>
        {icon && <div className="text-[var(--text-muted)] mb-2">{icon}</div>}
        <div className="space-y-1 max-w-md">
          <h2 className="font-semibold text-2xl text-[var(--text-primary)] tracking-tight">{title}</h2>
          {description && (
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{description}</p>
          )}
        </div>
        {suggestions && suggestions.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-lg">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={s.onClick}
                className="inline-flex items-center px-3.5 py-2 text-xs font-medium rounded-md border border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors cursor-pointer"
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </>
    )}
  </div>
);

export type ConversationScrollButtonProps = ComponentProps<'button'>;

export const ConversationScrollButton = ({ className, ...props }: ConversationScrollButtonProps) => {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  const handleScrollToBottom = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  if (isAtBottom) return null;

  return (
    <button
      type="button"
      onClick={handleScrollToBottom}
      aria-label="Scroll to bottom"
      className={cn(
        'absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center size-9 rounded-full bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] shadow-md transition-all cursor-pointer z-10',
        className
      )}
      {...props}
    >
      <ArrowDown size={18} />
    </button>
  );
};
