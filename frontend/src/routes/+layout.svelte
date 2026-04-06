<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	export const prerender = false;
    export const ssr = false;
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
