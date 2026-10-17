import { env } from '$env/dynamic/private';

const windows = new Map<string, { count: number; resetsAt: number }>();
let warnedAboutLocalLimiter = false;

function checkLocalRateLimit(key: string, limit: number, durationMs: number) {
	const now = Date.now();
	const current = windows.get(key);
	if (!current || current.resetsAt <= now) {
		windows.set(key, { count: 1, resetsAt: now + durationMs });
		return true;
	}
	if (current.count >= limit) return false;
	current.count += 1;
	return true;
}

const incrementScript = `
local current = redis.call('INCR', KEYS[1])
if current == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
return current
`;

export async function checkRateLimit(key: string, limit = 8, durationMs = 60_000) {
	const url = env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, '');
	const token = env.UPSTASH_REDIS_REST_TOKEN;
	if (!url || !token) {
		if (env.NODE_ENV === 'production' && !warnedAboutLocalLimiter) {
			console.warn(
				'UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are not configured; rate limits are local to this process.'
			);
			warnedAboutLocalLimiter = true;
		}
		return checkLocalRateLimit(key, limit, durationMs);
	}

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			authorization: `Bearer ${token}`,
			'content-type': 'application/json'
		},
		body: JSON.stringify(['EVAL', incrementScript, 1, `ainsley:rate-limit:${key}`, durationMs]),
		signal: AbortSignal.timeout(3000)
	});
	if (!response.ok) {
		throw new Error(`Distributed rate limiter failed with HTTP ${response.status}`);
	}
	const payload = (await response.json()) as { result?: number; error?: string };
	if (payload.error || typeof payload.result !== 'number') {
		throw new Error(
			`Distributed rate limiter returned an invalid response: ${payload.error ?? 'missing count'}`
		);
	}
	return payload.result <= limit;
}
