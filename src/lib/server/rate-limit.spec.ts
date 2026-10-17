import { describe, expect, it } from 'vitest';
import { checkRateLimit } from './rate-limit';

describe('rate limiting', () => {
	it('enforces the configured request count in local development', async () => {
		const key = `test:${crypto.randomUUID()}`;
		await expect(checkRateLimit(key, 2, 60_000)).resolves.toBe(true);
		await expect(checkRateLimit(key, 2, 60_000)).resolves.toBe(true);
		await expect(checkRateLimit(key, 2, 60_000)).resolves.toBe(false);
	});
});
