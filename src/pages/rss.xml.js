import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from '../consts';

// RSS feed pulls published posts from D1 (the site's content store).
// The old getCollection('blog') approach was wrong — there is no file-based
// Astro content collection; all posts live in the D1 `posts` table.
export async function GET(context) {
	const { env } = context.locals.runtime ?? {};

	let items = [];
	if (env?.DB) {
		const { results } = await env.DB.prepare(
			'SELECT slug, title, description, pub_date FROM posts WHERE is_published = 1 ORDER BY pub_date DESC LIMIT 50'
		).all();
		items = (results ?? []).map((post) => ({
			title: post.title,
			description: post.description ?? '',
			pubDate: new Date(post.pub_date),
			link: `/blog/${post.slug}/`,
		}));
	}

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site ?? SITE_URL,
		items,
	});
}
