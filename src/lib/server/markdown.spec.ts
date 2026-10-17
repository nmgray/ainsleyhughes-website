import { describe, expect, it } from 'vitest';
import { renderMarkdown, sanitizeArticleHtml } from './markdown';

describe('article Markdown', () => {
	it('renders the structures used by legacy articles', () => {
		const html = renderMarkdown(
			'## Local guidance\n\nA **clear** paragraph with [details](https://example.com).\n\n- First\n- Second\n\n> Helpful note'
		);

		expect(html).toContain('<h2>Local guidance</h2>');
		expect(html).toContain('<strong>clear</strong>');
		expect(html).toContain('<ul>');
		expect(html).toContain('<blockquote>');
		expect(html).toContain('rel="noopener noreferrer"');
	});

	it('prevents unsafe markup and additional page-level headings', () => {
		const html = renderMarkdown(
			'# Page heading\n\n<script>alert(1)</script>\n\n[unsafe](javascript:alert(1))'
		);

		expect(html).toContain('<h2>Page heading</h2>');
		expect(html).not.toContain('<script');
		expect(html).not.toContain('javascript:');
	});

	it('sanitizes legacy article HTML with the same policy', () => {
		const html = sanitizeArticleHtml(
			'<h2>Existing section</h2><img src="/image.webp" onerror="alert(1)"><iframe src="https://example.com"></iframe>'
		);

		expect(html).toContain('<h2>Existing section</h2>');
		expect(html).toContain('loading="lazy"');
		expect(html).not.toContain('onerror');
		expect(html).not.toContain('iframe');
	});
});
