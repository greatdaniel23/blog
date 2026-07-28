/**
 * i18n utilities for bilingual (ID/EN) site.
 *
 * Architecture:
 * - worker.ts rewrites /en/* → /* and sets X-Locale: en header
 * - middleware.ts reads the header and sets locals.locale
 * - Pages/components read locals.locale and call t(locale, key)
 */

export type Locale = 'id' | 'en';
export const defaultLocale: Locale = 'id';
export const locales: Locale[] = ['id', 'en'];

/**
 * Detect locale from the original request path (before worker rewrite).
 * Falls back to 'id' if no /en/ prefix.
 */
export function getLocaleFromPath(pathname: string): Locale {
	return pathname.startsWith('/en/') || pathname === '/en' ? 'en' : 'id';
}

/**
 * Build the localized version of a path.
 * - For 'id': returns the path as-is (no prefix)
 * - For 'en': adds /en/ prefix
 *
 * @param path - The canonical path without locale prefix (e.g., '/about', '/blog/foo')
 * @param locale - Target locale
 */
export function localizedPath(path: string, locale: Locale): string {
	// Ensure path starts with /
	const cleanPath = path.startsWith('/') ? path : `/${path}`;
	if (locale === 'id') return cleanPath;
	return `/en${cleanPath}`;
}

/**
 * Given the current localized path, return the alternate locale's path.
 * Used for the language toggle link.
 *
 * @param currentPath - The full path as seen by the user (may include /en/ prefix)
 * @param currentLocale - The current locale
 */
export function alternateLocalePath(currentPath: string, currentLocale: Locale): string {
	if (currentLocale === 'en') {
		// Strip /en prefix to get the base path
		const basePath = currentPath.replace(/^\/en(?=\/|$)/, '') || '/';
		return basePath;
	} else {
		// Add /en prefix
		return `/en${currentPath === '/' ? '' : currentPath}`;
	}
}

/**
 * Get the base path (without locale prefix).
 */
export function stripLocalePrefix(path: string): string {
	return path.replace(/^\/en(?=\/|$)/, '') || '/';
}
