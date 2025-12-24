<script lang="ts">
	import { enhance } from '$app/forms';
	import { route } from '$lib/ROUTES';

	let messageError = $state('');
	let form: HTMLFormElement;
</script>

<h1>Login</h1>
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
				messageError = typeof error === 'string' ? error : 'An error occurred';
			} else if (result.type === 'redirect') {
				messageError = '';
			}
			await update();
		};
	}}
>
	<input type="email" name="email" placeholder="Email" required />
	<input type="password" name="password" placeholder="Password" required />
	<div>
		<button type="submit">Sign In</button>
	</div>
</form>

