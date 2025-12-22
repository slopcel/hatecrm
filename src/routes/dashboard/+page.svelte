<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import type { EnemyWithGrievances } from '$lib/types/database';
	import { toast } from 'svelte-sonner';
	import Plus from 'lucide-svelte/icons/plus';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import ChevronUp from 'lucide-svelte/icons/chevron-up';
	import X from 'lucide-svelte/icons/x';
	import Frown from 'lucide-svelte/icons/frown';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showAddForm = $state(false);
	let expandedEnemyId = $state<string | null>(null);
	let addingEnemy = $state(false);
	let addingGrievance = $state(false);
	let deletingId = $state<string | null>(null);

	function toggleExpanded(enemyId: string) {
		expandedEnemyId = expandedEnemyId === enemyId ? null : enemyId;
	}

	$effect(() => {
		if (form?.success) {
			if (form.action === 'addEnemy') {
				toast.success('Added to the list. They earned it.');
				showAddForm = false;
			} else if (form.action === 'deleteEnemy') {
				toast.success('Off the list. Feeling generous?');
			} else if (form.action === 'addGrievance') {
				toast.success('Grievance noted. The record grows.');
			} else if (form.action === 'deleteGrievance') {
				toast.success('Grievance removed. Going soft?');
			}
		} else if (form?.message) {
			toast.error(form.message);
		}
	});
</script>

<svelte:head>
	<title>Dashboard | HateCRM</title>
</svelte:head>

<main class="dashboard">
	<div class="container">
		<header class="dashboard-header">
			<div>
				<h1>HateCRM</h1>
				<p class="tagline">Your enemies, organized.</p>
			</div>
			<div class="header-actions">
				<button 
					class="btn btn-primary" 
					onclick={() => showAddForm = !showAddForm}
				>
					<Plus size={18} />
					Add to the List
				</button>
				<form action="/auth/logout" method="POST">
					<button type="submit" class="btn btn-ghost">Sign Out</button>
				</form>
			</div>
		</header>

		<!-- Add Enemy Form -->
		{#if showAddForm}
			<div class="add-form-container animate-in">
				<form 
					method="POST" 
					action="?/addEnemy"
					class="add-form"
					use:enhance={() => {
						addingEnemy = true;
						return async ({ update }) => {
							addingEnemy = false;
							await update();
						};
					}}
				>
					<div class="form-row">
						<div class="form-group">
							<label for="name" class="label">Name</label>
							<input 
								type="text" 
								id="name" 
								name="name" 
								class="input" 
								placeholder="Who wronged you?"
								required
							/>
						</div>
						<div class="form-group">
							<label for="nickname" class="label">Nickname (optional)</label>
							<input 
								type="text" 
								id="nickname" 
								name="nickname" 
								class="input" 
								placeholder="e.g., 'The Reply-All Guy'"
							/>
						</div>
					</div>
					<div class="form-actions">
						<button type="button" class="btn btn-ghost" onclick={() => showAddForm = false}>
							Cancel
						</button>
						<button type="submit" class="btn btn-primary" disabled={addingEnemy}>
							{addingEnemy ? 'Adding...' : 'Add Enemy'}
						</button>
					</div>
				</form>
			</div>
		{/if}

		<!-- Enemy List -->
		<div class="enemy-list">
			{#if data.enemies.length === 0}
				<div class="empty-state">
					<div class="empty-icon">
						<Frown size={48} />
					</div>
					<h2>No enemies yet?</h2>
					<p>Lucky you. Or maybe you're just in denial.</p>
					<button class="btn btn-primary" onclick={() => showAddForm = true}>
						<Plus size={18} />
						Add Your First Enemy
					</button>
				</div>
			{:else}
				{#each data.enemies as enemy (enemy.id)}
					{@const isExpanded = expandedEnemyId === enemy.id}
					<div class="enemy-card" class:expanded={isExpanded}>
						<button 
							class="enemy-header"
							onclick={() => toggleExpanded(enemy.id)}
							aria-expanded={isExpanded}
						>
							<div class="enemy-info">
								<div class="enemy-avatar">
									{enemy.name.charAt(0).toUpperCase()}
								</div>
								<div class="enemy-details">
									<h3 class="enemy-name">{enemy.name}</h3>
									{#if enemy.nickname}
										<p class="enemy-nickname">"{enemy.nickname}"</p>
									{/if}
								</div>
							</div>
							<div class="enemy-meta">
								<span class="grievance-count">
									{enemy.grievance_count} {enemy.grievance_count === 1 ? 'reason' : 'reasons'}
								</span>
								{#if isExpanded}
									<ChevronUp size={20} />
								{:else}
									<ChevronDown size={20} />
								{/if}
							</div>
						</button>

						{#if isExpanded}
							<div class="enemy-expanded animate-in">
								<!-- Grievances List -->
								<div class="grievances-section">
									<h4>Why they're on the list:</h4>
									{#if enemy.grievances.length === 0}
										<p class="no-grievances">No reasons yet. What are you waiting for?</p>
									{:else}
										<ul class="grievances-list">
											{#each enemy.grievances as grievance (grievance.id)}
												<li class="grievance-item">
													<span>{grievance.reason}</span>
													<form 
														method="POST" 
														action="?/deleteGrievance"
														use:enhance={() => {
															return async ({ update }) => {
																await update();
															};
														}}
													>
														<input type="hidden" name="grievanceId" value={grievance.id} />
														<button type="submit" class="btn-icon" aria-label="Delete grievance">
															<X size={14} />
														</button>
													</form>
												</li>
											{/each}
										</ul>
									{/if}
								</div>

								<!-- Add Grievance Form -->
								<form 
									method="POST" 
									action="?/addGrievance"
									class="add-grievance-form"
									use:enhance={() => {
										addingGrievance = true;
										return async ({ update }) => {
											addingGrievance = false;
											await update();
										};
									}}
								>
									<input type="hidden" name="enemyId" value={enemy.id} />
									<div class="grievance-input-row">
										<input 
											type="text" 
											name="reason" 
											class="input" 
											placeholder="What did they do now?"
											required
										/>
										<button type="submit" class="btn btn-primary" disabled={addingGrievance}>
											{addingGrievance ? '...' : 'Add'}
										</button>
									</div>
								</form>

								<!-- Delete Enemy -->
								<div class="enemy-actions">
									<form 
										method="POST" 
										action="?/deleteEnemy"
										use:enhance={() => {
											deletingId = enemy.id;
											return async ({ update }) => {
												deletingId = null;
												await update();
											};
										}}
									>
										<input type="hidden" name="enemyId" value={enemy.id} />
										<button 
											type="submit" 
											class="btn btn-ghost btn-danger"
											disabled={deletingId === enemy.id}
										>
											<Trash2 size={16} />
											{deletingId === enemy.id ? 'Removing...' : 'Remove from list'}
										</button>
									</form>
								</div>
							</div>
						{/if}
					</div>
				{/each}
			{/if}
		</div>
	</div>
</main>

<style>
	.dashboard {
		min-height: 100vh;
		padding: 2rem 0;
		background: var(--bg-primary);
	}

	.dashboard-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--border);
	}

	.dashboard-header h1 {
		font-size: 1.75rem;
		margin-bottom: 0.25rem;
	}

	.tagline {
		color: var(--text-muted);
		font-size: 0.9375rem;
		font-style: italic;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	/* Add Form */
	.add-form-container {
		margin-bottom: 2rem;
	}

	.add-form {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 1.5rem;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
	}

	/* Empty State */
	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		background: var(--bg-card);
		border: 1px dashed var(--border);
		border-radius: 8px;
	}

	.empty-icon {
		color: var(--text-muted);
		margin-bottom: 1rem;
	}

	.empty-state h2 {
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
	}

	.empty-state p {
		color: var(--text-secondary);
		margin-bottom: 1.5rem;
	}

	/* Enemy List */
	.enemy-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.enemy-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 8px;
		overflow: hidden;
		transition: box-shadow 0.2s ease;
	}

	.enemy-card:hover {
		box-shadow: var(--shadow-sm);
	}

	.enemy-card.expanded {
		border-color: var(--accent);
	}

	.enemy-header {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.25rem;
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
	}

	.enemy-header:hover {
		background: var(--bg-secondary);
	}

	.enemy-info {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.enemy-avatar {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: var(--accent);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 1.125rem;
	}

	.enemy-details {
		display: flex;
		flex-direction: column;
	}

	.enemy-name {
		font-size: 1rem;
		font-weight: 600;
		margin: 0;
	}

	.enemy-nickname {
		font-size: 0.8125rem;
		color: var(--text-secondary);
		font-style: italic;
		margin: 0.125rem 0 0 0;
	}

	.enemy-meta {
		display: flex;
		align-items: center;
		gap: 1rem;
		color: var(--text-secondary);
	}

	.grievance-count {
		font-size: 0.8125rem;
		font-weight: 500;
		background: var(--accent-soft);
		color: var(--accent);
		padding: 0.25rem 0.625rem;
		border-radius: 100px;
	}

	/* Expanded Section */
	.enemy-expanded {
		padding: 1.25rem;
		border-top: 1px solid var(--border);
		background: var(--bg-secondary);
	}

	.grievances-section h4 {
		font-size: 0.8125rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-secondary);
		margin-bottom: 0.75rem;
	}

	.no-grievances {
		color: var(--text-muted);
		font-size: 0.875rem;
		font-style: italic;
		margin-bottom: 1rem;
	}

	.grievances-list {
		list-style: none;
		margin: 0 0 1rem 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.grievance-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: var(--bg-card);
		padding: 0.75rem 1rem;
		border-radius: 6px;
		font-size: 0.875rem;
		border: 1px solid var(--border-subtle);
	}

	.btn-icon {
		background: none;
		border: none;
		padding: 0.25rem;
		cursor: pointer;
		color: var(--text-muted);
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.btn-icon:hover {
		background: var(--bg-secondary);
		color: var(--error);
	}

	/* Add Grievance Form */
	.add-grievance-form {
		margin-bottom: 1rem;
	}

	.grievance-input-row {
		display: flex;
		gap: 0.5rem;
	}

	.grievance-input-row .input {
		flex: 1;
	}

	/* Enemy Actions */
	.enemy-actions {
		padding-top: 1rem;
		border-top: 1px solid var(--border-subtle);
	}

	.btn-danger {
		color: var(--error);
	}

	.btn-danger:hover {
		background: #fef2f2;
	}

	/* Responsive */
	@media (max-width: 640px) {
		.dashboard-header {
			flex-direction: column;
			gap: 1rem;
			text-align: center;
		}

		.header-actions {
			flex-direction: column;
			width: 100%;
		}

		.header-actions .btn {
			width: 100%;
		}

		.form-row {
			grid-template-columns: 1fr;
		}

		.enemy-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.75rem;
		}

		.enemy-meta {
			width: 100%;
			justify-content: space-between;
		}
	}
</style>
