const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { createApp } = require('./server');

test('POST /api/contact responds with a structured error when email is not configured', async () => {
  const app = createApp();
  const server = app.listen(0);
  await once(server, 'listening');

  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+91 99999 99999',
        service: 'software',
        message: 'Hello from the test suite.'
      })
    });

    const body = await response.json();

    assert.equal(response.status, 500);
    assert.equal(body.success, false);
    assert.match(body.message, /configured/i);
  } finally {
    server.close();
  }
});
