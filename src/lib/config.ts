export const site = {
	name: 'Ainsley Hughes',
	title: 'Ainsley Hughes, Ojai REALTOR®',
	origin: 'https://www.ainsleyhughes.com',
	description:
		'Ojai-based REALTOR® helping buyers and sellers throughout the Ojai Valley, West Ventura County, and South Santa Barbara County.',
	phone: '805-896-5383',
	email: 'ainsleyhughes@kw.com',
	license: 'DRE #02105320',
	brokerage: 'Keller Williams World Class',
	address: {
		addressLocality: 'Ojai',
		addressRegion: 'CA',
		addressCountry: 'US'
	},
	social: [
		'https://www.instagram.com/ainsleyhughesrealestate',
		'https://www.facebook.com/Ainsley-Hughes-Keller-Williams-DRE-02105320-100532458107772/',
		'https://www.linkedin.com/in/ainsleyhughes/'
	],
	defaultImage: '/images/migrated/image-asset-f4553fde4.webp',
	portrait: '/images/migrated/image-asset-865d23788.webp',
	logo: '/images/migrated/WC-GreyBlack-21592c3fd.webp'
} as const;

export const adobeFontKitUrl =
	'https://use.typekit.net/ik/UZmZGmJqokfex8mgWKQjXuVwa03GMlQZcEROOXQNuZ6feTJ2fFHN4UJLFRbh52jhWDmqZR6u5QFcFAm8FDItwhwuFhsKjA9hZs7TMPG0SaiydKuDpAoX-emD-WT8SKuCZhmtO1FUiABkZWF3jAF8OcFzdPUy-AoDdemo-Ym1-emDOcFzdPUCdhFydeyzSabCSaiydKuDpAoX-emD-WT8SKuCZhmtO1FUiABkZWF3jAF8OcFzdPUaiaS0jA80ShU8pAyuZhy8SkoRdhXCiaiaO1FajAtlSa80iey8Sh8EZWJldei8pfoDSWmyScmDSeBRZPoRdhXK2YgkdayTdAIldcNhjPJ5dYsROA4zZeN0-PXUFD97fbKnMsMMeMI6MKG4f5J7IMMjMkMfH6qJn3IbMg6IJMJ7f6K3UMIbMg6BJMJ7fbKCMsMMeMC6MKG4fHXgIMMjgKMfH6qJK3IbMg6YJMJ7fbKTMsMMeM66MKG4f5w7IMMj2PMfH6qJKbIbMg64JMJ7fbK3MsMMeMt6MKGHfOYIMsMMeMv6MKG4fJ3gIMMjIPMfH6qJxKCbMs65JMHbMiAktpvB.js';

export const neighborhoods = [
	{ href: '/ojai-neighborhoods-1', label: 'Ojai Neighborhoods' },
	{ href: '/ojaiterrace', label: 'Ojai Terrace' },
	{ href: '/taormina', label: 'Taormina' },
	{ href: '/meiners-oaks-ojai', label: 'Meiners Oaks' },
	{ href: '/downtown-ojai', label: 'Downtown Ojai' }
] as const;

export const neighborhoodMaps = {
	ojaiterrace: { name: 'Ojai Terrace', latitude: 34.4364532, longitude: -119.2642427 },
	taormina: { name: 'Taormina', latitude: 34.4396248, longitude: -119.2709634 },
	'meiners-oaks-ojai': {
		name: 'Meiners Oaks',
		latitude: 34.4498574,
		longitude: -119.2818743
	},
	'downtown-ojai': { name: 'Downtown Ojai', latitude: 34.4477743, longitude: -119.2459371 }
} as const;

export const navigation = [
	{ href: '/', label: 'Home' },
	{ href: '/about', label: 'About' },
	{ href: '/how-i-work', label: 'How I Work' },
	{ href: '/sell', label: 'Sell' },
	{ href: '/ojai-real-estate-reviews', label: 'Client Reviews' },
	{ href: '/ojai-neighborhoods-1', label: 'Ojai Neighborhoods' },
	{ href: '/blog', label: 'Blog' },
	{ href: '/contact', label: 'Contact' }
] as const;
