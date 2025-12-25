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
	import CloudUpload from 'lucide-svelte/icons/cloud-upload';
	import Twitter from 'lucide-svelte/icons/twitter';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import Search from 'lucide-svelte/icons/search';
	import LayoutGrid from 'lucide-svelte/icons/layout-grid';
	import List from 'lucide-svelte/icons/list';
	import { browser } from '$app/environment';
	import { hasLocalData, getAllDataForSync, clearAllData, cleanTwitterHandle, extractTweetId } from '$lib/stores/localEnemies';
	import { invalidateAll } from '$app/navigation';
	
	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showAddForm = $state(false);
	let expandedEnemyId = $state<string | null>(null);
	let addingEnemy = $state(false);
	let addingGrievance = $state(false);
	let deletingId = $state<string | null>(null);
	let showSyncBanner = $state(false);
	let syncing = $state(false);
	let searchQuery = $state('');
	let viewMode = $state<'list' | 'whiteboard'>('list');
	let pfpCache = $state<Record<string, string>>({});
	let pfpLoading = $state<Record<string, boolean>>({});

	// Whiteboard dragging state
	let draggingId = $state<string | null>(null);
	let dragOffset = $state({ x: 0, y: 0 });
	let stickyPositions = $state<Record<string, { x: number; y: number }>>({});
	let selectedStickyId = $state<string | null>(null);

	// Initialize positions from enemy data
	$effect(() => {
		if (browser && data.enemies.length > 0) {
			const newPositions: Record<string, { x: number; y: number }> = {};
			data.enemies.forEach((enemy, index) => {
				if (enemy.position_x !== null && enemy.position_y !== null) {
					newPositions[enemy.id] = { x: enemy.position_x, y: enemy.position_y };
				} else {
					// Default grid layout
					const col = index % 4;
					const row = Math.floor(index / 4);
					newPositions[enemy.id] = { x: 20 + col * 220, y: 20 + row * 200 };
				}
			});
			stickyPositions = newPositions;
		}
	});

	function handleStickyMouseDown(e: MouseEvent, enemyId: string) {
		if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) return;
		
		draggingId = enemyId;
		const pos = stickyPositions[enemyId] || { x: 0, y: 0 };
		dragOffset = {
			x: e.clientX - pos.x,
			y: e.clientY - pos.y
		};
		e.preventDefault();
	}

	function handleMouseMove(e: MouseEvent) {
		if (!draggingId) return;
		
		stickyPositions[draggingId] = {
			x: Math.max(0, e.clientX - dragOffset.x),
			y: Math.max(0, e.clientY - dragOffset.y)
		};
		stickyPositions = { ...stickyPositions };
	}

	function handleMouseUp() {
		if (draggingId) {
			// Save position to server
			const pos = stickyPositions[draggingId];
			if (pos) {
				savePosition(draggingId, pos.x, pos.y);
			}
		}
		draggingId = null;
	}

	async function savePosition(enemyId: string, x: number, y: number) {
		try {
			await fetch('/api/position', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ enemyId, x, y })
			});
		} catch (error) {
			console.error('Failed to save position:', error);
		}
	}

	function toggleStickyExpanded(enemyId: string, e: MouseEvent) {
		e.stopPropagation();
		selectedStickyId = selectedStickyId === enemyId ? null : enemyId;
	}

	// Filter enemies based on search
	let filteredEnemies = $derived(() => {
		if (!searchQuery.trim()) return data.enemies;
		const query = searchQuery.toLowerCase();
		return data.enemies.filter((enemy) => {
			return (
				enemy.name.toLowerCase().includes(query) ||
				enemy.nickname?.toLowerCase().includes(query) ||
				enemy.twitter_handle?.toLowerCase().includes(query) ||
				enemy.grievances.some((g) => g.reason.toLowerCase().includes(query))
			);
		});
	});

	// Fetch Twitter profile picture
	async function fetchTwitterPfp(handle: string): Promise<string | null> {
		const cleanHandle = cleanTwitterHandle(handle);
		if (pfpCache[cleanHandle]) return pfpCache[cleanHandle];
		if (pfpLoading[cleanHandle]) return null;

		pfpLoading[cleanHandle] = true;
		try {
			const response = await fetch(`https://unavatar.io/twitter/${cleanHandle}`);
			if (response.ok) {
				const url = `https://unavatar.io/twitter/${cleanHandle}`;
				pfpCache[cleanHandle] = url;
				pfpCache = { ...pfpCache };
				return url;
			}
		} catch (error) {
			console.error('Error fetching pfp:', error);
		} finally {
			pfpLoading[cleanHandle] = false;
			pfpLoading = { ...pfpLoading };
		}
		return null;
	}

	// Load pfp for enemies with twitter handles on mount
	$effect(() => {
		if (browser) {
			data.enemies.forEach((enemy) => {
				if (enemy.twitter_handle) {
					fetchTwitterPfp(enemy.twitter_handle);
				}
			});
		}
	});

	// Check for local data on mount
	$effect(() => {
		if (browser) {
			showSyncBanner = hasLocalData();
		}
	});

	function toggleExpanded(enemyId: string) {
		expandedEnemyId = expandedEnemyId === enemyId ? null : enemyId;
	}

	async function syncLocalData() {
		syncing = true;
		try {
			const syncData = getAllDataForSync();
			
			const response = await fetch('/api/sync', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(syncData)
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to sync');
			}

			// Clear local data after successful sync
			clearAllData();
			showSyncBanner = false;

			toast.success(`Synced ${result.syncedEnemies} enemies and ${result.syncedGrievances} grievances!`);
			
			// Refresh the page data to show synced enemies
			invalidateAll();
		} catch (error) {
			console.error('Sync error:', error);
			toast.error('Failed to sync data. Please try again.');
		} finally {
			syncing = false;
		}
	}

	function dismissSyncBanner() {
		showSyncBanner = false;
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
		<!-- Sync Banner -->
		{#if showSyncBanner}
			<div class="sync-banner">
				<div class="sync-banner-content">
					<CloudUpload size={20} />
					<div class="sync-banner-text">
						<strong>You have local data!</strong>
						<span>Sync your locally saved enemies to your account.</span>
					</div>
				</div>
				<div class="sync-banner-actions">
					<button 
						class="btn btn-primary btn-sm" 
						onclick={syncLocalData}
						disabled={syncing}
					>
						{#if syncing}
							<span class="spinner-small"></span>
							Syncing...
						{:else}
							Sync Now
						{/if}
					</button>
					<button 
						class="btn btn-ghost btn-sm" 
						onclick={dismissSyncBanner}
					>
						Dismiss
					</button>
				</div>
			</div>
		{/if}

		<header class="dashboard-header">
			<div class="header-left">
				<a href="/" class="logo-link"><h1>HateCRM</h1></a>
				<p class="tagline">Your enemies, organized.</p>
			</div>
			<div class="header-actions">
				<div class="search-container">
					<Search size={16} class="search-icon" />
					<input 
						type="text" 
						class="search-input" 
						placeholder="Search enemies..."
						bind:value={searchQuery}
					/>
				</div>
				<div class="view-toggle">
					<button 
						class="view-btn" 
						class:active={viewMode === 'list'}
						onclick={() => viewMode = 'list'}
						aria-label="List view"
					>
						<List size={18} />
					</button>
					<button 
						class="view-btn" 
						class:active={viewMode === 'whiteboard'}
						onclick={() => viewMode = 'whiteboard'}
						aria-label="Whiteboard view"
					>
						<LayoutGrid size={18} />
					</button>
				</div>
				<button 
					class="btn btn-primary" 
					onclick={() => showAddForm = !showAddForm}
				>
					<Plus size={18} />
					<span class="btn-text">Add to the List</span>
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
					<div class="form-row">
						<div class="form-group">
							<label for="twitter_handle" class="label">Twitter/X Handle (optional)</label>
							<input 
								type="text" 
								id="twitter_handle" 
								name="twitter_handle" 
								class="input" 
								placeholder="@username"
							/>
						</div>
						<div class="form-group">
							<label for="tweet_url" class="label">Tweet URL (optional)</label>
							<input 
								type="url" 
								id="tweet_url" 
								name="tweet_url" 
								class="input" 
								placeholder="https://x.com/..."
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
		{:else if filteredEnemies().length === 0}
			<div class="empty-state">
				<div class="empty-icon">
					<Search size={48} />
				</div>
				<h2>No matches found</h2>
				<p>Try a different search term.</p>
				<button class="btn btn-secondary" onclick={() => searchQuery = ''}>
					Clear Search
				</button>
			</div>
		{:else if viewMode === 'list'}
			<!-- List View -->
			<div class="enemy-list">
				{#each filteredEnemies() as enemy (enemy.id)}
					{@const isExpanded = expandedEnemyId === enemy.id}
					{@const twitterPfp = enemy.twitter_handle ? pfpCache[cleanTwitterHandle(enemy.twitter_handle)] : null}
					<div class="enemy-card" class:expanded={isExpanded}>
						<button 
							class="enemy-header"
							onclick={() => toggleExpanded(enemy.id)}
							aria-expanded={isExpanded}
						>
							<div class="enemy-info">
								{#if twitterPfp}
									<img 
										src={twitterPfp} 
										alt={enemy.name} 
										class="enemy-avatar-img"
										onerror={(e) => (e.currentTarget as HTMLImageElement).style.display = 'none'}
									/>
								{/if}
								<div class="enemy-avatar" class:hidden={!!twitterPfp}>
									{enemy.name.charAt(0).toUpperCase()}
								</div>
								<div class="enemy-details">
									<h3 class="enemy-name">{enemy.name}</h3>
									{#if enemy.nickname}
										<p class="enemy-nickname">"{enemy.nickname}"</p>
									{/if}
									{#if enemy.twitter_handle}
										<a 
											href="https://x.com/{cleanTwitterHandle(enemy.twitter_handle)}"
											target="_blank"
											rel="noopener noreferrer"
											class="twitter-link"
											onclick={(e) => e.stopPropagation()}
										>
											<Twitter size={12} />
											@{cleanTwitterHandle(enemy.twitter_handle)}
										</a>
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
			</div>
		{:else}
			<!-- Whiteboard View -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<div 
				class="whiteboard"
				onmousemove={handleMouseMove}
				onmouseup={handleMouseUp}
				onmouseleave={handleMouseUp}
				role="application"
				aria-label="Enemy whiteboard"
			>
				{#each filteredEnemies() as enemy (enemy.id)}
					{@const pos = stickyPositions[enemy.id] || { x: 0, y: 0 }}
					{@const twitterPfp = enemy.twitter_handle ? pfpCache[cleanTwitterHandle(enemy.twitter_handle)] : null}
					{@const isSelected = selectedStickyId === enemy.id}
					<div 
						class="sticky-note"
						class:dragging={draggingId === enemy.id}
						class:selected={isSelected}
						style="left: {pos.x}px; top: {pos.y}px;"
						onmousedown={(e) => handleStickyMouseDown(e, enemy.id)}
						role="button"
						tabindex="0"
					>
						<div class="sticky-header">
							{#if twitterPfp}
								<img 
									src={twitterPfp} 
									alt={enemy.name} 
									class="sticky-avatar-img"
									onerror={(e) => (e.currentTarget as HTMLImageElement).style.display = 'none'}
								/>
							{/if}
							<span class="sticky-name">{enemy.name}</span>
							<form 
								method="POST" 
								action="?/deleteEnemy"
								use:enhance={() => {
									return async ({ update }) => {
										await update();
									};
								}}
							>
								<input type="hidden" name="enemyId" value={enemy.id} />
								<button 
									type="submit"
									class="sticky-delete"
									aria-label="Delete"
								>
									<X size={14} />
								</button>
							</form>
						</div>
						{#if enemy.nickname}
							<p class="sticky-nickname">"{enemy.nickname}"</p>
						{/if}
						{#if enemy.twitter_handle}
							<a 
								href="https://x.com/{cleanTwitterHandle(enemy.twitter_handle)}"
								target="_blank"
								rel="noopener noreferrer"
								class="sticky-twitter"
							>
								<Twitter size={12} />
								@{cleanTwitterHandle(enemy.twitter_handle)}
							</a>
						{/if}
						<div class="sticky-count">
							{enemy.grievance_count} {enemy.grievance_count === 1 ? 'reason' : 'reasons'}
						</div>
						<button 
							class="sticky-expand"
							onclick={(e) => toggleStickyExpanded(enemy.id, e)}
						>
							{isSelected ? 'Hide details' : 'Show details'}
						</button>
						{#if isSelected}
							<div class="sticky-details">
								{#if enemy.grievances.length > 0}
									<ul class="sticky-grievances">
										{#each enemy.grievances.slice(0, 3) as grievance}
											<li>{grievance.reason}</li>
										{/each}
										{#if enemy.grievances.length > 3}
											<li class="more">+{enemy.grievances.length - 3} more...</li>
										{/if}
									</ul>
								{:else}
									<p class="no-reasons">No reasons yet</p>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</main>

<style>
	/* Sync Banner */
	.sync-banner {
		background: linear-gradient(135deg, var(--accent-soft) 0%, #fff5f5 100%);
		border: 1px solid var(--accent);
		border-radius: 12px;
		padding: 1rem 1.25rem;
		margin-bottom: 1.5rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.sync-banner-content {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		color: var(--accent);
	}

	.sync-banner-text {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.sync-banner-text strong {
		font-size: 0.9375rem;
		color: var(--text-primary);
	}

	.sync-banner-text span {
		font-size: 0.8125rem;
		color: var(--text-secondary);
	}

	.sync-banner-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.btn-sm {
		padding: 0.5rem 0.875rem;
		font-size: 0.8125rem;
	}

	.spinner-small {
		width: 14px;
		height: 14px;
		border: 2px solid currentColor;
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		display: inline-block;
		margin-right: 0.25rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

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
		flex-wrap: wrap;
	}

	.search-container {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-container :global(.search-icon) {
		position: absolute;
		left: 0.75rem;
		color: var(--text-muted);
		pointer-events: none;
	}

	.search-input {
		padding: 0.625rem 0.875rem 0.625rem 2.25rem;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg-card);
		color: var(--text-primary);
		font-size: 0.875rem;
		width: 200px;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
	}

	.search-input:focus {
		outline: none;
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-soft);
	}

	.search-input::placeholder {
		color: var(--text-muted);
	}

	/* View Toggle */
	.view-toggle {
		display: flex;
		border: 1px solid var(--border);
		border-radius: 8px;
		overflow: hidden;
	}

	.view-btn {
		padding: 0.5rem 0.75rem;
		background: var(--bg-card);
		border: none;
		cursor: pointer;
		color: var(--text-muted);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s ease;
	}

	.view-btn:hover {
		background: var(--bg-secondary);
		color: var(--text-primary);
	}

	.view-btn.active {
		background: var(--accent);
		color: white;
	}

	.view-btn:first-child {
		border-right: 1px solid var(--border);
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
		color: var(--text-primary);
	}

	.enemy-header:hover {
		background: var(--bg-secondary);
	}

	.enemy-info {
		display: flex;
		align-items: center;
		gap: 1rem;
		min-width: 0;
		flex: 1;
	}

	.enemy-avatar,
	.enemy-avatar-img {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.enemy-avatar {
		background: var(--accent);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 1.125rem;
	}

	.enemy-avatar-img {
		object-fit: cover;
		border: 2px solid var(--border);
	}

	.enemy-avatar.hidden {
		display: none;
	}

	.enemy-details {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.enemy-name {
		font-size: 1rem;
		font-weight: 600;
		margin: 0;
		color: var(--text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.enemy-nickname {
		font-size: 0.8125rem;
		color: var(--text-secondary);
		font-style: italic;
		margin: 0.125rem 0 0 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.twitter-link {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.75rem;
		color: var(--text-muted);
		text-decoration: none;
		margin-top: 0.25rem;
		transition: color 0.15s ease;
	}

	.twitter-link:hover {
		color: #1da1f2;
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

	/* Whiteboard View */
	.whiteboard {
		position: relative;
		min-height: 600px;
		background: 
			linear-gradient(90deg, var(--border) 1px, transparent 1px),
			linear-gradient(var(--border) 1px, transparent 1px);
		background-size: 20px 20px;
		border: 1px solid var(--border);
		border-radius: 12px;
		overflow: hidden;
	}

	.sticky-note {
		position: absolute;
		width: 200px;
		min-height: 120px;
		background: white;
		border-radius: 4px;
		padding: 0.875rem;
		box-shadow: 
			0 2px 8px rgba(0, 0, 0, 0.1),
			0 1px 2px rgba(0, 0, 0, 0.06);
		cursor: grab;
		user-select: none;
		transition: box-shadow 0.15s ease, transform 0.1s ease;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		border: 1px solid var(--border);
	}

	.sticky-note:hover {
		box-shadow: 
			0 4px 12px rgba(0, 0, 0, 0.15),
			0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.sticky-note.dragging {
		cursor: grabbing;
		box-shadow: 
			0 8px 24px rgba(0, 0, 0, 0.2),
			0 4px 8px rgba(0, 0, 0, 0.1);
		transform: rotate(2deg);
		z-index: 100;
	}

	.sticky-note.selected {
		border-color: var(--accent);
		z-index: 50;
	}

	.sticky-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.sticky-avatar-img {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		object-fit: cover;
		flex-shrink: 0;
	}

	.sticky-name {
		font-weight: 700;
		font-size: 0.875rem;
		color: var(--text-primary);
		line-height: 1.2;
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.sticky-delete {
		background: none;
		border: none;
		padding: 0.25rem;
		cursor: pointer;
		color: var(--text-muted);
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		opacity: 0;
		transition: opacity 0.15s ease, color 0.15s ease;
	}

	.sticky-note:hover .sticky-delete {
		opacity: 1;
	}

	.sticky-delete:hover {
		color: var(--error);
		background: var(--accent-soft);
	}

	.sticky-nickname {
		font-size: 0.75rem;
		color: var(--text-secondary);
		font-style: italic;
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.sticky-twitter {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.6875rem;
		color: var(--text-muted);
		text-decoration: none;
		transition: color 0.15s ease;
	}

	.sticky-twitter:hover {
		color: #1da1f2;
	}

	.sticky-count {
		font-size: 0.6875rem;
		font-weight: 500;
		color: var(--accent);
		background: var(--accent-soft);
		padding: 0.25rem 0.5rem;
		border-radius: 100px;
		align-self: flex-start;
	}

	.sticky-expand {
		font-size: 0.6875rem;
		color: var(--text-muted);
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.25rem 0;
		text-align: left;
		transition: color 0.15s ease;
	}

	.sticky-expand:hover {
		color: var(--accent);
	}

	.sticky-details {
		border-top: 1px solid var(--border);
		padding-top: 0.5rem;
		margin-top: 0.25rem;
	}

	.sticky-grievances {
		list-style: none;
		padding: 0;
		margin: 0;
		font-size: 0.6875rem;
		color: var(--text-secondary);
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.sticky-grievances li {
		padding-left: 0.75rem;
		position: relative;
	}

	.sticky-grievances li::before {
		content: '•';
		position: absolute;
		left: 0;
		color: var(--accent);
	}

	.sticky-grievances .more {
		color: var(--text-muted);
		font-style: italic;
	}

	.sticky-details .no-reasons {
		font-size: 0.6875rem;
		color: var(--text-muted);
		font-style: italic;
		margin: 0;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.dashboard-header {
			flex-direction: column;
			gap: 1rem;
			text-align: center;
		}

		.header-actions {
			flex-direction: column;
			width: 100%;
		}

		.header-actions .btn,
		.header-actions form {
			width: 100%;
		}

		.header-actions form .btn {
			width: 100%;
		}

		.search-container {
			width: 100%;
		}

		.search-input {
			width: 100%;
		}

		.form-row {
			grid-template-columns: 1fr;
		}

		.sync-banner {
			flex-direction: column;
			align-items: stretch;
			text-align: center;
		}

		.sync-banner-content {
			justify-content: center;
		}

		.sync-banner-actions {
			justify-content: center;
		}
	}

	@media (max-width: 480px) {
		.dashboard {
			padding: 1rem 0;
		}

		.enemy-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.75rem;
		}

		.enemy-info {
			width: 100%;
		}

		.enemy-meta {
			width: 100%;
			justify-content: space-between;
		}

		.enemy-avatar,
		.enemy-avatar-img {
			width: 36px;
			height: 36px;
			font-size: 0.875rem;
		}

		.enemy-name {
			font-size: 0.9375rem;
		}

		.btn-text {
			display: none;
		}

		.whiteboard {
			min-height: 400px;
			overflow-x: auto;
		}

		.sticky-note {
			width: 160px;
			min-height: 100px;
			padding: 0.75rem;
		}

		.sticky-name {
			font-size: 0.75rem;
		}

		.sticky-count {
			font-size: 0.625rem;
		}
	}
</style>
