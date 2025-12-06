# API validation and response audit

This document captures validation and schema-alignment observations for the `/api/generate` route and its consumers.

## Implemented guardrails
- Add request validation for JSON bodies, content type, prompt type/length, and context shape/size to return clear 4xx errors inste
  ad of generic 503s.
- Standardize error responses (including 405/429) to always include rate-limit metadata and `enhanced: false` for frontend banner
  consistency.
- Limit logging to prompt length/context presence rather than raw prompt text to reduce noise and leakage risk.

## Input validation
- `prompt` is only checked for truthiness, so empty strings, non-string payloads, and oversized inputs return a generic 503 via the catch block instead of a 4xx validation error.
- `context` is trusted blindly; unexpected shapes or extremely large objects could increase token costs without guardrails.
- The handler accepts any content type and does not verify JSON parsing before destructuring `req.body`.

## Error handling and logging
- Failures raised before `err.status` is set (e.g., missing `prompt`) default to a 503 response, masking client-side issues that should be 400-level errors.
- Logs include raw user prompts plus API key source/format details, which may expose sensitive data and add noise in production logs.
- Error responses always mark `enhanced: false`, but 405 and preflight paths omit `requestsLeft`/`limit`, which the frontend expects for banner state.

## Response schema vs. frontend expectations
- Successful responses return `{ result, requestsLeft, limit, enhanced }`, matching `LLMService` mapping to `{ output, requestsLeft, limit, enhanced }`.
- Non-429 error responses rely on `getUsageStats` for `requestsLeft/limit`, but the 405 handler returns only `{ error }`, leading to `requestsLeft` being `undefined` in `LLMService` error branches.
- The frontend interprets missing `requestsLeft` as `null` and may show a zero-count banner, so supplying rate-limit fields on all error shapes would avoid UI drift.

## Edge cases and missing safeguards
- No authentication beyond optional `X-API-Key` format checks; callers can bypass limits by rotating IPs because the rate limiter keys by IP-month.
- Large or malformed prompts are never truncated or rejected, risking slow OpenAI calls and unbounded cost on shared deployments.
- Retry logic cascades through multiple models without a max duration/attempt cap, which could amplify latency under failure conditions.
