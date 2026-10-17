import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import Database from 'better-sqlite3';
import { env } from '$env/dynamic/private';
import type { Post } from '$lib/content';
import { renderMarkdown } from '$lib/server/markdown';
import { retirePreEditorialMarketSnapshots } from '$lib/server/market-migration';

export type ManagedPost = {
	id: number;
	slug: string;
	title: string;
	excerpt: string;
	bodyText: string;
	image: string | null;
	imageAlt: string;
	published: string;
	modified: string;
	status: 'draft' | 'published';
	priority: number;
	seoTitle: string;
	seoDescription: string;
};

export type MarketMetric = {
	label: string;
	value: string;
	note: string;
};

export type MarketInsights = {
	id: number;
	headline: string;
	summary: string;
	periodLabel: string;
	sourceName: string;
	sourceUrl: string;
	sourceDate: string;
	metrics: MarketMetric[];
	status: 'draft' | 'published';
	priority: number;
	updated: string;
};

export type ManagedReview = {
	id: number;
	theme: string;
	quote: string;
	reviewerName: string;
	relationship: string;
	sourceName: string;
	sourceUrl: string;
	rating: number | null;
	publicationApproved: boolean;
	status: 'draft' | 'published';
	priority: number;
	updated: string;
};

const databasePath = resolve(env.CONTENT_DB_PATH || 'data/content.sqlite');
mkdirSync(dirname(databasePath), { recursive: true });

const database = new Database(databasePath);
database.pragma('journal_mode = WAL');
database.exec(`
	CREATE TABLE IF NOT EXISTS posts (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		slug TEXT NOT NULL UNIQUE,
		title TEXT NOT NULL,
		excerpt TEXT NOT NULL,
		body_text TEXT NOT NULL,
		image TEXT,
		image_alt TEXT NOT NULL,
		published_at TEXT NOT NULL,
		updated_at TEXT NOT NULL,
		status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
		seo_title TEXT NOT NULL,
		seo_description TEXT NOT NULL
	);
	CREATE TABLE IF NOT EXISTS market_insights (
		id INTEGER PRIMARY KEY CHECK (id = 1),
		headline TEXT NOT NULL,
		summary TEXT NOT NULL,
		period_label TEXT NOT NULL,
		source_name TEXT NOT NULL,
		source_url TEXT NOT NULL,
		source_date TEXT NOT NULL,
		metrics_json TEXT NOT NULL,
		status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
		updated_at TEXT NOT NULL
	);
	CREATE TABLE IF NOT EXISTS reviews (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		theme TEXT NOT NULL,
		quote TEXT NOT NULL,
		reviewer_name TEXT NOT NULL,
		relationship TEXT NOT NULL,
		source_name TEXT NOT NULL,
		source_url TEXT NOT NULL,
		rating INTEGER CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
		publication_approved INTEGER NOT NULL CHECK (publication_approved IN (0, 1)),
		status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
		updated_at TEXT NOT NULL
	);
	CREATE TABLE IF NOT EXISTS market_snapshots (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		headline TEXT NOT NULL,
		summary TEXT NOT NULL,
		period_label TEXT NOT NULL,
		source_name TEXT NOT NULL,
		source_url TEXT NOT NULL,
		source_date TEXT NOT NULL,
		metrics_json TEXT NOT NULL,
		status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
		updated_at TEXT NOT NULL
	);
	CREATE TABLE IF NOT EXISTS app_migrations (
		name TEXT PRIMARY KEY,
		applied_at TEXT NOT NULL
	);
	CREATE TABLE IF NOT EXISTS article_likes (
		post_slug TEXT NOT NULL,
		voter_id TEXT NOT NULL,
		created_at TEXT NOT NULL,
		PRIMARY KEY (post_slug, voter_id)
	);
	CREATE INDEX IF NOT EXISTS article_likes_post_slug_idx ON article_likes(post_slug);
	CREATE TABLE IF NOT EXISTS editorial_revisions (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		kind TEXT NOT NULL CHECK (kind IN ('market', 'neighborhood', 'blog', 'review')),
		slug TEXT NOT NULL,
		payload TEXT NOT NULL,
		created_at TEXT NOT NULL
	);
	CREATE INDEX IF NOT EXISTS editorial_revisions_resource_idx
		ON editorial_revisions(kind, slug, id);
	CREATE TABLE IF NOT EXISTS editorial_publications (
		kind TEXT NOT NULL,
		slug TEXT NOT NULL,
		revision_id INTEGER NOT NULL REFERENCES editorial_revisions(id),
		published_at TEXT NOT NULL,
		PRIMARY KEY (kind, slug)
	)
`);

const editorialDefinition = database
	.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'editorial_revisions'")
	.get() as { sql: string };
if (!editorialDefinition.sql.includes("'review'")) {
	const foreignKeys = database.pragma('foreign_keys', { simple: true }) as number;
	database.pragma('foreign_keys = OFF');
	try {
		database.transaction(() => {
			database.exec(`
				CREATE TABLE editorial_revisions_next (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					kind TEXT NOT NULL CHECK (kind IN ('market', 'neighborhood', 'blog', 'review')),
					slug TEXT NOT NULL,
					payload TEXT NOT NULL,
					created_at TEXT NOT NULL
				);
				INSERT INTO editorial_revisions_next SELECT * FROM editorial_revisions;
				DROP TABLE editorial_revisions;
				ALTER TABLE editorial_revisions_next RENAME TO editorial_revisions;
				CREATE INDEX editorial_revisions_resource_idx
					ON editorial_revisions(kind, slug, id);
			`);
		})();
	} finally {
		database.pragma(`foreign_keys = ${foreignKeys ? 'ON' : 'OFF'}`);
	}
}

const publicationColumns = database.prepare('PRAGMA table_info(editorial_publications)').all() as {
	name: string;
}[];
if (!publicationColumns.some((column) => column.name === 'published_at')) {
	database.exec(
		"ALTER TABLE editorial_publications ADD COLUMN published_at TEXT NOT NULL DEFAULT ''"
	);
	database
		.prepare("UPDATE editorial_publications SET published_at = ? WHERE published_at = ''")
		.run(new Date().toISOString());
}

function ensurePriorityColumn(table: 'posts' | 'market_snapshots' | 'reviews') {
	const columns = database.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
	if (!columns.some((column) => column.name === 'priority')) {
		database.exec(`ALTER TABLE ${table} ADD COLUMN priority INTEGER NOT NULL DEFAULT 0`);
	}
}

ensurePriorityColumn('posts');
ensurePriorityColumn('market_snapshots');
ensurePriorityColumn('reviews');

const marketHistoryMigration = 'market-insights-to-snapshots-v1';
if (!database.prepare('SELECT 1 FROM app_migrations WHERE name = ?').get(marketHistoryMigration)) {
	database.transaction(() => {
		const legacy = database.prepare('SELECT * FROM market_insights WHERE id = 1').get() as
			Record<string, unknown> | undefined;
		if (legacy) {
			database
				.prepare(
					`INSERT INTO market_snapshots
						(headline, summary, period_label, source_name, source_url, source_date, metrics_json, status, updated_at)
					 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
				)
				.run(
					legacy.headline,
					legacy.summary,
					legacy.period_label,
					legacy.source_name,
					legacy.source_url,
					legacy.source_date,
					legacy.metrics_json,
					legacy.status,
					legacy.updated_at
				);
		}

		database
			.prepare('INSERT INTO app_migrations (name, applied_at) VALUES (?, ?)')
			.run(marketHistoryMigration, new Date().toISOString());
	})();
}
retirePreEditorialMarketSnapshots(database);

const rowToManagedPost = (row: Record<string, unknown>): ManagedPost => ({
	id: Number(row.id),
	slug: String(row.slug),
	title: String(row.title),
	excerpt: String(row.excerpt),
	bodyText: String(row.body_text),
	image: row.image ? String(row.image) : null,
	imageAlt: String(row.image_alt),
	published: String(row.published_at),
	modified: String(row.updated_at),
	status: row.status as ManagedPost['status'],
	priority: Number(row.priority ?? 0),
	seoTitle: String(row.seo_title),
	seoDescription: String(row.seo_description)
});

const rowToMarketInsights = (row: Record<string, unknown>): MarketInsights => {
	const metrics = JSON.parse(String(row.metrics_json));
	if (!Array.isArray(metrics)) throw new Error('Market insights metrics must be an array.');
	return {
		id: Number(row.id),
		headline: String(row.headline),
		summary: String(row.summary),
		periodLabel: String(row.period_label),
		sourceName: String(row.source_name),
		sourceUrl: String(row.source_url),
		sourceDate: String(row.source_date),
		metrics: metrics.map((metric) => ({
			label: String(metric.label),
			value: String(metric.value),
			note: String(metric.note ?? '')
		})),
		status: row.status as MarketInsights['status'],
		priority: Number(row.priority ?? 0),
		updated: String(row.updated_at)
	};
};

const rowToManagedReview = (row: Record<string, unknown>): ManagedReview => ({
	id: Number(row.id),
	theme: String(row.theme),
	quote: String(row.quote),
	reviewerName: String(row.reviewer_name),
	relationship: String(row.relationship),
	sourceName: String(row.source_name),
	sourceUrl: String(row.source_url),
	rating: row.rating === null ? null : Number(row.rating),
	publicationApproved: Boolean(row.publication_approved),
	status: row.status as ManagedReview['status'],
	priority: Number(row.priority ?? 0),
	updated: String(row.updated_at)
});

function toPost(post: ManagedPost): Post {
	return {
		slug: post.slug,
		collection: 'blog',
		title: post.title,
		excerpt: post.excerpt,
		body: renderMarkdown(post.bodyText),
		image: post.image,
		imageAlt: post.imageAlt,
		published: post.published,
		modified: post.modified,
		priority: post.priority,
		author: 'Ainsley Hughes',
		categories: [],
		tags: [],
		seoTitle: post.seoTitle,
		seoDescription: post.seoDescription
	};
}

export function managedPosts() {
	return database
		.prepare('SELECT * FROM posts ORDER BY priority DESC, published_at DESC')
		.all()
		.map((row) => rowToManagedPost(row as Record<string, unknown>));
}

export function publishedManagedPosts(now = new Date()) {
	return database
		.prepare(
			`SELECT * FROM posts
			 WHERE status = 'published' AND published_at <= ?
			 ORDER BY priority DESC, published_at DESC`
		)
		.all(now.toISOString())
		.map((row) => toPost(rowToManagedPost(row as Record<string, unknown>)));
}

export function findManagedPost(slug: string, now = new Date()) {
	const row = database
		.prepare("SELECT * FROM posts WHERE slug = ? AND status = 'published' AND published_at <= ?")
		.get(slug, now.toISOString()) as Record<string, unknown> | undefined;
	return row ? toPost(rowToManagedPost(row)) : undefined;
}

export function saveManagedPost(post: Omit<ManagedPost, 'id' | 'modified'> & { id?: number }) {
	const modified = new Date().toISOString();
	if (post.id) {
		database
			.prepare(
				`UPDATE posts SET slug = ?, title = ?, excerpt = ?, body_text = ?, image = ?,
				image_alt = ?, published_at = ?, updated_at = ?, status = ?, seo_title = ?,
				seo_description = ?, priority = ? WHERE id = ?`
			)
			.run(
				post.slug,
				post.title,
				post.excerpt,
				post.bodyText,
				post.image,
				post.imageAlt,
				post.published,
				modified,
				post.status,
				post.seoTitle,
				post.seoDescription,
				post.priority,
				post.id
			);
		return post.id;
	}
	return Number(
		database
			.prepare(
				`INSERT INTO posts
				(slug, title, excerpt, body_text, image, image_alt, published_at, updated_at, status, seo_title, seo_description, priority)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
			)
			.run(
				post.slug,
				post.title,
				post.excerpt,
				post.bodyText,
				post.image,
				post.imageAlt,
				post.published,
				modified,
				post.status,
				post.seoTitle,
				post.seoDescription,
				post.priority
			).lastInsertRowid
	);
}

export function deleteManagedPost(id: number) {
	return database.prepare('DELETE FROM posts WHERE id = ?').run(id).changes > 0;
}

export function updateManagedPostSettings(
	id: number,
	status: ManagedPost['status'],
	priority: number
) {
	return (
		database
			.prepare('UPDATE posts SET status = ?, priority = ?, updated_at = ? WHERE id = ?')
			.run(status, priority, new Date().toISOString(), id).changes > 0
	);
}

export function marketSnapshots() {
	return database
		.prepare(
			'SELECT * FROM market_snapshots ORDER BY priority DESC, source_date DESC, updated_at DESC'
		)
		.all()
		.map((row) => rowToMarketInsights(row as Record<string, unknown>));
}

export function publishedMarketInsights() {
	const row = database
		.prepare(
			`SELECT * FROM market_snapshots
			 WHERE status = 'published'
			 ORDER BY priority DESC, updated_at DESC
			 LIMIT 1`
		)
		.get() as Record<string, unknown> | undefined;
	return row ? rowToMarketInsights(row) : undefined;
}

export function saveMarketInsights(
	insights: Omit<MarketInsights, 'id' | 'updated'> & { id?: number }
) {
	const updated = new Date().toISOString();
	return database.transaction(() => {
		if (insights.status === 'published') {
			database
				.prepare("UPDATE market_snapshots SET status = 'draft' WHERE status = 'published'")
				.run();
		}
		if (insights.id) {
			database
				.prepare(
					`UPDATE market_snapshots SET
						headline = ?, summary = ?, period_label = ?, source_name = ?, source_url = ?,
						source_date = ?, metrics_json = ?, status = ?, priority = ?, updated_at = ?
					 WHERE id = ?`
				)
				.run(
					insights.headline,
					insights.summary,
					insights.periodLabel,
					insights.sourceName,
					insights.sourceUrl,
					insights.sourceDate,
					JSON.stringify(insights.metrics),
					insights.status,
					insights.priority,
					updated,
					insights.id
				);
			return insights.id;
		}
		return Number(
			database
				.prepare(
					`INSERT INTO market_snapshots
						(headline, summary, period_label, source_name, source_url, source_date, metrics_json, status, priority, updated_at)
					 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
				)
				.run(
					insights.headline,
					insights.summary,
					insights.periodLabel,
					insights.sourceName,
					insights.sourceUrl,
					insights.sourceDate,
					JSON.stringify(insights.metrics),
					insights.status,
					insights.priority,
					updated
				).lastInsertRowid
		);
	})();
}

export function deleteMarketInsights(id: number) {
	return database.prepare('DELETE FROM market_snapshots WHERE id = ?').run(id).changes > 0;
}

export function updateMarketInsightsSettings(
	id: number,
	status: MarketInsights['status'],
	priority: number
) {
	return database.transaction(() => {
		if (status === 'published') {
			database
				.prepare("UPDATE market_snapshots SET status = 'draft' WHERE status = 'published'")
				.run();
		}
		return (
			database
				.prepare(
					'UPDATE market_snapshots SET status = ?, priority = ?, updated_at = ? WHERE id = ?'
				)
				.run(status, priority, new Date().toISOString(), id).changes > 0
		);
	})();
}

export function managedReviews() {
	return database
		.prepare('SELECT * FROM reviews ORDER BY priority DESC, updated_at DESC')
		.all()
		.map((row) => rowToManagedReview(row as Record<string, unknown>));
}

export function publishedManagedReviews() {
	return database
		.prepare(
			`SELECT * FROM reviews
			 WHERE status = 'published' AND publication_approved = 1 AND source_url <> ''
			 ORDER BY priority DESC, updated_at DESC`
		)
		.all()
		.map((row) => rowToManagedReview(row as Record<string, unknown>));
}

export function saveManagedReview(review: Omit<ManagedReview, 'id' | 'updated'> & { id?: number }) {
	const updated = new Date().toISOString();
	if (review.id) {
		database
			.prepare(
				`UPDATE reviews SET theme = ?, quote = ?, reviewer_name = ?, relationship = ?,
					source_name = ?, source_url = ?, rating = ?, publication_approved = ?,
					status = ?, priority = ?, updated_at = ? WHERE id = ?`
			)
			.run(
				review.theme,
				review.quote,
				review.reviewerName,
				review.relationship,
				review.sourceName,
				review.sourceUrl,
				review.rating,
				review.publicationApproved ? 1 : 0,
				review.status,
				review.priority,
				updated,
				review.id
			);
		return review.id;
	}
	return Number(
		database
			.prepare(
				`INSERT INTO reviews
					(theme, quote, reviewer_name, relationship, source_name, source_url, rating,
					 publication_approved, status, priority, updated_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
			)
			.run(
				review.theme,
				review.quote,
				review.reviewerName,
				review.relationship,
				review.sourceName,
				review.sourceUrl,
				review.rating,
				review.publicationApproved ? 1 : 0,
				review.status,
				review.priority,
				updated
			).lastInsertRowid
	);
}

export function deleteManagedReview(id: number) {
	return database.prepare('DELETE FROM reviews WHERE id = ?').run(id).changes > 0;
}

export function updateManagedReviewSettings(
	id: number,
	status: ManagedReview['status'],
	priority: number
) {
	return (
		database
			.prepare('UPDATE reviews SET status = ?, priority = ?, updated_at = ? WHERE id = ?')
			.run(status, priority, new Date().toISOString(), id).changes > 0
	);
}

export type EditorialKind = 'market' | 'neighborhood' | 'blog' | 'review';
export type EditorialRevision<T> = {
	id: number;
	kind: EditorialKind;
	slug: string;
	content: T;
	createdAt: string;
	publishedAt?: string;
};

function readEditorialRevision<T>(row: Record<string, unknown>): EditorialRevision<T> {
	return {
		id: Number(row.id),
		kind: row.kind as EditorialKind,
		slug: String(row.slug),
		content: JSON.parse(String(row.payload)) as T,
		createdAt: String(row.created_at),
		...(row.published_at ? { publishedAt: String(row.published_at) } : {})
	};
}

export function editorialRevision<T>(kind: EditorialKind, slug: string, id: number) {
	const row = database
		.prepare('SELECT * FROM editorial_revisions WHERE kind = ? AND slug = ? AND id = ?')
		.get(kind, slug, id) as Record<string, unknown> | undefined;
	return row ? readEditorialRevision<T>(row) : null;
}

export function editorialHistory<T>(kind: EditorialKind, slug: string) {
	return database
		.prepare('SELECT * FROM editorial_revisions WHERE kind = ? AND slug = ? ORDER BY id DESC')
		.all(kind, slug)
		.map((row) => readEditorialRevision<T>(row as Record<string, unknown>));
}

export function editorialSlugs(kind: EditorialKind) {
	return database
		.prepare('SELECT DISTINCT slug FROM editorial_revisions WHERE kind = ?')
		.all(kind)
		.map((row) => (row as { slug: string }).slug);
}

export function publishedEditorial<T>(kind: EditorialKind, slug: string) {
	const row = database
		.prepare(
			`SELECT revisions.*, publications.published_at FROM editorial_publications AS publications
			 JOIN editorial_revisions AS revisions ON revisions.id = publications.revision_id
			 WHERE publications.kind = ? AND publications.slug = ?`
		)
		.get(kind, slug) as Record<string, unknown> | undefined;
	return row ? readEditorialRevision<T>(row) : null;
}

export function publishedEditorialList<T>(kind: EditorialKind) {
	return database
		.prepare(
			`SELECT revisions.*, publications.published_at FROM editorial_publications AS publications
			 JOIN editorial_revisions AS revisions ON revisions.id = publications.revision_id
			 WHERE publications.kind = ?`
		)
		.all(kind)
		.map((row) => readEditorialRevision<T>(row as Record<string, unknown>));
}

export function saveEditorialDraft<T>(kind: EditorialKind, slug: string, content: T) {
	return Number(
		database
			.prepare(
				'INSERT INTO editorial_revisions (kind, slug, payload, created_at) VALUES (?, ?, ?, ?)'
			)
			.run(kind, slug, JSON.stringify(content), new Date().toISOString()).lastInsertRowid
	);
}

export function publishEditorialRevision(kind: EditorialKind, slug: string, id: number) {
	return database.transaction(() => {
		if (!editorialRevision(kind, slug, id)) return false;
		database
			.prepare(
				`INSERT INTO editorial_publications (kind, slug, revision_id, published_at) VALUES (?, ?, ?, ?)
				 ON CONFLICT(kind, slug) DO UPDATE SET revision_id = excluded.revision_id,
				 published_at = excluded.published_at`
			)
			.run(kind, slug, id, new Date().toISOString());
		return true;
	})();
}

export function unpublishEditorial(kind: EditorialKind, slug: string, expectedId: number) {
	return (
		database
			.prepare('DELETE FROM editorial_publications WHERE kind = ? AND slug = ? AND revision_id = ?')
			.run(kind, slug, expectedId).changes > 0
	);
}

export function articleLikeState(slug: string, voterId?: string) {
	const count = Number(
		(
			database
				.prepare('SELECT COUNT(*) AS count FROM article_likes WHERE post_slug = ?')
				.get(slug) as { count: number }
		).count
	);
	const liked = voterId
		? Boolean(
				database
					.prepare('SELECT 1 FROM article_likes WHERE post_slug = ? AND voter_id = ?')
					.get(slug, voterId)
			)
		: false;
	return { count, liked };
}

export function toggleArticleLike(slug: string, voterId: string) {
	return database.transaction(() => {
		const existing = database
			.prepare('SELECT 1 FROM article_likes WHERE post_slug = ? AND voter_id = ?')
			.get(slug, voterId);
		if (existing) {
			database
				.prepare('DELETE FROM article_likes WHERE post_slug = ? AND voter_id = ?')
				.run(slug, voterId);
		} else {
			database
				.prepare('INSERT INTO article_likes (post_slug, voter_id, created_at) VALUES (?, ?, ?)')
				.run(slug, voterId, new Date().toISOString());
		}
		return articleLikeState(slug, voterId);
	})();
}
