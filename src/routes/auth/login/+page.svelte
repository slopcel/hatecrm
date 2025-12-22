<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Sign In | ShipFast</title>
</svelte:head>

<main class="auth-page">
	<div class="auth-container">
		<a href="/" class="back-link">← Back to home</a>

		<div class="auth-card">
			<div class="auth-header">
				<h1>Welcome back</h1>
				<p class="text-secondary">Sign in to your account</p>
			</div>

			{#if form?.error}
				<div class="error-message">
					{form.error}
				</div>
			{/if}

			<form
				method="POST"
				action="?/login"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						await update();
					};
				}}
			>
				<div class="form-group">
					<label for="email">Email</label>
					<input type="email" id="email" name="email" required placeholder="you@example.com" />
				</div>

				<div class="form-group">
					<label for="password">Password</label>
					<input type="password" id="password" name="password" required placeholder="••••••••" />
				</div>

				<button type="submit" class="btn btn-primary btn-full" disabled={loading}>
					{loading ? 'Signing in...' : 'Sign In'}
				</button>
			</form>

			<div class="divider">
				<span>or continue with</span>
			</div>

			<div class="oauth-buttons">
				<form method="POST" action="?/google">
					<button type="submit" class="btn btn-secondary btn-full">
						<svg viewBox="0 0 24 24" width="20" height="20">
							<path
								fill="currentColor"
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							/>
							<path
								fill="currentColor"
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							/>
							<path
								fill="currentColor"
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
							/>
							<path
								fill="currentColor"
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							/>
						</svg>
						Google
					</button>
				</form>

				<form method="POST" action="?/github">
					<button type="submit" class="btn btn-secondary btn-full">
						<svg viewBox="0 0 24 24" width="20" height="20">
							<path
								fill="currentColor"
								d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
							/>
						</svg>
						GitHub
					</button>
				</form>
			</div>

			<p class="auth-footer">
				Don't have an account? <a href="/auth/signup">Sign up</a>
			</p>
		</div>
	</div>
</main>

<style>
	.auth-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		background: var(--bg-secondary);
	}

	.auth-container {
		width: 100%;
		max-width: 400px;
	}

	.back-link {
		display: inline-block;
		margin-bottom: 2rem;
		color: var(--text-secondary);
		font-size: 0.875rem;
		font-weight: 500;
	}

	.auth-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 2.5rem;
		box-shadow: var(--shadow-sm);
	}

	.auth-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.auth-header h1 {
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
	}

	.error-message {
		background: #fef2f2;
		border: 1px solid #fee2e2;
		border-radius: 6px;
		padding: 0.75rem;
		color: #dc2626;
		font-size: 0.8125rem;
		margin-bottom: 1.5rem;
		text-align: center;
	}

	.form-group {
		margin-bottom: 1.25rem;
	}

	.form-group input {
		width: 100%;
	}

	.btn-full {
		width: 100%;
	}

	.divider {
		display: flex;
		align-items: center;
		margin: 1.5rem 0;
		color: var(--text-muted);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: var(--border);
	}

	.divider span {
		padding: 0 0.75rem;
	}

	.oauth-buttons {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}

	.auth-footer {
		text-align: center;
		margin-top: 2rem;
		color: var(--text-secondary);
		font-size: 0.875rem;
	}
</style>

