'use client';

import React, { ComponentProps, HTMLAttributes, memo, useState } from 'react';
import { Streamdown } from 'streamdown';
import { code } from '@streamdown/code';
import { Copy, Checkmark } from '@carbon/icons-react';
import { cn } from '@/lib/utils';

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: 'user' | 'assistant';
};

export const Message = ({ className, from, ...props }: MessageProps) => (
  <article
    className={cn(
      'group flex w-full min-w-0 max-w-full flex-col gap-2 box-border',
      from === 'user' ? 'is-user items-end' : 'is-assistant items-start',
      className
    )}
    {...props}
  />
);

export type MessageContentProps = HTMLAttributes<HTMLDivElement>;

export const MessageContent = ({ children, className, ...props }: MessageContentProps) => (
  <div
    className={cn(
      'flex w-fit min-w-0 max-w-full flex-col gap-2 text-sm leading-relaxed box-border',
      'group-[.is-user]:max-w-[85%] group-[.is-user]:rounded-2xl group-[.is-user]:bg-[var(--surface-raised)] group-[.is-user]:border group-[.is-user]:border-[var(--border)] group-[.is-user]:px-4 group-[.is-user]:py-3 group-[.is-user]:text-[var(--text-primary)] group-[.is-user]:shadow-xs',
      'group-[.is-assistant]:w-full group-[.is-assistant]:text-[var(--text-primary)]',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export type MessageResponseProps = ComponentProps<typeof Streamdown>;

const streamdownPlugins = { code };

export const MessageResponse = memo(
  ({ className, isAnimating, children, ...props }: MessageResponseProps) => (
    <div className={cn('streamdown-container w-full min-w-0 max-w-full box-border', className)}>
      <Streamdown
        className="w-full min-w-0 max-w-full text-[15px] leading-relaxed break-words"
        plugins={streamdownPlugins}
        caret="block"
        isAnimating={isAnimating}
        {...props}
      >
        {children}
      </Streamdown>
    </div>
  ),
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    nextProps.isAnimating === prevProps.isAnimating
);

MessageResponse.displayName = 'MessageResponse';

export type MessageActionsProps = HTMLAttributes<HTMLDivElement>;

export const MessageActions = ({ className, children, ...props }: MessageActionsProps) => (
  <div className={cn('flex items-center gap-1.5 mt-2 text-[var(--text-muted)]', className)} {...props}>
    {children}
  </div>
);

export type MessageActionProps = ComponentProps<'button'> & {
  label: string;
};

export const MessageAction = ({
  children,
  label,
  className,
  onClick,
  ...props
}: MessageActionProps) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    onClick={onClick}
    className={cn(
      'inline-flex items-center justify-center size-7 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] border border-transparent hover:border-[var(--border)] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40',
      className
    )}
    {...props}
  >
    {children}
    <span className="sr-only">{label}</span>
  </button>
);

export const MessageCopyAction = ({ content, className }: { content: string; className?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <MessageAction
      label={copied ? 'Copied' : 'Copy'}
      onClick={handleCopy}
      className={className}
    >
      {copied ? <Checkmark size={14} className="text-[var(--status-success)]" /> : <Copy size={14} />}
    </MessageAction>
  );
};
