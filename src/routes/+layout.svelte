<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import Navbar from '$lib/components/Navbar.svelte';

	let { children, data } = $props();
	let { user } = $derived(data);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Navbar {user} />
{@render children()}
