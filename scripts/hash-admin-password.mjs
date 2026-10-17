import { randomBytes, scryptSync } from 'node:crypto';

async function readHiddenPassword(prompt) {
	if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== 'function') {
		return new Promise((resolve) => {
			let input = '';
			process.stdin.setEncoding('utf8');
			process.stdin.on('data', (chunk) => (input += chunk));
			process.stdin.on('end', () => resolve(input.trimEnd()));
		});
	}

	process.stderr.write(prompt);
	process.stdin.setRawMode(true);
	process.stdin.resume();
	process.stdin.setEncoding('utf8');
	return new Promise((resolve, reject) => {
		let input = '';
		const finish = () => {
			process.stdin.off('data', handleInput);
			process.stdin.setRawMode(false);
			process.stdin.pause();
			process.stderr.write('\n');
			resolve(input);
		};
		const handleInput = (chunk) => {
			for (const character of chunk) {
				if (character === '\r' || character === '\n') {
					finish();
					return;
				}
				if (character === '\u0003') {
					process.stdin.off('data', handleInput);
					process.stdin.setRawMode(false);
					process.stdin.pause();
					process.stderr.write('\n');
					reject(new Error('Cancelled.'));
					return;
				}
				if (character === '\u007f' || character === '\b') {
					input = input.slice(0, -1);
					continue;
				}
				input += character;
			}
		};
		process.stdin.on('data', handleInput);
	});
}

const suppliedPassword = process.env.ADMIN_PASSWORD_TO_HASH;
const password = suppliedPassword || (await readHiddenPassword('Admin password: '));
if (!password || password.length < 14) {
	console.error('Use a password of at least 14 characters.');
	process.exit(1);
}
if (!suppliedPassword) {
	const confirmation = await readHiddenPassword('Confirm admin password: ');
	if (password !== confirmation) {
		console.error('Passwords do not match. No hash was generated.');
		process.exit(1);
	}
}

const salt = randomBytes(16).toString('base64url');
const hash = scryptSync(password, salt, 64).toString('base64url');
process.stdout.write(`scrypt$${salt}$${hash}`);
