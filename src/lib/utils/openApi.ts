import type { ClassType } from 'remult';
import { getFields } from 'remult';
import type { RemultSveltekitServer } from 'remult/remult-sveltekit';

// Remult internal symbols for accessing BackendMethod metadata
const classBackendMethodsArray = Symbol.for('classBackendMethodsArray');
const serverActionField = Symbol.for('serverActionField');
const returnTypeSymbol = Symbol.for('returnType');
const controllerReturnTypesMap = Symbol.for('controllerReturnTypesMap');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string | symbol, any>;

/**
 * Convert a Remult class schema to OpenAPI schema
 */
function classToOpenApiSchema(schemaClass: ClassType<unknown>) {
	try {
		const instance = new schemaClass();
		const fieldsRef = getFields(instance);
		const properties: Record<string, { type: string; format?: string }> = {};
		const required: string[] = [];

		for (const fieldRef of fieldsRef) {
			const fieldMeta = fieldRef.metadata;
			const fieldKey = fieldMeta.key as string;
			let type = 'string';
			let format: string | undefined;

			// Map Remult field types to OpenAPI types
			if (fieldMeta.valueType === Number) {
				type = 'number';
			} else if (fieldMeta.valueType === Boolean) {
				type = 'boolean';
			} else if (fieldMeta.valueType === Date) {
				type = 'string';
				format = 'date-time';
			}

			properties[fieldKey] = { type, ...(format && { format }) };

			// Check if field is required
			if (fieldMeta.options.required) {
				required.push(fieldKey);
			}
		}

		return {
			type: 'object',
			properties,
			...(required.length > 0 && { required })
		};
	} catch {
		// If schema introspection fails, return generic object
		return { type: 'object' };
	}
}

/**
 * Automatically infer OpenAPI response schema from backend method return type
 */
function inferResponseSchema(
	method: unknown,
	controller: ClassType<unknown>,
	methodName: string
): { type: string; items?: unknown; properties?: unknown; required?: string[] } {
	// First, try to get metadata from the controller's return types map
	// This is the most reliable way since we store it there explicitly
	const returnTypesMap = (controller as AnyObj)[controllerReturnTypesMap] as
		| Map<string, unknown>
		| undefined;
	let methodMetadata = returnTypesMap?.get(methodName) as
		| { type?: string; schema?: ClassType<unknown>; isArray?: boolean }
		| undefined;

	// If not found in map, try to get metadata from the method object (might be a wrapper)
	if (!methodMetadata) {
		methodMetadata = (method as AnyObj)[returnTypeSymbol];
	}

	// If still not found, try to get it from the controller's static method
	if (!methodMetadata) {
		const controllerMethod = (controller as AnyObj)[methodName];
		if (controllerMethod) {
			methodMetadata = (controllerMethod as AnyObj)[returnTypeSymbol];
		}
	}

	// Also check if the method has a 'fn' property (common in wrappers)
	if (!methodMetadata && (method as AnyObj).fn) {
		methodMetadata = ((method as AnyObj).fn as AnyObj)[returnTypeSymbol];
	}

	if (methodMetadata) {
		if (methodMetadata.isArray && methodMetadata.schema) {
			return {
				type: 'array',
				items: classToOpenApiSchema(methodMetadata.schema)
			};
		}
		if (methodMetadata.schema) {
			return classToOpenApiSchema(methodMetadata.schema);
		}
		if (methodMetadata.type === 'string') {
			return { type: 'string' };
		}
		if (methodMetadata.type === 'number') {
			return { type: 'number' };
		}
		if (methodMetadata.type === 'boolean') {
			return { type: 'boolean' };
		}
	}

	// Default to generic object for unknown types
	return { type: 'object' };
}

/**
 * Decorator to declare the return type of a backend method for OpenAPI generation
 * Use this decorator on backend methods to automatically generate correct OpenAPI schemas
 *
 * @example
 * class MyController {
 *   @BackendMethod({ allowed: true })
 *   @Returns({ type: 'string' })
 *   static async getString() { return 'hello'; }
 *
 *   @BackendMethod({ allowed: true })
 *   @Returns({ schema: MySchema })
 *   static async getData() { return new MySchema(); }
 *
 *   @BackendMethod({ allowed: true })
 *   @Returns({ schema: MySchema, isArray: true })
 *   static async getList() { return [new MySchema()]; }
 * }
 */
export function Returns(
	returnType:
		| { type: 'string' | 'number' | 'boolean' | 'object' }
		| { schema: ClassType<unknown>; isArray?: boolean }
) {
	return function (target: unknown, propertyKey: string, descriptor?: PropertyDescriptor) {
		// Store metadata on the target's method property
		// For static methods, target is the class constructor
		const method = (target as AnyObj)[propertyKey];
		if (method) {
			(method as AnyObj)[returnTypeSymbol] = returnType;
		}

		// Also store on descriptor value if available
		if (descriptor && descriptor.value) {
			(descriptor.value as AnyObj)[returnTypeSymbol] = returnType;
		}

		// Store in a map on the controller class for reliable lookup
		// This ensures we can find it even if the method is wrapped
		if (!(target as AnyObj)[controllerReturnTypesMap]) {
			(target as AnyObj)[controllerReturnTypesMap] = new Map<string, unknown>();
		}
		((target as AnyObj)[controllerReturnTypesMap] as Map<string, unknown>).set(
			propertyKey,
			returnType
		);

		return descriptor;
	};
}

// Generate OpenAPI doc with controller methods included
export function getOpenApiDoc(api: RemultSveltekitServer, controllers: ClassType<unknown>[]) {
	const spec = api.openApiDoc({ title: 'remult-planets', version: '1.0.0' });

	// Add controller BackendMethods to the spec
	for (const controller of controllers) {
		const methods = (controller as AnyObj)[classBackendMethodsArray];
		if (methods) {
			for (const method of methods) {
				const action = (method as AnyObj)[serverActionField];
				if (action?.actionUrl) {
					const path = `/api/${action.actionUrl}`;
					const methodName = action.actionUrl.split('/').pop();

					// Infer the response schema from the method
					// Try multiple approaches to find the metadata
					const responseSchema = inferResponseSchema(method, controller, methodName);

					spec.paths[path] = {
						post: {
							tags: [controller.name],
							summary: methodName,
							description: `Backend method: ${action.actionUrl}`,
							requestBody: {
								content: {
									'application/json': {
										schema: { type: 'object' }
									}
								}
							},
							responses: {
								'200': {
									description: 'Successful response',
									content: {
										'application/json': {
											schema: responseSchema
										}
									}
								},
								'400': { description: 'Bad Request' },
								'401': { description: 'Unauthorized' },
								'403': { description: 'Forbidden' },
								'500': { description: 'Internal Server Error' }
							},
							security: [{ bearerAuth: [] }]
						}
					};
				}
			}
		}
	}

	return spec;
}
