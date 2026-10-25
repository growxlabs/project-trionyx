import assert from 'node:assert/strict';
import test from 'node:test';
import { NextRequest } from 'next/server';
import { proxy as portalProxy } from '../apps/portal/src/proxy';
import { proxy as distributorProxy } from '../apps/dealer/src/proxy';

for (const [name, proxy] of [['portal', portalProxy], ['distributor', distributorProxy]] as const) {
  test(`${name}: unknown guest URLs reach the 404 instead of login`, () => {
    const response = proxy(new NextRequest('https://example.com/missing-link'));
    assert.equal(response.headers.get('location'), null);
    assert.equal(response.headers.get('x-middleware-next'), '1');
  });
  test(`${name}: workspace records still require authentication`, () => {
    for (const path of ['/', '/overview', '/products', '/products/private-record', '/guide']) {
      const response = proxy(new NextRequest(`https://example.com${path}`));
      assert.equal(response.headers.get('location'), 'https://example.com/login');
    }
  });
  test(`${name}: authenticated missing records reach page authorization and notFound`, () => {
    const response = proxy(new NextRequest('https://example.com/products/missing-record', { headers: { cookie: 'trionyx_portal_session=test-only-token' } }));
    assert.equal(response.headers.get('x-middleware-next'), '1');
    assert.match(response.headers.get('cache-control') || '', /no-store/);
  });
}

test('distributor: account recovery pages remain reachable without a session', () => {
  for (const path of ['/login', '/forgot-password', '/reset-password', '/activate']) {
    assert.equal(distributorProxy(new NextRequest(`https://example.com${path}`)).headers.get('x-middleware-next'), '1');
  }
});
