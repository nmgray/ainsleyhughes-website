import { json } from '@sveltejs/kit';
import { site } from '$lib/config';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () =>
	json({
		openapi: '3.1.0',
		info: {
			title: 'Ainsley Hughes Real Estate Tools',
			version: '1.0.0',
			description: 'Neighborhood context and consultation lead delivery for authorized assistants.'
		},
		servers: [{ url: site.origin }],
		paths: {
			'/api/llm-tools': {
				get: {
					operationId: 'getNeighborhoodContext',
					summary: 'Get general context for a supported Ojai-area neighborhood',
					parameters: [
						{
							name: 'area',
							in: 'query',
							required: true,
							schema: {
								type: 'string',
								enum: ['ojai', 'meiners-oaks', 'ojai-terrace', 'taormina', 'downtown-ojai']
							}
						}
					],
					responses: { '200': { description: 'Neighborhood context' } }
				},
				post: {
					operationId: 'requestConsultation',
					summary: 'Submit a consultation request',
					security: [{ ApiKeyAuth: [] }],
					requestBody: {
						required: true,
						content: {
							'application/json': {
								schema: {
									type: 'object',
									required: ['name', 'email'],
									properties: {
										name: { type: 'string' },
										email: { type: 'string', format: 'email' },
										phone: { type: 'string' },
										address: { type: 'string' },
										message: { type: 'string' },
										utmSource: { type: 'string' }
									}
								}
							}
						}
					},
					responses: { '202': { description: 'Consultation request accepted' } }
				}
			}
		},
		components: {
			securitySchemes: {
				ApiKeyAuth: { type: 'apiKey', in: 'header', name: 'x-api-key' }
			}
		}
	});
