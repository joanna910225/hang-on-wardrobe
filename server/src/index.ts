import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import { AnalyzeItemRequestSchema } from './contracts';
import { scoreMatch } from './scoring';
import { analyzeClothingImage } from './vision';

const port = Number(process.env.PORT ?? 8787);
const model = process.env.OPENAI_VISION_MODEL?.trim() || 'gpt-5.6-terra';
const allowedOrigin = process.env.CORS_ORIGIN?.trim() || '*';
const maxBodyBytes = 13_000_000;

function writeJson(response: ServerResponse, status: number, body: unknown, requestId?: string) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    ...(requestId ? { 'X-Request-Id': requestId } : {}),
  });
  response.end(JSON.stringify(body));
}

async function readJson(request: IncomingMessage) {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > maxBodyBytes) throw new Error('PAYLOAD_TOO_LARGE');
    chunks.push(buffer);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
}

const server = createServer(async (request, response) => {
  const requestId = randomUUID();

  if (request.method === 'OPTIONS') {
    writeJson(response, 204, null, requestId);
    return;
  }

  if (request.method === 'GET' && request.url === '/health') {
    writeJson(response, 200, {
      ok: true,
      model,
      aiConfigured: Boolean(process.env.OPENAI_API_KEY),
    }, requestId);
    return;
  }

  if (request.method !== 'POST' || request.url !== '/v1/analyze-item') {
    writeJson(response, 404, { error: { code: 'NOT_FOUND', message: 'Route not found.' } }, requestId);
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    writeJson(response, 503, {
      error: { code: 'AI_NOT_CONFIGURED', message: 'OPENAI_API_KEY is not configured on the server.' },
    }, requestId);
    return;
  }

  try {
    const body = AnalyzeItemRequestSchema.parse(await readJson(request));
    const analysis = await analyzeClothingImage(body.imageDataUrl, body.categoryHint, {
      apiKey: process.env.OPENAI_API_KEY,
      model,
    });
    const match = scoreMatch({
      analysis,
      candidateName: body.candidateName,
      categoryHint: body.categoryHint,
      liking: body.liking,
      wardrobe: body.wardrobe,
    });

    writeJson(response, 200, { requestId, model, analysis, match }, requestId);
  } catch (error) {
    if (error instanceof SyntaxError) {
      writeJson(response, 400, { error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' } }, requestId);
      return;
    }
    if (error instanceof Error && error.message === 'PAYLOAD_TOO_LARGE') {
      writeJson(response, 413, { error: { code: 'PAYLOAD_TOO_LARGE', message: 'Image request is too large.' } }, requestId);
      return;
    }
    if (error && typeof error === 'object' && 'issues' in error) {
      writeJson(response, 400, { error: { code: 'INVALID_REQUEST', message: 'Request fields failed validation.' } }, requestId);
      return;
    }

    console.error(`[${requestId}] clothing analysis failed`, error instanceof Error ? error.message : 'Unknown error');
    writeJson(response, 502, {
      error: { code: 'VISION_ANALYSIS_FAILED', message: 'The clothing photo could not be analyzed.' },
    }, requestId);
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Hang On analysis server listening on http://0.0.0.0:${port}`);
  console.log(`Vision model: ${model}; API key configured: ${Boolean(process.env.OPENAI_API_KEY)}`);
});
