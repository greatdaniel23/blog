/**
 * Central translation dictionary for the bilingual site.
 *
 * Keys use dot-notation: 'section.subsection.element'
 * Pages import this and call t(locale, key) to get the right string.
 *
 * Shared/component-level strings are defined here.
 * Page-specific strings are in separate files under src/i18n/pages/
 * and merged at import time for bundle efficiency.
 */

import type { Locale } from './utils';

// ─── Shared translations (nav, footer, CTA, common UI) ──────────────────────

const shared: Record<Locale, Record<string, string>> = {
	id: {
		// Navigation
		'nav.home': 'Home',
		'nav.services': 'Layanan',
		'nav.ecosystem': 'Ekosistem',
		'nav.ai_agent': 'AI Agent',
		'nav.about': 'Tentang',
		'nav.blog': 'Blog',
		'nav.whatsapp_us': 'WhatsApp Kami',

		// Footer
		'footer.tagline': 'Solusi digital untuk bisnis hospitality modern.',
		'footer.services': 'Layanan',
		'footer.contact': 'Kontak',
		'footer.location': 'Lokasi',
		'footer.partners': 'Mitra',
		'footer.privacy': 'Kebijakan Privasi',
		'footer.whatsapp': 'WhatsApp',
		'footer.booking_engine': 'Booking Engine',
		'footer.blog': 'Blog',
		'footer.gallery': 'Galeri',
		'footer.web_dev': 'Pengembangan Web',
		'footer.digital_marketing': 'Digital Marketing',

		// CTA
		'cta.call': 'Telepon',
		'cta.whatsapp': 'WhatsApp',
		'cta.email': 'Email',
		'cta.request_quote': 'Minta Penawaran',
		'cta.phone_number': '0895-3687-07977 / 0881-480-2249',

		// Common
		'common.read_article': 'Baca Artikel',
		'common.back_to_blog': 'Kembali ke Blog',
		'common.written_by': 'Ditulis oleh',
		'common.updated': 'Diperbarui',
		'common.last_updated': 'Terakhir diperbarui',

		// Language toggle
		'lang.switch': 'EN',
		'lang.label': 'Ganti bahasa',
	},
	en: {
		// Navigation
		'nav.home': 'Home',
		'nav.services': 'Services',
		'nav.ecosystem': 'Ecosystem',
		'nav.ai_agent': 'AI Agent',
		'nav.about': 'About',
		'nav.blog': 'Blog',
		'nav.whatsapp_us': 'WhatsApp Us',

		// Footer
		'footer.tagline': 'Digital solutions for modern hospitality businesses.',
		'footer.services': 'Services',
		'footer.contact': 'Contact',
		'footer.location': 'Location',
		'footer.partners': 'Partners',
		'footer.privacy': 'Privacy Policy',
		'footer.whatsapp': 'WhatsApp',
		'footer.booking_engine': 'Booking Engine',
		'footer.blog': 'Blog',
		'footer.gallery': 'Gallery',
		'footer.web_dev': 'Web Development',
		'footer.digital_marketing': 'Digital Marketing',

		// CTA
		'cta.call': 'Call',
		'cta.whatsapp': 'WhatsApp',
		'cta.email': 'Email',
		'cta.request_quote': 'Request a Quote',
		'cta.phone_number': '0895-3687-07977 / 0881-480-2249',

		// Common
		'common.read_article': 'Read Article',
		'common.back_to_blog': 'Back to Blog',
		'common.written_by': 'Written by',
		'common.updated': 'Updated',
		'common.last_updated': 'Last updated',

		// Language toggle
		'lang.switch': 'ID',
		'lang.label': 'Switch language',
	},
};

import { homeStrings } from './pages/home';
import { aboutStrings } from './pages/about';

// ─── Translation lookup ──────────────────────────────────────────────────────

/** All translations: shared + page-specific (merged below). */
const allTranslations: Record<Locale, Record<string, string>> = {
	id: { ...shared.id, ...homeStrings.id, ...aboutStrings.id },
	en: { ...shared.en, ...homeStrings.en, ...aboutStrings.en },
};

/**
 * Register page-specific translations. Called from page translation files.
 */
export function registerTranslations(pageStrings: Record<Locale, Record<string, string>>): void {
	for (const locale of ['id', 'en'] as Locale[]) {
		Object.assign(allTranslations[locale], pageStrings[locale]);
	}
}

/**
 * Translate a key for the given locale.
 * Falls back to: other locale → key itself.
 */
export function t(locale: Locale, key: string): string {
	return allTranslations[locale]?.[key]
		?? allTranslations[locale === 'en' ? 'id' : 'en']?.[key]
		?? key;
}

/**
 * Create a locale-bound translator function.
 * Usage: const tr = useT('en'); tr('nav.home') → 'Home'
 */
export function useT(locale: Locale): (key: string) => string {
	return (key: string) => t(locale, key);
}
