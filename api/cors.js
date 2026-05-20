const DEFAULT_DEV_ORIGINS = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
]);

function getAllowedOrigins() {
  return (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function getRequestOrigin(req) {
  const host = req.headers.host;
  if (!host) return null;

  const forwardedProto = req.headers['x-forwarded-proto'];
  const proto = Array.isArray(forwardedProto)
    ? forwardedProto[0]
    : forwardedProto?.split(',')[0]?.trim();

  const scheme = proto || (req.socket?.encrypted ? 'https' : 'http');
  return `${scheme}://${host}`;
}

export function isOriginAllowed(origin, req) {
  if (!origin) return true;

  const allowedOrigins = getAllowedOrigins();
  if (allowedOrigins.includes(origin)) return true;

  const sameOrigin = getRequestOrigin(req);
  if (sameOrigin && origin === sameOrigin) return true;

  if (process.env.NODE_ENV !== 'production' && DEFAULT_DEV_ORIGINS.has(origin)) {
    return true;
  }

  return false;
}

export function applyCorsHeaders(req, res) {
  const origin = req.headers.origin;

  if (origin && isOriginAllowed(origin, req)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
}

export function rejectDisallowedCorsRequest(req, res) {
  const origin = req.headers.origin;
  if (!origin || isOriginAllowed(origin, req)) {
    return false;
  }

  res.status(403).json({ error: 'Origin not allowed' });
  return true;
}
