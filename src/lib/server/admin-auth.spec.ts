import { scryptSync } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
	adminConfigured,
	createAdminToken,
	isSameOrigin,
	verifyAdminPassword,
	verifyAdminToken
} from './admin-auth';

function configure(password = 'a-secure-test-password') {
	const hash = scryptSync(password, 'test-salt', 64).toString('base64url');
	return {
		passwordHash: `scrypt$test-salt$${hash}`,
		sessionSecret: 'test-session-secret-with-more-than-32-characters'
	};
}

describe('admin authentication', () => {
	it('verifies a scrypt password hash without storing the password', () => {
		const config = configure();
		expect(adminConfigured(config)).toBe(true);
		expect(verifyAdminPassword('a-secure-test-password', config)).toBe(true);
		expect(verifyAdminPassword('wrong-password', config)).toBe(false);
	});

	it('signs sessions and rejects expired or modified tokens', () => {
		const config = configure();
		const issuedAt = Date.now();
		const token = createAdminToken(issuedAt, config);
		expect(verifyAdminToken(token, issuedAt + 1, config)).toBe(true);
		expect(verifyAdminToken(token, issuedAt + 12 * 60 * 60 * 1000, config)).toBe(false);
		expect(verifyAdminToken(`${token}modified`, issuedAt + 1, config)).toBe(false);
	});

	it('requires an exact same-origin request', () => {
		const url = new URL('https://www.ainsleyhughes.com/admin');
		expect(
			isSameOrigin(new Request(url, { headers: { origin: 'https://www.ainsleyhughes.com' } }), url)
		).toBe(true);
		expect(
			isSameOrigin(new Request(url, { headers: { origin: 'https://attacker.example' } }), url)
		).toBe(false);
	});
});
