import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { blogSchema, marketSchema, neighborhoodSchema, reviewSchema } from '$lib/server/editorial';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) =>
	json({
		openapi: '3.1.0',
		info: {
			title: 'Ainsley Hughes Editorial Publishing',
			version: '1.0.0',
			description:
				'Draft, preview, and explicitly publish market updates, existing neighborhood guides, blog posts, and approved client reviews. Configure the API key as bearer authentication in the GPT Action, never in its instructions.'
		},
		servers: [{ url: url.origin }],
		security: [{ EditorKey: [] }],
		paths: {
			'/api/editorial': {
				get: {
					operationId: 'listEditorialResources',
					summary: 'List editable content and published revision IDs',
					responses: { '200': { description: 'Editable resources' } }
				}
			},
			'/api/editorial/media': {
				post: {
					operationId: 'uploadEditorialImage',
					summary: 'Upload an authorized image to persistent site storage',
					requestBody: {
						required: true,
						content: {
							'application/json': {
								schema: {
									type: 'object',
									required: ['mimeType', 'base64'],
									properties: {
										mimeType: {
											type: 'string',
											enum: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
										},
										base64: { type: 'string', contentEncoding: 'base64' }
									}
								}
							}
						}
					},
					responses: { '201': { description: 'Self-hosted image URL' } }
				}
			},
			'/api/editorial/{kind}/{slug}': {
				parameters: [
					{
						name: 'kind',
						in: 'path',
						required: true,
						schema: { type: 'string', enum: ['market', 'neighborhood', 'blog', 'review'] }
					},
					{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }
				],
				get: {
					operationId: 'readEditorialResource',
					summary: 'Read baseline, published content, and revision history',
					responses: { '200': { description: 'Resource' } }
				},
				post: {
					operationId: 'saveEditorialDraft',
					summary: 'Save an unpublished editorial draft',
					requestBody: {
						required: true,
						content: {
							'application/json': {
								schema: {
									type: 'object',
									required: ['content', 'expectedPublishedRevision'],
									properties: {
										expectedPublishedRevision: {
											type: ['integer', 'null'],
											description: 'Revision from readEditorialResource, or null if none'
										},
										content: {
											oneOf: [
												z.toJSONSchema(marketSchema),
												z.toJSONSchema(neighborhoodSchema),
												z.toJSONSchema(blogSchema),
												z.toJSONSchema(reviewSchema)
											]
										}
									}
								}
							}
						}
					},
					responses: { '201': { description: 'Unpublished draft revision' } }
				}
			},
			'/api/editorial/{kind}/{slug}/preview': {
				get: {
					operationId: 'previewEditorialRevision',
					summary: 'Inspect a saved revision and its rendered article or guide HTML',
					parameters: [
						{
							name: 'kind',
							in: 'path',
							required: true,
							schema: { type: 'string', enum: ['market', 'neighborhood', 'blog', 'review'] }
						},
						{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
						{
							name: 'revisionId',
							in: 'query',
							required: true,
							schema: { type: 'integer' }
						}
					],
					responses: { '200': { description: 'Preview of saved content' } }
				}
			},
			'/api/editorial/{kind}/{slug}/publish': {
				post: {
					operationId: 'publishEditorialRevision',
					summary: 'Publish a reviewed revision or restore an earlier revision',
					'x-openai-isConsequential': true,
					parameters: [
						{
							name: 'kind',
							in: 'path',
							required: true,
							schema: { type: 'string', enum: ['market', 'neighborhood', 'blog', 'review'] }
						},
						{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }
					],
					requestBody: {
						required: true,
						content: {
							'application/json': {
								schema: {
									type: 'object',
									required: ['revisionId', 'expectedPublishedRevision', 'confirm'],
									properties: {
										revisionId: { type: 'integer' },
										expectedPublishedRevision: { type: ['integer', 'null'] },
										confirm: { type: 'boolean', enum: [true] }
									}
								}
							}
						}
					},
					responses: { '200': { description: 'Revision published' } }
				}
			},
			'/api/editorial/{kind}/{slug}/unpublish': {
				post: {
					operationId: 'unpublishEditorialResource',
					summary: 'Unpublish an override, restoring original content when present',
					'x-openai-isConsequential': true,
					parameters: [
						{
							name: 'kind',
							in: 'path',
							required: true,
							schema: { type: 'string', enum: ['market', 'neighborhood', 'blog', 'review'] }
						},
						{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }
					],
					requestBody: {
						required: true,
						content: {
							'application/json': {
								schema: {
									type: 'object',
									required: ['expectedPublishedRevision', 'confirm'],
									properties: {
										expectedPublishedRevision: { type: 'integer' },
										confirm: { type: 'boolean', enum: [true] }
									}
								}
							}
						}
					},
					responses: { '200': { description: 'Original content restored' } }
				}
			}
		},
		components: {
			securitySchemes: {
				EditorKey: { type: 'http', scheme: 'bearer', description: 'Server-only EDITOR_API_KEY' }
			}
		}
	});
