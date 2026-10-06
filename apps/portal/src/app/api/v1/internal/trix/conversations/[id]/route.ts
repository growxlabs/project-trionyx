import { cookies } from 'next/headers';
import { AUTH_CONFIG, requireRole } from '@trionyx/auth';
import { apiError, apiSuccess } from '@trionyx/api';
import { trixConversationsRepository } from '@trionyx/database';
import type { TrixExecution, TrixResponse, ActivityStep } from '@trionyx/ai/responses';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = (await cookies()).get(AUTH_CONFIG.cookieName)?.value;
  let auth;
  try {
    auth = await requireRole(['MANAGING_DIRECTOR'], token);
  } catch {
    return apiError('FORBIDDEN', 'Access denied', 403);
  }

  try {
    const conversation = await trixConversationsRepository.getConversation(id, auth.user.id);
    if (!conversation) {
      return apiError('NOT_FOUND', 'Conversation not found', 404);
    }

    // Reconstruct TrixEntry[] pairs
    type SimpleEntry = {
      id: string;
      question: string;
      result?: TrixExecution;
    };

    const entries: SimpleEntry[] = [];
    let pendingUser: { id: string; question: string } | null = null;

    for (const msg of conversation.messages ?? []) {
      if (msg.role === 'user') {
        if (pendingUser) {
          entries.push({ id: pendingUser.id, question: pendingUser.question });
        }
        pendingUser = { id: msg.id, question: msg.content };
      } else if (msg.role === 'assistant' && pendingUser) {
        let result: TrixExecution | undefined = undefined;
        if (msg.resultPayload) {
          try {
            const parsed = JSON.parse(msg.resultPayload) as TrixResponse;
            const activity: ActivityStep[] = msg.activity ? JSON.parse(msg.activity) : [];
            result = {
              requestId: msg.id,
              conversationId: conversation.id,
              response: parsed,
              answer: msg.content,
              activity,
            };
          } catch {
            result = undefined;
          }
        }
        entries.push({
          id: pendingUser.id,
          question: pendingUser.question,
          result,
        });
        pendingUser = null;
      }
    }

    if (pendingUser) {
      entries.push({ id: pendingUser.id, question: pendingUser.question });
    }

    return apiSuccess(
      {
        conversation: {
          id: conversation.id,
          title: conversation.title,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
          entries,
        },
      },
      200,
      { 'Cache-Control': 'no-store' }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve conversation';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = (await cookies()).get(AUTH_CONFIG.cookieName)?.value;
  let auth;
  try {
    auth = await requireRole(['MANAGING_DIRECTOR'], token);
  } catch {
    return apiError('FORBIDDEN', 'Access denied', 403);
  }

  try {
    const deleted = await trixConversationsRepository.deleteConversation(id, auth.user.id);
    if (!deleted) {
      return apiError('NOT_FOUND', 'Conversation not found', 404);
    }
    return apiSuccess({ success: true }, 200, { 'Cache-Control': 'no-store' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete conversation';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}
