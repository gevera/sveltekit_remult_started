import { Fields, Validators } from 'remult';

// Login schema - not an entity, just a validation schema
export class LoginSchema {
	@Fields.string({
		required: true,
		validate: Validators.email('Invalid email address.')
	})
	email = '';

	@Fields.string({
		required: true
	})
	password = '';
}

// Registration schema - not an entity, just a validation schema
export class RegistrationSchema {
	@Fields.string({
		required: true
	})
	name = '';

	@Fields.string({
		required: true,
		validate: Validators.email('Invalid email address.')
	})
	email = '';

	@Fields.string({
		required: true,
		minLength: 8
	})
	password = '';

	@Fields.string({
		required: true,
		minLength: 8
	})
	confirm_password = '';
}

export type RegistrationForm = RegistrationSchema;
export type LoginForm = LoginSchema;
