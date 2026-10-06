import { cookies } from 'next/headers';
import { AUTH_CONFIG, requireRole } from '@trionyx/auth';
import { apiError, apiSuccess } from '@trionyx/api';
import { getDatabaseUrl, isPostgresUrl, consumeTrixRateLimit, trixConversationsRepository } from '@trionyx/database';
import { requestSchema, runTrix, readBoundedTrixBody, type TrixProgress, type TrixStreamEvent } from '@trionyx/ai';

export const runtime = 'nodejs';

class RouteError extends Error {
  constructor(readonly code: string, message: string, readonly status: number) { super(message); }
}
function failure(error: unknown) {
  if (error instanceof RouteError) return { status: error.status, code: error.code, message: error.message };
  const code = error instanceof Error ? error.message : '';
  if (code === 'TRIX_REQUEST_TOO_LARGE') return { status: 413, code: 'INVALID_INPUT', message: 'Request is too large' };
  if (code === 'UNAUTHENTICATED') return { status: 401, code, message: 'Not authenticated' };
  if (code === 'FORBIDDEN') return { status: 403, code, message: 'Access denied' };
  return { status: 503, code: 'INTERNAL_ERROR', message: 'TRIX could not complete the request. Try again.' };
}

async function persistTurn(
  conversationId: string,
  userId: string,
  question: string,
  result: Awaited<ReturnType<typeof runTrix>>
) {
  try {
    await trixConversationsRepository.ensureConversation(conversationId, userId, question);
    await trixConversationsRepository.saveMessage({
      conversationId,
      role: 'user',
      content: question,
    });
    await trixConversationsRepository.saveMessage({
      conversationId,
      role: 'assistant',
      content: result.answer ?? '',
      resultPayload: JSON.stringify(result.response),
      activity: JSON.stringify(result.activity),
    });
  } catch (err) {
    console.error('Failed to persist TRIX conversation turn:', err);
  }
}

/** Every gate before the agent runs. `step` wraps each one so a streamed request can show it as it happens. */
async function prepare(request: Request, step: <T>(name: TrixProgress['toolName'], run: () => Promise<T>) => Promise<T>) {
  const token = (await cookies()).get(AUTH_CONFIG.cookieName)?.value;
  const auth = await step('verifyAccess', () => requireRole(['MANAGING_DIRECTOR'], token));
  const input = await step('checkRequest', async () => {
    if (request.headers.get('origin') !== new URL(request.url).origin) throw new RouteError('FORBIDDEN', 'Access denied', 403);
    const text = await readBoundedTrixBody(request, 10000);
    let parsed;
    try { parsed = requestSchema.safeParse(JSON.parse(text)); } catch { parsed = null; }
    if (!parsed?.success) throw new RouteError('INVALID_INPUT', 'Enter an inventory, dealer network or enquiry question', 400);
    return parsed.data;
  });
  await step('connectData', async () => {
    if (!isPostgresUrl(getDatabaseUrl())) throw new RouteError('DATABASE_NOT_CONFIGURED', 'TRIX requires the configured Trionyx database', 503);
  });
  await step('checkLimit', async () => {
    if (!await consumeTrixRateLimit(auth.user.id, 'chat')) throw new RouteError('TRIX_RATE_LIMITED', 'Too many TRIX requests. Try again in a minute.', 429);
  });
  return { input, context: { user: auth.user, sessionId: auth.session.id } };
}

export async function POST(request: Request) {
  if (!request.headers.get('accept')?.includes('application/x-ndjson')) {
    try {
      const { input, context } = await prepare(request, (_name, run) => run());
      const result = await runTrix(input, context);
      await persistTurn(input.conversationId, context.user.id, input.message, result);
      return apiSuccess(result, 200, { 'Cache-Control': 'no-store' });
    } catch (error) {
      const { status, code, message } = failure(error);
      return apiError(code, message, status);
    }
  }
  // Streamed: one JSON event per line. Gate checks and tool calls report as progress, then one result or error.
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: TrixStreamEvent) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      const progress = (step: TrixProgress) => send({ type: 'progress', step });
      try {
        const { input, context } = await prepare(request, async (toolName, run) => {
          progress({ toolName, status: 'started' });
          try { const result = await run(); progress({ toolName, status: 'succeeded' }); return result; }
          catch (error) { progress({ toolName, status: 'failed' }); throw error; }
        });
        const result = await runTrix(input, { ...context, onProgress: progress });
        await persistTurn(input.conversationId, context.user.id, input.message, result);
        send({ type: 'result', data: result });
      } catch (error) {
        const { code, message } = failure(error);
        send({ type: 'error', code, message });
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, { headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store' } });
}
