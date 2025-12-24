<script lang="ts">
	import type { PageData } from './$types';
	import Users from 'lucide-svelte/icons/users';
	import ListX from 'lucide-svelte/icons/list-x';
	import Lock from 'lucide-svelte/icons/lock';
	import Twitter from 'lucide-svelte/icons/twitter';
	import Globe from 'lucide-svelte/icons/globe';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>HateCRM | Track Your Grievances</title>
	<meta name="description" content="A CRM for keeping track of people you don't like and why. Track enemies, document offenses, and never forget a grievance again." />
	<meta name="keywords" content="CRM, grievances, track enemies, enemy list, grudge tracker, offense tracker" />
	<link rel="canonical" href="https://hatecrm.com" />
	
	<!-- Open Graph -->
	<meta property="og:site_name" content="HateCRM" />
	<meta property="og:title" content="HateCRM | Track Your Grievances" />
	<meta property="og:description" content="A CRM for keeping track of people you don't like and why. Track enemies, document offenses, and never forget a grievance again." />
	<meta property="og:image" content="https://hatecrm.com/main-og-image.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://hatecrm.com" />
	<meta property="og:locale" content="en_US" />
	
	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@_madiou" />
	<meta name="twitter:creator" content="@_madiou" />
	<meta name="twitter:title" content="HateCRM | Track Your Grievances" />
	<meta name="twitter:description" content="A CRM for keeping track of people you don't like and why. Track enemies, document offenses, and never forget a grievance again." />
	<meta name="twitter:image" content="https://hatecrm.com/main-og-image.png" />
	
	<!-- Structured Data -->
	{@html `<script type="application/ld+json">
	{
		"@context": "https://schema.org",
		"@type": "WebApplication",
		"name": "HateCRM",
		"description": "A CRM for keeping track of people you don't like and why. Track enemies, document offenses, and never forget a grievance again.",
		"url": "https://hatecrm.com",
		"applicationCategory": "Productivity",
		"operatingSystem": "Web",
		"offers": {
			"@type": "Offer",
			"price": "0",
			"priceCurrency": "USD"
		},
		"author": {
			"@type": "Person",
			"name": "Madiou",
			"url": "https://twitter.com/_madiou"
		}
	}
	</script>`}
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

		<section class="about-section">
			<h2 class="section-title">Meet the Creator</h2>
			<div class="creator-card">
				<div class="creator-avatar">
					<img src="https://slopcel.com/_next/image?url=%2Fmadiou_logo.jpg&w=256&q=75" alt="Madiou" />
				</div>
				<div class="creator-info">
					<h3>Hey, there friends 👋</h3>
					<p class="creator-title">CEO @ <a href="https://slopcel.com" target="_blank" rel="noopener">Slopcel</a></p>

					<p class="creator-bio">
							
						I made this website as a joke after seeing this tweet on my timeline.
					</p>
					<blockquote class="twitter-tweet"><p lang="en" dir="ltr">who&#39;s building a CRM to keep track of why i don&#39;t like people</p>&mdash; dax (@thdxr) <a href="https://twitter.com/thdxr/status/1976444518150135833?ref_src=twsrc%5Etfw">October 10, 2025</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
					<p class="creator-bio">
						It gave me the chance to try out svelte and do some more vibe coding, so I'm pretty happy with it.
						<br> <br>
						HateCRM is a playful take on customer relationship management. Instead of tracking customers,
						you track people you hate. Document their offenses, link their tweets, and never 
						forget a grievance again.
						<br> <br>
						You can sign up with your Google account and start tracking your grievances.
						Whether it's an ragebaiting account or just someone with really bad takes, HateCRM helps you keep receipts.

					</p>
					<div class="creator-links">
						<a href="https://twitter.com/_madiou" target="_blank" rel="noopener" class="creator-social-link">
							<Twitter size={18} />
							@_madiou
						</a>
						<a href="https://slopcel.com" target="_blank" rel="noopener" class="creator-social-link">
							<Globe size={18} />
							Slopcel
						</a>
					</div>
				</div>
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

	/* About Section */
	.section-title {
		text-align: center;
		font-size: 2.5rem;
		margin-bottom: 3rem;
	}
	
	.about-section {
		padding: 6rem 0;
	}

	.creator-card {
		max-width: 800px;
		margin: 0 auto;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 2.5rem;
		display: flex;
		gap: 2rem;
		align-items: flex-start;
	}

	.creator-avatar {
		flex-shrink: 0;
	}

	.creator-avatar img {
		width: 100px;
		height: 100px;
		border-radius: 12px;
		object-fit: cover;
	}

	.creator-info {
		flex: 1;
		text-align: left;
	}

	.creator-info h3 {
		font-size: 1.75rem;
		margin-bottom: 0.25rem;
	}

	.creator-title {
		color: var(--accent);
		font-weight: 600;
		margin-bottom: 1.5rem;
	}

	.creator-title a {
		color: var(--accent);
		text-decoration: none;
	}

	.creator-title a:hover {
		text-decoration: underline;
	}

	.creator-bio {
		color: var(--text-secondary);
		line-height: 1.7;
		margin-bottom: 1.5rem;
		font-size: 0.9375rem;
	}

	/* Twitter embed styling */
	.twitter-tweet {
		margin: 1.5rem 0 !important;
		max-width: 100% !important;
	}

	.creator-links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 1.5rem;
	}

	.creator-social-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 6px;
		color: var(--text-primary);
		font-size: 0.875rem;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.creator-social-link:hover {
		border-color: var(--accent);
		color: var(--accent);
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
