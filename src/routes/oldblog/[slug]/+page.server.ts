import { error } from '@sveltejs/kit';
import sanitizeHtml from 'sanitize-html';
import { findPost } from '$lib/content';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const post = findPost('oldblog', params.slug);
	if (!post) error(404, 'Article not found');
	return {
		post: {
			...post,
			body: sanitizeHtml(post.body, {
				allowedTags: ['p', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'strong', 'em', 'a', 'br'],
				allowedAttributes: { a: ['href', 'title'] },
				allowedSchemes: ['http', 'https', 'mailto', 'tel']
			})
		}
	};
};
