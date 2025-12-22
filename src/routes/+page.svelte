<script lang="ts">
	import type { PageData } from './$types';
	import Users from 'lucide-svelte/icons/users';
	import ListX from 'lucide-svelte/icons/list-x';
	import Lock from 'lucide-svelte/icons/lock';
	import Twitter from 'lucide-svelte/icons/twitter';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>HateCRM | Track Your Grievances</title>
	<meta name="description" content="A CRM for keeping track of people you don't like and why. Organize your grievances." />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</svelte:head>

<main class="hero">
	<div class="container">
		<nav class="nav animate-in">
			<div class="logo">
				<span>HateCRM</span>
			</div>
			<div class="nav-links">
				{#if data.user}
					<a href="/dashboard" class="btn btn-ghost">Dashboard</a>
					<form action="/auth/logout" method="POST">
						<button type="submit" class="btn btn-secondary">Sign Out</button>
					</form>
				{:else}
					<a href="/auth/login" class="btn btn-ghost">Sign In</a>
					<a href="/list" class="btn btn-primary">Get Started</a>
				{/if}
			</div>
		</nav>

		<section class="hero-content">
			<div class="badge animate-in">For the petty professional</div>
			<h1 class="animate-in delay-1">
				Remember why you<br />
				<span class="text-accent">don't like them</span>
			</h1>
			<p class="hero-subtitle animate-in delay-2">
				Finally, a CRM that gets you. Track people who've wronged you, 
				document their offenses, and never forget a grievance again.
			</p>
			<div class="hero-cta animate-in delay-3">
				{#if data.user}
					<a href="/dashboard" class="btn btn-primary">View Your List</a>
				{:else}
					<a href="/list" class="btn btn-primary">Start Your List</a>
					<a href="/auth/login" class="btn btn-secondary">Sign In</a>
				{/if}
			</div>
			<p class="no-signup-note animate-in delay-3">No account required. Your list stays in your browser.</p>
		</section>

		<section id="features" class="features">
			<div class="feature-grid">
				<div class="card card-hover animate-in">
					<div class="feature-icon">
						<Users size={24} />
					</div>
					<h3>Track Your Enemies</h3>
					<p>Add people to your list with names and optional nicknames like "The Reply-All Guy" or "Loud Chewer Dave".</p>
				</div>

				<div class="card card-hover animate-in delay-1">
					<div class="feature-icon">
						<ListX size={24} />
					</div>
					<h3>Document Grievances</h3>
					<p>Log every offense. Every slight. Every time they microwave fish in the office. Your memory is now bulletproof.</p>
				</div>

				<div class="card card-hover animate-in delay-2">
					<div class="feature-icon">
						<Lock size={24} />
					</div>
					<h3>Private & Secure</h3>
					<p>Your list is yours alone. Encrypted and protected. They'll never know they're on it.</p>
				</div>
			</div>
		</section>

		<section class="testimonial-section animate-in delay-3">
			<div class="testimonial">
				<blockquote>
					"I used to forget why I was annoyed at people. Now I have receipts."
				</blockquote>
				<p class="attribution">— A very organized grudge-holder</p>
			</div>
		</section>

		<footer class="footer">
			<div class="footer-links">
				<a href="/about">About</a>
				<a href="https://twitter.com/YOUR_HANDLE" target="_blank" rel="noopener">
					<Twitter size={16} />
					Twitter
				</a>
				<a href="https://slopcel.com" target="_blank" rel="noopener">Slopcel</a>
			</div>
			<p class="text-muted">Keep your enemies closer. In a database.</p>
		</footer>
	</div>
</main>

<style>
	.hero {
		min-height: 100vh;
		background: var(--bg-primary);
	}

	.nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 2rem 0;
	}

	.logo {
		font-size: 1.125rem;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.hero-content {
		text-align: center;
		padding: 6rem 0 4rem;
		max-width: 800px;
		margin: 0 auto;
	}

	.badge {
		display: inline-block;
		padding: 0.375rem 0.875rem;
		background: var(--accent-soft);
		border: 1px solid var(--accent);
		border-radius: 100px;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--accent);
		margin-bottom: 2rem;
	}

	.hero-content h1 {
		margin-bottom: 1.5rem;
	}

	.hero-subtitle {
		font-size: 1.25rem;
		color: var(--text-secondary);
		max-width: 600px;
		margin: 0 auto 2.5rem;
		line-height: 1.6;
	}

	.hero-cta {
		display: flex;
		justify-content: center;
		gap: 1rem;
	}

	.no-signup-note {
		margin-top: 1rem;
		font-size: 0.8125rem;
		color: var(--text-muted);
	}

	.features {
		padding: 6rem 0;
	}

	.feature-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 2rem;
	}

	.feature-icon {
		margin-bottom: 1.25rem;
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--accent-soft);
		border-radius: 10px;
		color: var(--accent);
	}

	.features h3 {
		margin-bottom: 0.75rem;
		font-size: 1.25rem;
	}

	.features p {
		color: var(--text-secondary);
		font-size: 0.9375rem;
		line-height: 1.6;
	}

	.testimonial-section {
		padding: 4rem 0 6rem;
	}

	.testimonial {
		max-width: 600px;
		margin: 0 auto;
		text-align: center;
		padding: 2.5rem;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 12px;
		box-shadow: var(--shadow-sm);
	}

	.testimonial blockquote {
		font-size: 1.25rem;
		font-style: italic;
		color: var(--text-primary);
		line-height: 1.6;
		margin-bottom: 1rem;
	}

	.attribution {
		color: var(--text-muted);
		font-size: 0.875rem;
	}

	.footer {
		text-align: center;
		padding: 4rem 0 3rem;
		border-top: 1px solid var(--border-subtle);
	}

	.footer-links {
		display: flex;
		justify-content: center;
		gap: 1.5rem;
		margin-bottom: 1rem;
	}

	.footer-links a {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		color: var(--text-secondary);
		font-size: 0.875rem;
		font-weight: 500;
	}

	.footer-links a:hover {
		color: var(--accent);
	}

	@media (max-width: 768px) {
		.nav {
			padding: 1rem 0;
			flex-wrap: wrap;
			gap: 0.75rem;
		}

		.nav-links {
			gap: 0.5rem;
		}

		.nav-links .btn {
			padding: 0.5rem 0.875rem;
			font-size: 0.8125rem;
		}

		.hero-content {
			padding: 3rem 0 2rem;
		}

		.hero-content h1 {
			font-size: 2rem;
		}

		.badge {
			font-size: 0.6875rem;
			padding: 0.25rem 0.625rem;
			margin-bottom: 1.5rem;
		}

		.hero-subtitle {
			font-size: 1rem;
			margin-bottom: 2rem;
		}

		.hero-cta {
			flex-direction: column;
			gap: 0.75rem;
		}

		.hero-cta .btn {
			width: 100%;
		}

		.no-signup-note {
			font-size: 0.75rem;
		}

		.features {
			padding: 3rem 0;
		}

		.feature-grid {
			gap: 1.25rem;
		}

		.features h3 {
			font-size: 1.125rem;
		}

		.features p {
			font-size: 0.875rem;
		}

		.testimonial-section {
			padding: 2rem 0 3rem;
		}

		.testimonial {
			padding: 1.5rem;
		}

		.testimonial blockquote {
			font-size: 1rem;
		}

		.footer {
			padding: 2rem 0 1.5rem;
		}

		.footer-links {
			gap: 1rem;
			flex-wrap: wrap;
		}

		.footer-links a {
			font-size: 0.8125rem;
		}
	}

	@media (max-width: 480px) {
		.hero-content h1 {
			font-size: 1.75rem;
		}

		.feature-icon {
			width: 40px;
			height: 40px;
		}
	}
</style>
