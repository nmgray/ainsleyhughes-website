import Database from 'better-sqlite3';
import { describe, expect, it } from 'vitest';
import { retirePreEditorialMarketSnapshots } from './market-migration';

describe('legacy market snapshot retirement', () => {
	it('retires published snapshots after the earlier market migration and leaves later publications alone', () => {
		const database = new Database(':memory:');
		try {
			database.exec(`
				CREATE TABLE app_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL);
				CREATE TABLE market_snapshots (
					id INTEGER PRIMARY KEY,
					status TEXT NOT NULL CHECK (status IN ('draft', 'published'))
				);
				INSERT INTO app_migrations VALUES ('market-insights-to-snapshots-v1', '2026-09-01');
				INSERT INTO market_snapshots VALUES (1, 'published'), (2, 'draft');
			`);

			retirePreEditorialMarketSnapshots(database);
			expect(database.prepare('SELECT id, status FROM market_snapshots ORDER BY id').all()).toEqual(
				[
					{ id: 1, status: 'draft' },
					{ id: 2, status: 'draft' }
				]
			);
			expect(
				database
					.prepare(
						"SELECT COUNT(*) AS count FROM app_migrations WHERE name = 'retire-pre-editorial-market-snapshots-v1'"
					)
					.get()
			).toEqual({ count: 1 });

			database.prepare("INSERT INTO market_snapshots VALUES (3, 'published')").run();
			retirePreEditorialMarketSnapshots(database);
			expect(database.prepare('SELECT status FROM market_snapshots WHERE id = 3').get()).toEqual({
				status: 'published'
			});
		} finally {
			database.close();
		}
	});
});
