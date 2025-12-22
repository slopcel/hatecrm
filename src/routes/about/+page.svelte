<script lang="ts">
	import Twitter from 'lucide-svelte/icons/twitter';
	import Globe from 'lucide-svelte/icons/globe';
</script>

<svelte:head>
	<title>About | HateCRM</title>
	<meta name="description" content="Learn about HateCRM and its creator Madiou. The story behind the grievance tracker that helps you keep receipts." />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<link rel="canonical" href="https://hatecrm.com/about" />
	
	<!-- Open Graph -->
	<meta property="og:site_name" content="HateCRM" />
	<meta property="og:title" content="About | HateCRM" />
	<meta property="og:description" content="Learn about HateCRM and its creator Madiou. The story behind the grievance tracker." />
	<meta property="og:image" content="https://hatecrm.com/main-og-image.png" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://hatecrm.com/about" />
	
	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@_madiou" />
	<meta name="twitter:creator" content="@_madiou" />
	<meta name="twitter:title" content="About | HateCRM" />
	<meta name="twitter:description" content="Learn about HateCRM and its creator Madiou. The story behind the grievance tracker." />
	<meta name="twitter:image" content="https://hatecrm.com/main-og-image.png" />
</svelte:head>

<main class="about-page">
	<div class="container">
		<a href="/" class="back-link">← Back to HateCRM</a>
		
		<section class="about-hero">
			<h1>About HateCRM</h1>
			<p class="subtitle">The story behind tracking your grievances</p>
		</section>

		<section class="about-content">
			<div class="creator-section">
				<h2>Meet the Creator</h2>
				<div class="creator-card">
					<div class="creator-avatar">
						<!-- TODO: Add your profile image -->
						<div class="avatar-placeholder">
							<img src="https://slopcel.com/_next/image?url=%2Fmadiou_logo.jpg&w=256&q=75" height="100" width="100" alt="Madiou">
						</div>
					</div>
					<div class="creator-info">
						<h3>Hey, it's Madiou 👋</h3>
						<p class="creator-title">CEO @ Slopcel</p>

						<p class="creator-bio">
							<!-- TODO: Add your bio here -->
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
							<a href="https://twitter.com/_madiou" target="_blank" rel="noopener" class="social-link">
								<Twitter size={18} />
								@_madiou
							</a>
							<a href="https://slopcel.com" target="_blank" rel="noopener" class="social-link">
								<Globe size={18} />
								Slopcel
							</a>
						</div>
					</div>
				</div>
			</div>

		
		</section>

		<footer class="about-footer">
			<div class="footer-links">
				<a href="https://twitter.com/YOUR_HANDLE" target="_blank" rel="noopener">
					<Twitter size={16} />
					Twitter
				</a>
				<a href="https://slopcel.com" target="_blank" rel="noopener">Slopcel</a>
			</div>
			<p>Made with spite and a sense of humor</p>
		</footer>
	</div>
</main>

<style>
	.about-page {
		min-height: 100vh;
		padding: 2rem 0 4rem;
		background: var(--bg-primary);
	}

	.back-link {
		display: inline-block;
		color: var(--text-secondary);
		font-size: 0.875rem;
		margin-bottom: 2rem;
	}

	.back-link:hover {
		color: var(--accent);
	}

	.about-hero {
		text-align: center;
		margin-bottom: 3rem;
	}

	.about-hero h1 {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
	}

	.subtitle {
		color: var(--text-secondary);
		font-size: 1.125rem;
	}

	.about-content {
		max-width: 700px;
		margin: 0 auto;
	}

	.about-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 2rem;
		margin-bottom: 2rem;
	}

	.about-card h2 {
		font-size: 1.25rem;
		margin-bottom: 1rem;
		color: var(--text-primary);
	}

	.about-card p {
		color: var(--text-secondary);
		line-height: 1.7;
		margin-bottom: 1rem;
	}

	.about-card p:last-child {
		margin-bottom: 0;
	}

	.tech-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.tech-list li {
		padding: 0.5rem 0;
		color: var(--text-secondary);
		border-bottom: 1px solid var(--border-subtle);
	}

	.tech-list li:last-child {
		border-bottom: none;
	}

	/* Creator Section */
	.creator-section {
		margin-bottom: 2rem;
	}

	.creator-section h2 {
		font-size: 1.25rem;
		margin-bottom: 1rem;
	}

	.creator-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 2rem;
		display: flex;
		gap: 2rem;
		align-items: flex-start;
	}

	.creator-avatar {
		flex-shrink: 0;
	}

	.avatar-placeholder {
		width: 100px;
		height: 100px;
		border-radius: 50%;
		background: var(--accent);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2.5rem;
		font-weight: 700;
	}

	.creator-info {
		flex: 1;
	}

	.creator-info h3 {
		font-size: 1.5rem;
		margin-bottom: 0.25rem;
	}

	.creator-title {
		color: var(--accent);
		font-weight: 600;
		margin-bottom: 1rem;
	}

	.creator-bio {
		color: var(--text-secondary);
		line-height: 1.7;
		margin-bottom: 1.5rem;
	}

	.creator-links {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.social-link {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 1rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 6px;
		color: var(--text-primary);
		font-size: 0.875rem;
		font-weight: 500;
	}

	.social-link:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	/* Footer */
	.about-footer {
		margin-top: 4rem;
		padding-top: 2rem;
		border-top: 1px solid var(--border);
		text-align: center;
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
	}

	.footer-links a:hover {
		color: var(--accent);
	}

	.about-footer p {
		color: var(--text-muted);
		font-size: 0.8125rem;
	}

	@media (max-width: 768px) {
		.about-page {
			padding: 1rem 0 2rem;
		}

		.back-link {
			font-size: 0.8125rem;
			margin-bottom: 1.5rem;
		}

		.about-hero {
			margin-bottom: 2rem;
		}

		.about-hero h1 {
			font-size: 1.75rem;
		}

		.subtitle {
			font-size: 1rem;
		}

		.about-card {
			padding: 1.25rem;
			margin-bottom: 1.25rem;
			border-radius: 8px;
		}

		.about-card h2 {
			font-size: 1.125rem;
		}

		.about-card p {
			font-size: 0.875rem;
		}

		.creator-section h2 {
			font-size: 1.125rem;
		}

		.creator-card {
			flex-direction: column;
			align-items: center;
			text-align: center;
			padding: 1.25rem;
			gap: 1.25rem;
		}

		.avatar-placeholder {
			width: 80px;
			height: 80px;
			font-size: 2rem;
		}

		.creator-info h3 {
			font-size: 1.25rem;
		}

		.creator-bio {
			font-size: 0.875rem;
		}

		.creator-links {
			justify-content: center;
			gap: 0.75rem;
		}

		.social-link {
			padding: 0.375rem 0.75rem;
			font-size: 0.8125rem;
		}

		.about-footer {
			margin-top: 2rem;
			padding-top: 1.5rem;
		}

		.footer-links {
			gap: 1rem;
		}

		.footer-links a {
			font-size: 0.8125rem;
		}
	}
</style>

