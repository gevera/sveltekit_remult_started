<script lang="ts">
	import { route } from '$lib/ROUTES';
	let { data } = $props();
	let { user } = $derived(data);
</script>

<section>
	<h1>Welcome to SvelteKit powered by Remult and Better-Auth</h1>
	<p>Visit <a href="/api/docs">api/docs</a> to read the documentation</p>
	<div>
		{#if user}
			<a href={route('/admin')}>Admin</a>
		{:else}
			<p>
				<a href={route('/auth/login')}>Login</a> or <a href={route('/auth/register')}>Register</a>
			</p>
		{/if}
	</div>
</section>
