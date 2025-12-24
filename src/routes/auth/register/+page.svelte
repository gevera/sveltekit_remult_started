<script lang="ts">
	import { enhance } from '$app/forms';

	let messageError = $state('');
	let form: HTMLFormElement;
</script>

<h1>Register</h1>
{#if messageError}
	<div>
		<p>{messageError}</p>
	</div>
{/if}
<form
	bind:this={form}
	method="POST"
	use:enhance={() => {
		return async ({ result, update }) => {
			if (result.type === 'failure') {
				const error = result.data?.error;
				messageError = typeof error === 'string' ? error : 'An error occurred R2';
			}
			await update();
		};
	}}
>
	<input type="text" name="name" placeholder="Name" required />
	<input type="email" name="email" placeholder="Email" required />
	<input type="password" name="password" placeholder="Password" required />
	<input type="password" name="confirm_password" placeholder="Confirm Password" required />
	<div>
		<button type="submit">Sign Up</button>
	</div>
</form>

