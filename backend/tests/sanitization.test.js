import { describe, it, expect, vi } from 'vitest';
import { sanitizeInput } from '../src/middlewares/sanitize.js';

describe('Sanitization Middleware', () => {
  it('should trim leading and trailing whitespace from string properties', () => {
    const req = {
      body: { name: '  Bench Press  ', title: ' Chest Workout  ' },
    };
    const res = {};
    const next = vi.fn();

    sanitizeInput(req, res, next);

    expect(req.body.name).toBe('Bench Press');
    expect(req.body.title).toBe('Chest Workout');
    expect(next).toHaveBeenCalled();
  });

  it('should strip malicious script and HTML tags from input strings', () => {
    const req = {
      body: {
        notes: '<script>alert("XSS Attack")</script>Morning weigh-in',
        title: '<h1>Upper Body</h1>',
      },
    };
    const res = {};
    const next = vi.fn();

    sanitizeInput(req, res, next);

    expect(req.body.notes).toBe('Morning weigh-in');
    expect(req.body.title).toBe('Upper Body');
    expect(next).toHaveBeenCalled();
  });
});
