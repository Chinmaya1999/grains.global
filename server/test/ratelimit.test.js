import test from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-123456';
const { loginLimiter } = await import('../src/security.js');
const express = (await import('express')).default;

// A tiny stand-in for the sign-in route: "ok" succeeds, anything else fails with 401.
function serve() {
  const app = express();
  app.use(express.json());
  app.post('/login', loginLimiter, (req, res) => (req.body.pw === 'ok' ? res.json({ ok: true }) : res.status(401).json({ error: 'nope' })));
  return new Promise((resolve) => { const s = app.listen(0, () => resolve(s)); });
}
const post = (port, pw) => fetch(`http://127.0.0.1:${port}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pw }) }).then((r) => r.status);

test('successful sign-ins never count toward the limit (an office behind one IP is not locked out)', async () => {
  const s = await serve();
  const codes = [];
  for (let i = 0; i < 30; i++) codes.push(await post(s.address().port, 'ok'));
  s.close();
  assert.ok(codes.every((c) => c === 200), `expected 30 x 200, got ${[...new Set(codes)]}`);
});

test('failed sign-ins are cut off with 429 after 20 attempts, and then even a correct password waits', async () => {
  const s = await serve();
  const port = s.address().port;
  for (let i = 0; i < 20; i++) assert.equal(await post(port, 'bad'), 401);
  assert.equal(await post(port, 'bad'), 429);
  assert.equal(await post(port, 'ok'), 429);
  s.close();
});
