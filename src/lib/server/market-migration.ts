import type Database from 'better-sqlite3';

export function retirePreEditorialMarketSnapshots(database: Database.Database) {
	const migration = 'retire-pre-editorial-market-snapshots-v1';
	if (database.prepare('SELECT 1 FROM app_migrations WHERE name = ?').get(migration)) return;

	database.transaction(() => {
		database
			.prepare("UPDATE market_snapshots SET status = 'draft' WHERE status = 'published'")
			.run();
		database
			.prepare('INSERT INTO app_migrations (name, applied_at) VALUES (?, ?)')
			.run(migration, new Date().toISOString());
	})();
}
