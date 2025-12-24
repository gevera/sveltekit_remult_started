import * as v from 'valibot';

export const loginSchema = v.object({
    email: v.pipe(
        v.string("You must enter an email address."),
        v.nonEmpty("Email address is required."),
        v.email("Invalid email address.")
    ),
    password: v.pipe(
        v.string("You must enter a password."),
        v.nonEmpty("Password is required.")
    )
});

export const registrationSchema = v.pipe(
    v.object({
        name: v.pipe(
            v.string("You must enter a name."),
            v.nonEmpty("Name is required.")
        ),
        email: v.pipe(
            v.string("You must enter an email address."),
            v.nonEmpty("Invalid email address."),
            v.email("Email address is required.")
        ),
        password: v.pipe(
            v.string("You must enter a password."),
            v.nonEmpty("Password is required."),
            v.minLength(8, "Password must be at least 8 characters.")
        ),
        confirm_password: v.pipe(
            v.string("You must confirm your password."),
            v.nonEmpty("Confirm password is required."),
            v.minLength(8, "Confirm password must be at least 8 characters.")
        )
    }),
    v.check((i) => i.confirm_password === i.password, "Passwords dont match")
);

export type RegistrationForm = v.InferInput<typeof registrationSchema>;
export type LoginForm = v.InferInput<typeof loginSchema>;