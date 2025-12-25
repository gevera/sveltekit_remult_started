import { dev } from '$app/environment';
import { getFields } from 'remult';

type ClassType<T = unknown> = new () => T;

export const extractFormData = async <T extends object>(
	request: Request,
	schemaClass: ClassType<T>
): Promise<{
	data: T | undefined;
	error: string | null;
}> => {
	try {
		const formData = await request.formData();
		const result: Record<string, string | string[]> = {};

		// Convert form data to an object with proper handling of multiple values
		formData.forEach((value, key) => {
			// Convert FormDataEntryValue (string | File) to string
			const stringValue = typeof value === 'string' ? value : value.name;

			const existingValue = result[key];

			// Case 1: First time encountering this key
			if (existingValue === undefined) {
				result[key] = stringValue;
			}
			// Case 2: Key exists and is already an array, add new value
			else if (Array.isArray(existingValue)) {
				existingValue.push(stringValue);
			}
			// Case 3: Key exists but isn't an array yet, convert to array with both values
			else {
				result[key] = [existingValue, stringValue];
			}
		});

		// Create an instance of the schema class
		const instance = new schemaClass();

		// Get Remult field references for the class
		const fieldsRef = getFields(instance);

		// Populate the instance with form data
		Object.assign(instance, result);

		// Validate using Remult's validation
		const errors: string[] = [];

		// Iterate over field references
		for (const fieldRef of fieldsRef) {
			const fieldMeta = fieldRef.metadata;
			const key = fieldMeta.key as keyof T;
			const value = instance[key];

			try {
				// Check required fields
				if (fieldMeta.options.required && !value) {
					errors.push(`${fieldMeta.caption || fieldMeta.key} is required.`);
					continue;
				}

				// Check minLength
				if (fieldMeta.inputType === 'text' && typeof value === 'string') {
					const minLength = (fieldMeta.options as { minLength?: number }).minLength;
					if (minLength && value.length < minLength) {
						errors.push(
							`${fieldMeta.caption || fieldMeta.key} must be at least ${minLength} characters.`
						);
					}
				}

				// Run field validators by calling validate on the fieldRef
				try {
					await fieldRef.validate();
					if (fieldRef.error) {
						errors.push(fieldRef.error);
					}
				} catch (err) {
					const error = err as Error;
					errors.push(error.message || `Validation failed for ${fieldMeta.key}`);
				}
			} catch (err) {
				const error = err as Error;
				errors.push(error.message || `Error validating ${fieldMeta.key}`);
			}
		}

		// Handle password confirmation for registration
		if ('password' in instance && 'confirm_password' in instance) {
			const pwd = instance['password' as keyof T];
			const confirmPwd = instance['confirm_password' as keyof T];
			if (pwd !== confirmPwd) {
				errors.push("Passwords don't match");
			}
		}

		if (errors.length > 0) {
			if (dev) {
				console.error('Validation errors:');
				for (const error of errors) {
					console.error(`- ${error}`);
				}
			}
			return {
				data: undefined,
				error: errors.join(', ')
			};
		}

		return { data: instance as T, error: null };
	} catch (error) {
		if (dev) {
			console.error(`Error extracting form data: ${error}`);
		}
		return { data: undefined, error: `Error extracting form data: ${error}` };
	}
};

export default extractFormData;
