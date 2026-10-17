export type ContentSection = {
	heading: string;
	body: string;
	items?: string[];
};

export type ContentPage = {
	title: string;
	kicker?: string;
	description: string;
	hero?: string;
	sections: ContentSection[];
	cta?: { title: string; text: string; href: string; label: string };
};

const propertyHero = '/images/migrated/unsplash-image-x1gV05V73Pc-b21d44f8c.webp';

export const pages: Record<string, ContentPage> = {
	about: {
		title: 'Meet Ainsley',
		kicker: 'About',
		description:
			'Ainsley Hughes is an experienced Ojai real estate advisor serving buyers and sellers across the Ojai Valley and western Ventura County.',
		hero: propertyHero,
		sections: [
			{
				heading: 'Real estate experience since 2004',
				body: 'Ainsley got her start in real estate in 2004 while attending UC Santa Barbara and working as a weekend receptionist at a local brokerage. After graduation, she became a licensed broker in Oregon and managed planned unit developments, commercial buildings, multifamily communities, and high-rise condominiums.'
			},
			{
				heading: 'A thoughtful, grounded approach',
				body: 'Since earning her California salesperson license in 2019, Ainsley has helped clients move with comfort, clarity, and confidence. She believes every purchase or sale should feel supported from start to finish.'
			},
			{
				heading: 'At home in Ojai',
				body: 'Away from real estate, Ainsley swims with her family, bikes the Ojai Valley Trail, and tends an organic Ojai garden filled with fruit, vegetables, herbs, drought-tolerant plants, and chickens.'
			}
		],
		cta: {
			title: 'Talk through your next move',
			text: 'Start with a low-pressure conversation about your goals and timeline.',
			href: '/contact',
			label: 'Contact Ainsley'
		}
	},
	buy: {
		title: 'Buy with clarity',
		kicker: 'For buyers',
		description:
			'Local guidance for first-time buyers, investors, and buyers considering Ojai-area homes and homeowners associations.',
		hero: '/images/migrated/image-asset-f016976c1.webp',
		sections: [
			{
				heading: 'First-time homebuyers',
				body: 'Buying a first home is both a financial and personal decision. Ainsley helps first-time buyers understand financing, inspections, contingencies, neighborhoods, and the full cost of ownership before committing.'
			},
			{
				heading: 'HOAs, PUDs, and condominiums',
				body: 'With extensive community-association management experience, Ainsley helps buyers understand dues, reserve studies, governing documents, insurance, and the practical tradeoffs of buying into an association.'
			},
			{
				heading: 'Real estate investors',
				body: 'Ainsley has managed commercial properties, mixed-use buildings, apartments, single-family rentals, and furnished rentals. That operational experience helps investors evaluate more than the list price.'
			}
		],
		cta: {
			title: 'Plan your home search',
			text: 'Book a buyer consultation to clarify priorities, financing, and next steps.',
			href: '/buyers-consultation',
			label: 'Request a consultation'
		}
	},
	'how-i-work': {
		title: 'How I work as a real estate advisor in Ojai',
		description:
			'Clear, thoughtful real estate guidance grounded in local market conditions—not pressure or quick outcomes.',
		sections: [
			{
				heading: 'What my role actually is',
				body: 'My role is to help clients separate what matters from what does not and understand the tradeoffs of each option. Sometimes the right decision is to move forward. Other times it is to wait, adjust expectations, or decide not to sell.'
			},
			{
				heading: 'How I approach pricing',
				body: 'Market value reflects what buyers are willing and able to pay at a moment in time. List price is a strategy. I evaluate recent sales, current listings, buyer behavior, and how comparable homes are actually performing.'
			},
			{
				heading: 'What clients can expect',
				body: 'Clear and timely communication, thoughtful local guidance, and honest answers—even when they are uncomfortable.',
				items: [
					'No pressure to act before you are ready',
					'No promises unsupported by data or experience',
					'No advice driven by trends instead of fundamentals'
				]
			}
		],
		cta: {
			title: 'Considering a move?',
			text: 'A thoughtful conversation can help you understand the options, even if the answer is “not yet.”',
			href: '/contact',
			label: 'Start a conversation'
		}
	},
	'ojai-neighborhoods-1': {
		title: 'Ojai neighborhoods: a local guide',
		kicker: 'Explore the Ojai Valley',
		description:
			'Firsthand neighborhood guides covering homes, lots, location, walkability, nearby amenities, and practical details buyers should investigate.',
		hero: '/images/migrated/33-web-or-mls-UpmarketMedia-1108Capello-0737-5e68a0d8b.webp',
		sections: [
			{
				heading: 'Ojai Terrace',
				body: 'An established City of Ojai neighborhood known for mid-century ranch homes, sidewalks, mountain views, and easy access to the Ojai Valley Trail, Ojai Meadows, and downtown.',
				items: ['Read the Ojai Terrace guide → /ojaiterrace']
			},
			{
				heading: 'Taormina',
				body: 'A small historic district near Krotona, known for distinctive cottage-style homes, mature trees, mountain views, and its circular private road.',
				items: ['Read the Taormina guide → /taormina']
			},
			{
				heading: 'Meiners Oaks',
				body: 'An unincorporated Ojai Valley community with an eclectic mix of bungalows, remodeled properties, and larger newer homes.',
				items: ['Read the Meiners Oaks guide → /meiners-oaks-ojai']
			},
			{
				heading: 'Downtown Ojai',
				body: 'Walkable access to local shops, restaurants, galleries, Libbey Park, and the cultural heart of Ojai.',
				items: ['Read the Downtown Ojai guide → /downtown-ojai']
			}
		]
	},
	ojaiterrace: {
		title: 'Living in Ojai Terrace',
		kicker: 'Ojai neighborhood guide',
		description:
			'A firsthand guide to Ojai Terrace homes, walkability, schools, neighborhood traditions, mountain views, and ADU considerations.',
		hero: '/images/migrated/3-web-or-mls-UpmarketMedia-213Carillo-105a-baded83bf.webp',
		sections: [
			{
				heading: 'What makes Ojai Terrace distinctive?',
				body: 'Ojai Terrace pairs a strong neighborhood feel with everyday convenience. Residents can bike downtown, walk to Ojai Meadows, use the Ojai Valley Trail, and enjoy local traditions around Halloween, the holidays, and the Fourth of July.'
			},
			{
				heading: 'What are the homes like?',
				body: 'The original neighborhood was established during the postwar building boom. Many homes are single-story ranches from the late 1950s and early 1960s, commonly around three bedrooms and 1,200 to 1,500 square feet, though every property is different.'
			},
			{
				heading: 'Can you walk or bike downtown?',
				body: 'Yes. Downtown Ojai is very bikeable from Ojai Terrace, while the trail connects the neighborhood to outdoor recreation and destinations throughout the valley.'
			},
			{
				heading: 'What should buyers investigate?',
				body: 'ADU feasibility, zoning, setbacks, utilities, and property-specific improvements should be verified during due diligence rather than assumed from neighborhood patterns.'
			}
		]
	},
	taormina: {
		title: 'Living in Taormina',
		kicker: 'Ojai neighborhood guide',
		description:
			'Explore Taormina, a small Ojai historic district known for cottage-style homes, mature trees, mountain views, and a private circular road.',
		hero: '/images/migrated/unsplash-image-3bgpVpEZV6s-0bde55520.webp',
		sections: [
			{
				heading: 'Where is Taormina?',
				body: 'Taormina sits on a small hill on the western side of the City of Ojai, adjacent to Ojai Terrace and near Krotona. Taormina Lane loops around the hillside rather than following a traditional street grid.'
			},
			{
				heading: 'What are the homes like?',
				body: 'Small, character-filled cottages, mature trees, and mountain views define the neighborhood. Homes and lots tend to be smaller, parking can be limited, and the streets do not have sidewalks.'
			},
			{
				heading: 'Is Taormina a historic district?',
				body: 'Yes. The City of Ojai designated Taormina as a historic district in 2016. Buyers planning exterior changes should investigate applicable preservation standards during due diligence.'
			}
		]
	},
	'meiners-oaks-ojai': {
		title: 'Living in Meiners Oaks',
		kicker: 'Ojai Valley neighborhood guide',
		description:
			'A local guide to the homes, character, restaurants, and practical considerations of living in Meiners Oaks.',
		hero: '/images/migrated/unsplash-image-jStRu3JxfE0-ef9d651ab.webp',
		sections: [
			{
				heading: 'A distinct Ojai Valley community',
				body: 'Meiners Oaks is unincorporated Ventura County, even though it shares the 93023 ZIP code and is part of daily life in the broader Ojai Valley.'
			},
			{
				heading: 'What are the homes like?',
				body: 'Housing ranges from older bungalows and cottages to extensively remodeled homes and newer construction. Streets, lots, utilities, and property conditions vary more than in a planned subdivision.'
			},
			{
				heading: 'What should buyers verify?',
				body: 'Jurisdiction, sewer or septic, insurance, permits, short-term rental rules, and property boundaries are property-specific and should be investigated carefully.'
			}
		]
	},
	'downtown-ojai': {
		title: 'Living in Downtown Ojai',
		kicker: 'Ojai neighborhood guide',
		description:
			'A local real estate guide to Downtown Ojai homes, walkability, amenities, and practical buying considerations.',
		sections: [
			{
				heading: 'A walkable Ojai lifestyle',
				body: 'Downtown places Libbey Park, local shops, restaurants, galleries, and community events within easy reach. The exact experience varies block by block.'
			},
			{
				heading: 'Homes and due diligence',
				body: 'Downtown housing includes historic cottages, condominiums, mid-century homes, and remodeled properties. Buyers should verify zoning, parking, historic status, and the scope of past improvements.'
			}
		]
	},
	magazine: {
		title: 'Digital magazine',
		description: 'Browse Ainsley Hughes’s archive of seasonal Ojai and real estate magazines.',
		sections: [
			{
				heading: 'Magazine archive',
				body: 'Seasonal editions featuring local real estate, design, and life in the Ojai Valley.',
				items: [
					'Summer 2022',
					'Spring 2022',
					'Winter 2022',
					'Fall 2021',
					'Summer 2021',
					'Spring 2021',
					'Winter 2021'
				]
			}
		]
	},
	'market-stats': {
		title: 'Ojai market stats',
		description:
			'Request current Ojai and Ventura County housing-market data with context for your specific property or home search.',
		sections: [
			{
				heading: 'Numbers need local context',
				body: 'Median prices and days on market can be useful, but they do not describe every neighborhood or property type. Ask for a current, property-specific market conversation before making a pricing decision.'
			}
		],
		cta: {
			title: 'Get a current market report',
			text: 'Tell Ainsley which area or property type matters to you.',
			href: '/contact?topic=market-report',
			label: 'Request market stats'
		}
	}
};
