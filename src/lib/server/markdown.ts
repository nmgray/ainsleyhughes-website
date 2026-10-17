import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const allowedTags = [
	'p',
	'h2',
	'h3',
	'h4',
	'ul',
	'ol',
	'li',
	'blockquote',
	'strong',
	'em',
	'a',
	'img',
	'figure',
	'figcaption',
	'br',
	'hr',
	'pre',
	'code',
	'table',
	'thead',
	'tbody',
	'tr',
	'th',
	'td'
];

export function sanitizeArticleHtml(value: string) {
	return sanitizeHtml(value, {
		allowedTags,
		allowedAttributes: {
			a: ['href', 'title', 'rel'],
			img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
			th: ['align'],
			td: ['align']
		},
		allowedSchemes: ['http', 'https', 'mailto', 'tel'],
		transformTags: {
			h1: 'h2',
			a: (_name, attributes) => ({
				tagName: 'a',
				attribs: {
					...attributes,
					...(attributes.href?.startsWith('http') ? { rel: 'noopener noreferrer' } : {})
				}
			}),
			img: (_name, attributes) => ({
				tagName: 'img',
				attribs: { ...attributes, loading: 'lazy' }
			})
		}
	});
}

export function renderMarkdown(value: string) {
	const rendered = marked.parse(value, { async: false, breaks: true, gfm: true }) as string;
	return sanitizeArticleHtml(rendered);
}
