import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { env } from '$env/dynamic/private';

export const adminCookie = 'ainsley-admin-session';
export const adminSessionSeconds = 60 * 60 * 12;

const scryptKeyLength = 64;

type AdminAuthConfig = {
	passwordHash?: string;
	sessionSecret?: string;
};

function configuredAuth(): AdminAuthConfig {
	return {
		passwordHash: env.ADMIN_PASSWORD_HASH,
		sessionSecret: env.ADMIN_SESSION_SECRET
	};
}

function configuredSecret(config: AdminAuthConfig) {
	return config.sessionSecret?.trim() ?? '';
}

function safeEqual(left: string, right: string) {
	const leftBuffer = Buffer.from(left);
	const rightBuffer = Buffer.from(right);
	return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function hashAdminPassword(password: string, salt = randomBytes(16).toString('base64url')) {
	if (password.length < 14) throw new Error('Admin passwords must be at least 14 characters.');
	const derived = scryptSync(password, salt, scryptKeyLength).toString('base64url');
	return `scrypt$${salt}$${derived}`;
}

export function adminConfigured(config = configuredAuth()) {
	return Boolean(
		config.passwordHash?.startsWith('scrypt$') && configuredSecret(config).length >= 32
	);
}

export function createAdminToken(now = Date.now(), config = configuredAuth()) {
	if (!adminConfigured(config)) throw new Error('Admin authentication is not configured.');
	const payload = Buffer.from(
		JSON.stringify({
			version: 1,
			issuedAt: now,
			expiresAt: now + adminSessionSeconds * 1000,
			nonce: randomBytes(16).toString('base64url')
		})
	).toString('base64url');
	const signature = createHmac('sha256', configuredSecret(config))
		.update(payload)
		.digest('base64url');
	return `${payload}.${signature}`;
}

export function verifyAdminToken(
	value: string | undefined,
	now = Date.now(),
	config = configuredAuth()
) {
	if (!value || !adminConfigured(config)) return false;
	const [payload, signature, extra] = value.split('.');
	if (!payload || !signature || extra) return false;
	const expected = createHmac('sha256', configuredSecret(config))
		.update(payload)
		.digest('base64url');
	if (!safeEqual(signature, expected)) return false;

	try {
		const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString()) as {
			version?: number;
			issuedAt?: number;
			expiresAt?: number;
			nonce?: string;
		};
		return Boolean(
			parsed.version === 1 &&
			typeof parsed.issuedAt === 'number' &&
			parsed.issuedAt <= now &&
			typeof parsed.expiresAt === 'number' &&
			parsed.expiresAt > now &&
			typeof parsed.nonce === 'string' &&
			parsed.nonce.length >= 16
		);
	} catch {
		return false;
	}
}

export function verifyAdminPassword(value: string, config = configuredAuth()) {
	const encoded = config.passwordHash?.trim();
	if (!encoded || !adminConfigured(config)) return false;
	const [algorithm, salt, expected, extra] = encoded.split('$');
	if (algorithm !== 'scrypt' || !salt || !expected || extra) return false;
	try {
		const received = scryptSync(value, salt, scryptKeyLength).toString('base64url');
		return safeEqual(received, expected);
	} catch {
		return false;
	}
}

export function isSameOrigin(request: Request, url: URL) {
	return request.headers.get('origin') === url.origin;
}
