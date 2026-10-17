import { error, redirect } from '@sveltejs/kit';
import { pages } from '$lib/content/pages';
import { currentNeighborhood } from '$lib/server/editorial';
import staticPages from '$lib/content/static-pages.json';
import type { PageServerLoad } from './$types';

const redirects: Record<string, string> = {
	home: '/',
	'home-five': '/',
	'new-gallery': '/featured-properties',
	'market-stats': '/'
};

type ImportedPage = {
	title: string;
	seoTitle: string;
	seoDescription: string;
	hero: string;
	html: string;
};

export const load: PageServerLoad = ({ params }) => {
	if (redirects[params.slug]) redirect(301, redirects[params.slug]);
	const content = pages[params.slug];
	const source =
		currentNeighborhood(params.slug) ?? (staticPages as Record<string, ImportedPage>)[params.slug];
	if (!content && !source) error(404, 'Page not found');
	return { content, source, slug: params.slug };
};
