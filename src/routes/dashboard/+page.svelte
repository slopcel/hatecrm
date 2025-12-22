<script lang="ts">
	import type { PageData } from './$types';

	interface DashboardData {
		user: PageData['user'];
	}

	let { data }: { data: DashboardData } = $props();
</script>

<svelte:head>
	<title>Dashboard | ShipFast</title>
</svelte:head>

<main class="dashboard">
	<div class="container">
		<header class="dashboard-header">
			<div>
				<h1>Dashboard</h1>
				<p class="text-secondary">Welcome back, {data.user?.email}</p>
			</div>
			<form action="/auth/logout" method="POST">
				<button type="submit" class="btn btn-ghost">Sign Out</button>
			</form>
		</header>

		<div class="dashboard-grid">
			<!-- User Info Card -->
			<div class="card">
				<div class="card-header">
					<h2>Account</h2>
				</div>
				<div class="card-body">
					<div class="info-row">
						<span class="label">Email</span>
						<span class="value">{data.user?.email}</span>
					</div>
					<div class="info-row">
						<span class="label">User ID</span>
						<code class="value">{data.user?.id.slice(0, 8)}...</code>
					</div>
					<div class="info-row">
						<span class="label">Provider</span>
						<span class="value">{data.user?.app_metadata?.provider ?? 'email'}</span>
					</div>
				</div>
			</div>

			<!-- Quick Actions Card -->
			<div class="card">
				<div class="card-header">
					<h2>Quick Actions</h2>
				</div>
				<div class="card-body">
					<div class="action-grid">
						<a href="/" class="action-item">
							<span>Home</span>
						</a>
						<a href="https://supabase.com/dashboard" target="_blank" rel="noopener" class="action-item">
							<span>Supabase</span>
						</a>
					</div>
				</div>
			</div>

			<!-- Getting Started Card -->
			<div class="card card-wide">
				<div class="card-header">
					<h2>Getting Started</h2>
				</div>
				<div class="card-body">
					<div class="checklist">
						<div class="check-item done">
							<span class="check">✓</span>
							<span>Set up authentication</span>
						</div>
						<div class="check-item done">
							<span class="check">✓</span>
							<span>Create protected routes</span>
						</div>
						<div class="check-item">
							<span class="check">○</span>
							<span>Deploy Umami analytics</span>
						</div>
						<div class="check-item">
							<span class="check">○</span>
							<span>Deploy to Cloudflare Pages</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</main>

<style>
	.dashboard {
		min-height: 100vh;
		padding: 3rem 0;
		background: var(--bg-primary);
	}

	.dashboard-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 3rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--border);
	}

	.dashboard-header h1 {
		font-size: 1.5rem;
		margin-bottom: 0.25rem;
	}

	.dashboard-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 8px;
		overflow: hidden;
		box-shadow: var(--shadow-sm);
	}

	.card-wide {
		grid-column: 1 / -1;
	}

	.card-header {
		padding: 1.25rem 1.5rem;
		border-bottom: 1px solid var(--border-subtle);
		background: var(--bg-secondary);
	}

	.card-header h2 {
		font-size: 0.875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-secondary);
	}

	.card-body {
		padding: 1.5rem;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 0;
	}

	.info-row:not(:last-child) {
		border-bottom: 1px solid var(--border-subtle);
	}

	.label {
		color: var(--text-secondary);
		font-size: 0.8125rem;
		font-weight: 500;
	}

	.value {
		font-weight: 600;
		font-size: 0.875rem;
	}

	code.value {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.75rem;
		background: var(--bg-secondary);
		padding: 0.2rem 0.4rem;
		border-radius: 4px;
		color: var(--text-primary);
	}

	.btn-full {
		width: 100%;
	}

	.action-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.action-item {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 6px;
		color: var(--text-primary);
		font-size: 0.8125rem;
		font-weight: 600;
		transition: all 0.2s ease;
	}

	.action-item:hover {
		border-color: var(--accent);
		background: var(--accent-soft);
		color: var(--accent);
	}

	.checklist {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.check-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: var(--bg-secondary);
		border-radius: 6px;
		border: 1px solid var(--border-subtle);
	}

	.check-item.done {
		background: #fff;
		border-color: #dcfce7;
	}

	.check-item.done .check {
		color: #16a34a;
	}

	.check {
		font-family: 'JetBrains Mono', monospace;
		font-weight: 700;
		color: var(--text-muted);
	}

	@media (max-width: 640px) {
		.dashboard-header {
			flex-direction: column;
			gap: 1.5rem;
			text-align: center;
		}

		.action-grid {
			grid-template-columns: 1fr;
		}
	}
</style>

