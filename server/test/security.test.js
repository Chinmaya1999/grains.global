import test from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-123456';
const sec = await import('../src/security.js');
const jwt = (await import('jsonwebtoken')).default;

test('password policy accepts a good password', () => assert.equal(sec.passwordProblem('Str0ngPass99'), null));
test('password policy rejects short, letter-only, number-only and over-72-byte passwords', () => {
  assert.match(sec.passwordProblem('abc12'), /at least 8/);
  assert.match(sec.passwordProblem('onlyletters'), /letter and one number/);
  assert.match(sec.passwordProblem('12345678'), /letter and one number/);
  assert.match(sec.passwordProblem('a1'.repeat(37)), /72/);
  assert.ok(sec.passwordProblem(undefined));
});

test('sanitize strips $-operators and dotted keys from body, params and query', () => {
  const req = { body: { email: { $gt: '' }, nested: [{ ok: 1, $where: 'x' }], 'a.b': 1, keep: 'yes' }, params: {}, query: { family: { $ne: 'x' } } };
  sec.sanitize(req, {}, () => {});
  assert.deepEqual(req.body, { email: {}, nested: [{ ok: 1 }], keep: 'yes' });
  assert.deepEqual(req.query, { family: {} });
});

test('access tokens are HS256, short-lived and carry the token version', () => {
  const tok = sec.signAccess({ _id: 'abc123', tokenVersion: 4 });
  const p = jwt.verify(tok, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  assert.equal(p.sub, 'abc123'); assert.equal(p.tv, 4);
  assert.ok(p.exp - p.iat <= 15 * 60);
  assert.throws(() => jwt.verify(tok, 'wrong-secret'));
  const none = `${Buffer.from('{"alg":"none"}').toString('base64url')}.${Buffer.from('{"sub":"x"}').toString('base64url')}.`;
  assert.throws(() => jwt.verify(none, process.env.JWT_SECRET, { algorithms: ['HS256'] }));
});

test('requireRole allows listed roles and blocks everyone else', () => {
  const run = (role) => { let code = 200; sec.requireRole('admin')({ user: role && { role } }, { status: (c) => ({ json: () => { code = c; } }) }, () => {}); return code; };
  assert.equal(run('admin'), 200); assert.equal(run('buyer'), 403); assert.equal(run(undefined), 403);
});
