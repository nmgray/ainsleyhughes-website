import { defineConfig } from '@playwright/test';

export default defineConfig({
	use: { baseURL: 'http://127.0.0.1:4175' },
	webServer: {
		command: 'npm run build && npx vite preview --host 127.0.0.1 --port 4175',
		port: 4175,
		env: {
			...process.env,
			ADMIN_PASSWORD_HASH:
				'scrypt$playwright-salt$7vNFvfWzgCvDxZRvANyARY1HAmDoyaO5HNoGdO9ElYLay3V2dMl_Ge3uo00b47dkdUkGK9BYVmtmHZqJmuckQg',
			ADMIN_SESSION_SECRET: 'playwright-session-secret-at-least-32-characters',
			CONTENT_DB_PATH: 'data/playwright-content.sqlite',
			CONTENT_UPLOAD_DIR: 'data/playwright-uploads'
		}
	},
	testMatch: '**/*.e2e.{ts,js}'
});
