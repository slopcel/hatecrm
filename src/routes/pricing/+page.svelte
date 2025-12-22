<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let loading = $state<string | null>(null);
	let checkoutError = $state<string | null>(null);

	// Example product IDs - replace with your actual DodoPay product IDs
	const PRODUCT_IDS = {
		starter: 'pdt_your_starter_product_id',
		pro: 'pdt_your_pro_product_id',
		enterprise: 'pdt_your_enterprise_product_id'
	};

	async function handleCheckout(productId: string) {
		if (!data.user) return;
		
		loading = productId;
		try {
			const response = await fetch('/api/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					product_cart: [{ product_id: productId, quantity: 1 }],
					customer: {
						email: data.user.email,
						external_id: data.user.id
					}
				})
			});

			const result = await response.json();
			
			if (result.checkout_url) {
				window.location.href = result.checkout_url;
			} else {
				console.error('Checkout error:', result);
				// TODO: Replace with toast notification (svelte-sonner)
				checkoutError = 'Failed to start checkout. Please try again.';
			}
		} catch (error) {
			console.error('Checkout error:', error);
			// TODO: Replace with toast notification (svelte-sonner)
			checkoutError = 'Failed to start checkout. Please try again.';
		} finally {
			loading = null;
		}
	}
</script>

<svelte:head>
	<title>Pricing | ShipFast</title>
</svelte:head>

<main class="pricing-page">
	<div class="container">
		<nav class="pricing-nav">
			<a href="/" class="back-link">← Back to home</a>
			{#if data.user}
				<a href="/dashboard" class="btn btn-ghost">Dashboard</a>
			{/if}
		</nav>

		<header class="pricing-header">
			<h1>Simple, transparent pricing</h1>
			<p class="text-secondary">Choose the plan that's right for your project</p>
			{#if checkoutError}
				<div class="error-banner" role="alert">
					<p>{checkoutError}</p>
					<button onclick={() => checkoutError = null} aria-label="Dismiss error">×</button>
				</div>
			{/if}
		</header>

		<div class="pricing-grid">
			<!-- Starter Plan -->
			<div class="pricing-card">
				<div class="plan-header">
					<h2>Starter</h2>
					<div class="price">
						<span class="amount">$0</span>
						<span class="period">/month</span>
					</div>
					<p class="plan-description">Perfect for side projects</p>
				</div>
				<ul class="features-list">
					<li><span class="check">✓</span> Up to 1,000 users</li>
					<li><span class="check">✓</span> Basic analytics</li>
					<li><span class="check">✓</span> Community support</li>
					<li><span class="check">✓</span> 1 project</li>
				</ul>
				<a href="/auth/signup" class="btn btn-secondary btn-full">Get Started</a>
			</div>

			<!-- Pro Plan -->
			<div class="pricing-card featured">
				<div class="featured-badge">Most Popular</div>
				<div class="plan-header">
					<h2>Pro</h2>
					<div class="price">
						<span class="amount">$29</span>
						<span class="period">/month</span>
					</div>
					<p class="plan-description">For growing businesses</p>
				</div>
				<ul class="features-list">
					<li><span class="check">✓</span> Unlimited users</li>
					<li><span class="check">✓</span> Advanced analytics</li>
					<li><span class="check">✓</span> Priority support</li>
					<li><span class="check">✓</span> 10 projects</li>
					<li><span class="check">✓</span> Custom domain</li>
					<li><span class="check">✓</span> API access</li>
				</ul>
				{#if data.user}
					<button 
						onclick={() => handleCheckout(PRODUCT_IDS.pro)} 
						class="btn btn-primary btn-full"
						disabled={loading === PRODUCT_IDS.pro}
					>
						{loading === PRODUCT_IDS.pro ? 'Loading...' : 'Subscribe Now'}
					</button>
				{:else}
					<a href="/auth/signup" class="btn btn-primary btn-full">Get Started</a>
				{/if}
			</div>

			<!-- Enterprise Plan -->
			<div class="pricing-card">
				<div class="plan-header">
					<h2>Enterprise</h2>
					<div class="price">
						<span class="amount">$99</span>
						<span class="period">/month</span>
					</div>
					<p class="plan-description">For large teams</p>
				</div>
				<ul class="features-list">
					<li><span class="check">✓</span> Everything in Pro</li>
					<li><span class="check">✓</span> Unlimited projects</li>
					<li><span class="check">✓</span> Dedicated support</li>
					<li><span class="check">✓</span> SLA guarantee</li>
					<li><span class="check">✓</span> Custom integrations</li>
					<li><span class="check">✓</span> Team management</li>
				</ul>
				{#if data.user}
					<button 
						onclick={() => handleCheckout(PRODUCT_IDS.enterprise)} 
						class="btn btn-secondary btn-full"
						disabled={loading === PRODUCT_IDS.enterprise}
					>
						{loading === PRODUCT_IDS.enterprise ? 'Loading...' : 'Subscribe Now'}
					</button>
				{:else}
					<a href="/auth/signup" class="btn btn-secondary btn-full">Get Started</a>
				{/if}
			</div>
		</div>

		<section class="faq">
			<h2 class="text-center mb-4">Frequently Asked Questions</h2>
			<div class="faq-grid">
				<div class="faq-item">
					<h3>Can I cancel anytime?</h3>
					<p>Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.</p>
				</div>
				<div class="faq-item">
					<h3>What payment methods do you accept?</h3>
					<p>We accept all major credit cards, debit cards, and various local payment methods through DodoPay.</p>
				</div>
				<div class="faq-item">
					<h3>Do you offer refunds?</h3>
					<p>Yes, we offer a 14-day money-back guarantee. If you're not satisfied, contact us for a full refund.</p>
				</div>
				<div class="faq-item">
					<h3>Can I upgrade or downgrade?</h3>
					<p>Absolutely! You can change your plan at any time from your dashboard. Changes take effect immediately.</p>
				</div>
			</div>
		</section>
	</div>
</main>

<style>
	.pricing-page {
		min-height: 100vh;
		padding: 3rem 0 6rem;
		background: var(--bg-primary);
	}

	.pricing-nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 4rem;
	}

	.back-link {
		color: var(--text-secondary);
		font-size: 0.875rem;
		font-weight: 500;
	}

	.pricing-header {
		text-align: center;
		margin-bottom: 5rem;
	}

	.pricing-header h1 {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.error-banner {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		margin-top: 2rem;
		padding: 0.75rem 1rem;
		background: #fef2f2;
		border: 1px solid #fee2e2;
		border-radius: 6px;
		color: #dc2626;
		font-size: 0.875rem;
		max-width: 400px;
		margin-left: auto;
		margin-right: auto;
	}

	.error-banner button {
		background: none;
		border: none;
		color: #dc2626;
		cursor: pointer;
		font-size: 1.25rem;
		line-height: 1;
		padding: 0;
	}

	.pricing-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
		margin-bottom: 6rem;
	}

	.pricing-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 2.5rem;
		position: relative;
		display: flex;
		flex-direction: column;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.pricing-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-lg);
	}

	.pricing-card.featured {
		border-color: var(--accent);
		border-width: 2px;
	}

	.featured-badge {
		position: absolute;
		top: -12px;
		left: 1.5rem;
		background: var(--accent);
		color: white;
		padding: 0.25rem 0.75rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.plan-header {
		margin-bottom: 2rem;
	}

	.plan-header h2 {
		font-size: 1.25rem;
		margin-bottom: 1rem;
	}

	.price {
		display: flex;
		align-items: baseline;
		gap: 0.25rem;
		margin-bottom: 0.75rem;
	}

	.amount {
		font-size: 3rem;
		font-weight: 800;
		line-height: 1;
		color: var(--text-primary);
	}

	.period {
		color: var(--text-secondary);
		font-size: 0.875rem;
		font-weight: 500;
	}

	.plan-description {
		color: var(--text-secondary);
		font-size: 0.875rem;
		line-height: 1.5;
	}

	.features-list {
		list-style: none;
		flex: 1;
		margin-bottom: 2.5rem;
	}

	.features-list li {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		padding: 0.625rem 0;
		color: var(--text-secondary);
		font-size: 0.875rem;
	}

	.check {
		color: var(--accent);
		font-weight: 700;
		font-size: 1rem;
	}

	.btn-full {
		width: 100%;
	}

	.faq {
		max-width: 800px;
		margin: 0 auto;
	}

	.faq h2 {
		margin-bottom: 3rem;
		font-size: 2rem;
	}

	.faq-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	.faq-item {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 1.5rem;
	}

	.faq-item h3 {
		font-size: 1rem;
		margin-bottom: 0.75rem;
	}

	.faq-item p {
		color: var(--text-secondary);
		font-size: 0.875rem;
		line-height: 1.6;
	}

	@media (max-width: 640px) {
		.pricing-header h1 {
			font-size: 2.25rem;
		}

		.pricing-grid {
			gap: 1.5rem;
		}
	}
</style>

