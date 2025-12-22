<script lang="ts">
	import { toast } from 'svelte-sonner';
	import Plus from 'lucide-svelte/icons/plus';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import ChevronUp from 'lucide-svelte/icons/chevron-up';
	import X from 'lucide-svelte/icons/x';
	import Frown from 'lucide-svelte/icons/frown';
	import Cloud from 'lucide-svelte/icons/cloud';
	import CloudUpload from 'lucide-svelte/icons/cloud-upload';
	import LayoutGrid from 'lucide-svelte/icons/layout-grid';
	import List from 'lucide-svelte/icons/list';
	import Twitter from 'lucide-svelte/icons/twitter';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import Search from 'lucide-svelte/icons/search';
	import Check from 'lucide-svelte/icons/check';
	import {
		getEnemiesWithGrievances,
		addEnemy,
		deleteEnemy,
		addGrievance,
		deleteGrievance,
		updateEnemyPosition,
		extractTweetId,
		cleanTwitterHandle,
		getAllDataForSync,
		clearAllData,
		type LocalEnemyWithGrievances
	} from '$lib/stores/localEnemies';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let enemies = $state<LocalEnemyWithGrievances[]>([]);
	let showAddForm = $state(false);
	let expandedEnemyId = $state<string | null>(null);
	let addingEnemy = $state(false);
	let syncing = $state(false);
	let viewMode = $state<'list' | 'whiteboard'>('list');
	let searchQuery = $state('');

	// Form state
	let newName = $state('');
	let newNickname = $state('');
	let newTwitterHandle = $state('');
	let newTweetUrl = $state('');
	let grievanceInputs = $state<Record<string, string>>({});
	let grievanceTweetUrls = $state<Record<string, string>>({});

	// Dragging state for whiteboard
	let draggingId = $state<string | null>(null);
	let dragOffset = $state({ x: 0, y: 0 });

	// Filtered enemies based on search
	let filteredEnemies = $derived(() => {
		if (!searchQuery.trim()) return enemies;
		const query = searchQuery.toLowerCase();
		return enemies.filter(enemy => 
			enemy.name.toLowerCase().includes(query) ||
			enemy.nickname?.toLowerCase().includes(query) ||
			enemy.twitter_handle?.toLowerCase().includes(query) ||
			enemy.grievances.some(g => g.reason.toLowerCase().includes(query))
		);
	});

	// Load enemies on mount
	$effect(() => {
		enemies = getEnemiesWithGrievances();
	});

	function refreshEnemies() {
		enemies = getEnemiesWithGrievances();
	}

	async function handleSync() {
		// If not logged in, redirect to login
		if (!data.isLoggedIn) {
			toast.info('Please log in to sync your list');
			goto('/auth/login');
			return;
		}

		// If no enemies to sync, show info
		if (enemies.length === 0) {
			toast.info('No enemies to sync');
			return;
		}

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
			refreshEnemies();

			toast.success(`Synced ${result.syncedEnemies} enemies and ${result.syncedGrievances} grievances to the cloud!`);
			
			// Redirect to dashboard to see synced data
			goto('/dashboard');
		} catch (error) {
			console.error('Sync error:', error);
			toast.error('Failed to sync data. Please try again.');
		} finally {
			syncing = false;
		}
	}

	function toggleExpanded(enemyId: string) {
		expandedEnemyId = expandedEnemyId === enemyId ? null : enemyId;
	}

	function handleAddEnemy(e: Event) {
		e.preventDefault();
		if (!newName.trim()) {
			toast.error('Name is required');
			return;
		}

		addingEnemy = true;
		addEnemy(
			newName.trim(), 
			newNickname.trim() || null,
			newTwitterHandle.trim() ? cleanTwitterHandle(newTwitterHandle) : null,
			newTweetUrl.trim() || null
		);
		refreshEnemies();
		toast.success('Added to the list. They earned it.');
		
		// Reset form
		newName = '';
		newNickname = '';
		newTwitterHandle = '';
		newTweetUrl = '';
		showAddForm = false;
		addingEnemy = false;
	}

	function handleDeleteEnemy(enemyId: string) {
		deleteEnemy(enemyId);
		refreshEnemies();
		toast.success('Off the list. Feeling generous?');
	}

	function handleAddGrievance(e: Event, enemyId: string) {
		e.preventDefault();
		const reason = grievanceInputs[enemyId]?.trim();
		if (!reason) {
			toast.error('Please enter a reason');
			return;
		}

		const tweetUrl = grievanceTweetUrls[enemyId]?.trim() || null;
		addGrievance(enemyId, reason, tweetUrl);
		refreshEnemies();
		grievanceInputs[enemyId] = '';
		grievanceTweetUrls[enemyId] = '';
		toast.success('Grievance noted. The record grows.');
	}

	function handleDeleteGrievance(grievanceId: string) {
		deleteGrievance(grievanceId);
		refreshEnemies();
		toast.success('Grievance removed. Going soft?');
	}

	// Get Twitter profile picture URL
	function getTwitterPfp(handle: string | null): string | null {
		if (!handle) return null;
		return `https://unavatar.io/twitter/${handle}`;
	}

	// Whiteboard drag handlers
	function handleDragStart(e: MouseEvent | TouchEvent, enemy: LocalEnemyWithGrievances) {
		if (viewMode !== 'whiteboard') return;
		draggingId = enemy.id;
		const rect = (e.target as HTMLElement).closest('.sticky-note')?.getBoundingClientRect();
		if (rect) {
			const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
			const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
			dragOffset = { x: clientX - rect.left, y: clientY - rect.top };
		}
	}

	function handleDrag(e: MouseEvent | TouchEvent) {
		if (!draggingId || !browser) return;
		const container = document.querySelector('.whiteboard-container');
		if (!container) return;
		
		const rect = container.getBoundingClientRect();
		const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
		const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
		const x = clientX - rect.left - dragOffset.x;
		const y = clientY - rect.top - dragOffset.y;
		
		updateEnemyPosition(draggingId, Math.max(0, x), Math.max(0, y));
		refreshEnemies();
	}

	function handleDragEnd() {
		draggingId = null;
	}

	function getRandomPosition(index: number) {
		// Spread notes in a grid-like pattern with some randomness
		const cols = 3;
		const row = Math.floor(index / cols);
		const col = index % cols;
		return {
			x: 20 + col * 200 + Math.random() * 20 - 10,
			y: 20 + row * 180 + Math.random() * 20 - 10
		};
	}
</script>

<svelte:head>
	<title>My List | HateCRM</title>
	<meta name="description" content="Track your enemies and document their offenses. Your personal grievance tracker." />
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
	<link rel="canonical" href="https://hatecrm.com/list" />
	
	<!-- Open Graph -->
	<meta property="og:site_name" content="HateCRM" />
	<meta property="og:title" content="My List | HateCRM" />
	<meta property="og:description" content="Track your enemies and document their offenses. Never forget a grievance." />
	<meta property="og:image" content="https://hatecrm.com/main-og-image.png" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://hatecrm.com/list" />
	
	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@_madiou" />
	<meta name="twitter:title" content="My List | HateCRM" />
	<meta name="twitter:description" content="Track your enemies and document their offenses. Never forget a grievance." />
	<meta name="twitter:image" content="https://hatecrm.com/main-og-image.png" />
</svelte:head>

<svelte:window 
	onmousemove={handleDrag}
	onmouseup={handleDragEnd}
	ontouchmove={handleDrag}
	ontouchend={handleDragEnd}
/>

<main class="dashboard" class:whiteboard-mode={viewMode === 'whiteboard'}>
	<div class="container">
		<header class="dashboard-header">
			<div class="header-left">
				<a href="/" class="logo-link"><h1>HateCRM</h1></a>
				<p class="tagline">Your enemies, organized.</p>
			</div>
			<div class="header-actions">
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
					class="btn btn-primary btn-add" 
					onclick={() => showAddForm = !showAddForm}
				>
					<Plus size={18} />
					<span class="btn-text">Add to the List</span>
				</button>
			<button 
				class="btn btn-ghost btn-sync"
				onclick={handleSync}
				disabled={syncing || enemies.length === 0}
			>
				{#if syncing}
					<span class="spinner-small"></span>
					<span class="btn-text">Syncing...</span>
				{:else}
					<CloudUpload size={16} />
					<span class="btn-text">Sync</span>
				{/if}
			</button>
			</div>
		</header>

		<!-- Search Bar -->
		<div class="search-container">
			<div class="search-wrapper">
				<Search size={18} class="search-icon" />
				<input 
					type="text" 
					class="search-input" 
					placeholder="Search enemies, nicknames, grievances..."
					bind:value={searchQuery}
				/>
				{#if searchQuery}
					<button class="search-clear" onclick={() => searchQuery = ''} aria-label="Clear search">
						<X size={16} />
					</button>
				{/if}
			</div>
		</div>

		<div class="local-notice">
			<p>Your list is stored locally in this browser. <a href="/auth/signup">Create an account</a> to sync across devices.</p>
		</div>

		<!-- Add Enemy Form -->
		{#if showAddForm}
			<div class="add-form-container animate-in">
				<form 
					class="add-form"
					onsubmit={handleAddEnemy}
				>
					<div class="form-row">
						<div class="form-group">
							<label for="name" class="label">Name</label>
							<input 
								type="text" 
								id="name" 
								class="input" 
								placeholder="Who wronged you?"
								bind:value={newName}
								required
							/>
						</div>
						<div class="form-group">
							<label for="nickname" class="label">Nickname (optional)</label>
							<input 
								type="text" 
								id="nickname" 
								class="input" 
								placeholder="e.g., 'The Reply-All Guy'"
								bind:value={newNickname}
							/>
						</div>
					</div>
					<div class="form-row">
						<div class="form-group">
							<label for="twitter" class="label">
								<Twitter size={14} />
								Twitter/X Handle (optional)
							</label>
							<input 
								type="text" 
								id="twitter" 
								class="input" 
								placeholder="@username"
								bind:value={newTwitterHandle}
							/>
						</div>
						<div class="form-group">
							<label for="tweet" class="label">Tweet URL (optional)</label>
							<input 
								type="url" 
								id="tweet" 
								class="input" 
								placeholder="https://twitter.com/user/status/..."
								bind:value={newTweetUrl}
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

		<!-- List View -->
		{#if viewMode === 'list'}
			<div class="enemy-list">
				{#if filteredEnemies().length === 0}
					<div class="empty-state">
						<div class="empty-icon">
							<Frown size={48} />
						</div>
						{#if searchQuery}
							<h2>No matches found</h2>
							<p>Try a different search term.</p>
							<button class="btn btn-secondary" onclick={() => searchQuery = ''}>
								Clear Search
							</button>
						{:else}
							<h2>No enemies yet?</h2>
							<p>Lucky you. Or maybe you're just in denial.</p>
							<button class="btn btn-primary" onclick={() => showAddForm = true}>
								<Plus size={18} />
								Add Your First Enemy
							</button>
						{/if}
					</div>
				{:else}
					{#each filteredEnemies() as enemy (enemy.id)}
						{@const isExpanded = expandedEnemyId === enemy.id}
						{@const pfpUrl = getTwitterPfp(enemy.twitter_handle)}
						<div class="enemy-card" class:expanded={isExpanded}>
							<button 
								class="enemy-header"
								onclick={() => toggleExpanded(enemy.id)}
								aria-expanded={isExpanded}
							>
								<div class="enemy-info">
									{#if pfpUrl}
										<img 
											src={pfpUrl} 
											alt="{enemy.name}'s avatar"
											class="enemy-avatar-img"
											onerror={(e) => {
												(e.target as HTMLImageElement).style.display = 'none';
												(e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
											}}
										/>
										<div class="enemy-avatar hidden">
											{enemy.name.charAt(0).toUpperCase()}
										</div>
									{:else}
										<div class="enemy-avatar">
											{enemy.name.charAt(0).toUpperCase()}
										</div>
									{/if}
									<div class="enemy-details">
										<h3 class="enemy-name">{enemy.name}</h3>
										{#if enemy.nickname}
											<p class="enemy-nickname">"{enemy.nickname}"</p>
										{/if}
										{#if enemy.twitter_handle}
											<a 
												href="https://twitter.com/{enemy.twitter_handle}" 
												target="_blank" 
												rel="noopener"
												class="twitter-link"
												onclick={(e) => e.stopPropagation()}
											>
												<Twitter size={12} />
												@{enemy.twitter_handle}
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
									<!-- Tweet Embed -->
									{#if enemy.tweet_url}
										{@const tweetId = extractTweetId(enemy.tweet_url)}
										{#if tweetId}
											<div class="tweet-embed">
												<blockquote class="twitter-tweet" data-theme="light">
													<a href={enemy.tweet_url}>Loading tweet...</a>
												</blockquote>
												<a href={enemy.tweet_url} target="_blank" rel="noopener" class="tweet-link">
													<ExternalLink size={14} />
													View on Twitter
												</a>
											</div>
										{/if}
									{/if}

									<!-- Grievances List -->
									<div class="grievances-section">
										<h4>Why they're on the list:</h4>
										{#if enemy.grievances.length === 0}
											<p class="no-grievances">No reasons yet. What are you waiting for?</p>
										{:else}
											<ul class="grievances-list">
												{#each enemy.grievances as grievance (grievance.id)}
													<li class="grievance-item">
														<div class="grievance-content">
															<span>{grievance.reason}</span>
															{#if grievance.tweet_url}
																<a 
																	href={grievance.tweet_url} 
																	target="_blank" 
																	rel="noopener"
																	class="grievance-tweet-link"
																>
																	<Twitter size={12} />
																</a>
															{/if}
														</div>
														<button 
															type="button" 
															class="btn-icon" 
															aria-label="Delete grievance"
															onclick={() => handleDeleteGrievance(grievance.id)}
														>
															<X size={14} />
														</button>
													</li>
												{/each}
											</ul>
										{/if}
									</div>

									<!-- Add Grievance Form -->
									<form 
										class="add-grievance-form"
										onsubmit={(e) => handleAddGrievance(e, enemy.id)}
									>
										<div class="grievance-input-row">
											<input 
												type="text" 
												class="input" 
												placeholder="What did they do now?"
												bind:value={grievanceInputs[enemy.id]}
												required
											/>
											<button type="submit" class="btn btn-primary">
												Add
											</button>
										</div>
										<input 
											type="url" 
											class="input input-small" 
											placeholder="Tweet URL (optional)"
											bind:value={grievanceTweetUrls[enemy.id]}
										/>
									</form>

									<!-- Delete Enemy -->
									<div class="enemy-actions">
										<button 
											type="button" 
											class="btn btn-ghost btn-danger"
											onclick={() => handleDeleteEnemy(enemy.id)}
										>
											<Trash2 size={16} />
											Remove from list
										</button>
									</div>
								</div>
							{/if}
						</div>
					{/each}
				{/if}
			</div>
		{:else}
			<!-- Whiteboard View -->
			<div class="whiteboard-container" class:dragging={draggingId !== null}>
				{#if filteredEnemies().length === 0}
					<div class="empty-state whiteboard-empty">
						<div class="empty-icon">
							<Frown size={48} />
						</div>
						{#if searchQuery}
							<h2>No matches found</h2>
							<p>Try a different search term.</p>
							<button class="btn btn-secondary" onclick={() => searchQuery = ''}>
								Clear Search
							</button>
						{:else}
							<h2>No enemies yet?</h2>
							<p>Lucky you. Or maybe you're just in denial.</p>
							<button class="btn btn-primary" onclick={() => showAddForm = true}>
								<Plus size={18} />
								Add Your First Enemy
							</button>
						{/if}
					</div>
				{:else}
					{#each filteredEnemies() as enemy, index (enemy.id)}
						{@const pos = enemy.position_x !== null ? { x: enemy.position_x, y: enemy.position_y } : getRandomPosition(index)}
						{@const pfpUrl = getTwitterPfp(enemy.twitter_handle)}
						<div 
							class="sticky-note"
							style="left: {pos.x}px; top: {pos.y}px;"
							onmousedown={(e) => handleDragStart(e, enemy)}
							ontouchstart={(e) => handleDragStart(e, enemy)}
							role="button"
							tabindex="0"
						>
							<div class="sticky-header">
								{#if pfpUrl}
									<img 
										src={pfpUrl} 
										alt="{enemy.name}'s avatar"
										class="sticky-avatar"
										onerror={(e) => {
											(e.target as HTMLImageElement).style.display = 'none';
										}}
									/>
								{/if}
								<span class="sticky-name">{enemy.name}</span>
								<button 
									class="sticky-delete"
									onclick={(e) => { e.stopPropagation(); handleDeleteEnemy(enemy.id); }}
									aria-label="Delete"
								>
									<X size={14} />
								</button>
							</div>
							{#if enemy.nickname}
								<p class="sticky-nickname">"{enemy.nickname}"</p>
							{/if}
							{#if enemy.twitter_handle}
								<a 
									href="https://twitter.com/{enemy.twitter_handle}" 
									target="_blank" 
									rel="noopener"
									class="sticky-twitter"
									onclick={(e) => e.stopPropagation()}
								>
									<Twitter size={12} />
									@{enemy.twitter_handle}
								</a>
							{/if}
							<div class="sticky-count">
								{enemy.grievance_count} {enemy.grievance_count === 1 ? 'reason' : 'reasons'}
							</div>
							{#if enemy.grievances.length > 0}
								<div class="sticky-preview">
									{enemy.grievances[0].reason.slice(0, 50)}{enemy.grievances[0].reason.length > 50 ? '...' : ''}
								</div>
							{/if}
						</div>
					{/each}
				{/if}
			</div>
		{/if}
	</div>

	<footer class="footer">
		<div class="footer-links">
			<a href="/about">About</a>
			<a href="https://twitter.com/YOUR_HANDLE" target="_blank" rel="noopener">
				<Twitter size={16} />
				Twitter
			</a>
			<a href="https://slopcel.com" target="_blank" rel="noopener">Slopcel</a>
		</div>
		<p class="footer-tagline">Keep your enemies closer. In a database.</p>
	</footer>
</main>

<style>
	.dashboard {
		min-height: 100vh;
		padding: 1rem 0;
		background: var(--bg-primary);
		display: flex;
		flex-direction: column;
	}

	.dashboard.whiteboard-mode {
		overflow: hidden;
	}

	.dashboard-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--border);
		flex-wrap: wrap;
		gap: 1rem;
	}

	.header-left {
		min-width: 0;
	}

	.logo-link {
		text-decoration: none;
		color: inherit;
	}

	.dashboard-header h1 {
		font-size: 1.5rem;
		margin-bottom: 0.125rem;
	}

	.tagline {
		color: var(--text-muted);
		font-size: 0.875rem;
		font-style: italic;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.view-toggle {
		display: flex;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 2px;
	}

	.view-btn {
		padding: 0.5rem;
		background: none;
		border: none;
		cursor: pointer;
		border-radius: 4px;
		color: var(--text-muted);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.view-btn:hover {
		color: var(--text-primary);
	}

	.view-btn.active {
		background: var(--bg-card);
		color: var(--accent);
		box-shadow: var(--shadow-sm);
	}

	/* Search */
	.search-container {
		margin-bottom: 1rem;
	}

	.search-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-wrapper :global(.search-icon) {
		position: absolute;
		left: 0.875rem;
		color: var(--text-muted);
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding: 0.75rem 2.5rem 0.75rem 2.75rem;
		font-size: 0.9375rem;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg-card);
		color: var(--text-primary);
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.search-input::placeholder {
		color: var(--text-muted);
	}

	.search-input:focus {
		outline: none;
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-soft);
	}

	.search-clear {
		position: absolute;
		right: 0.75rem;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--text-muted);
		padding: 0.25rem;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.search-clear:hover {
		color: var(--text-primary);
		background: var(--bg-secondary);
	}

	.local-notice {
		background: var(--accent-soft);
		border: 1px solid var(--accent);
		border-radius: 6px;
		padding: 0.625rem 1rem;
		margin-bottom: 1rem;
		font-size: 0.8125rem;
		color: var(--text-secondary);
	}

	.local-notice a {
		color: var(--accent);
		font-weight: 600;
	}

	.local-notice a:hover {
		text-decoration: underline;
	}

	/* Add Form */
	.add-form-container {
		margin-bottom: 1rem;
	}

	.add-form {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 1.25rem;
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

	.form-group .label {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
	}

	/* Twitter link */
	.twitter-link {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.75rem;
		color: #1da1f2;
		margin-top: 0.25rem;
	}

	.twitter-link:hover {
		text-decoration: underline;
	}

	/* Tweet embed */
	.tweet-embed {
		margin-bottom: 1rem;
		padding: 1rem;
		background: var(--bg-card);
		border-radius: 8px;
		border: 1px solid var(--border);
	}

	.tweet-link {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.8125rem;
		color: #1da1f2;
		margin-top: 0.5rem;
	}

	.grievance-content {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
		min-width: 0;
	}

	.grievance-content span {
		word-break: break-word;
	}

	.grievance-tweet-link {
		color: #1da1f2;
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.grievance-tweet-link:hover {
		opacity: 0.8;
	}

	.input-small {
		margin-top: 0.5rem;
		font-size: 0.8125rem;
	}

	/* Empty State */
	.empty-state {
		text-align: center;
		padding: 3rem 1.5rem;
		background: var(--bg-card);
		border: 1px dashed var(--border);
		border-radius: 8px;
	}

	.empty-icon {
		color: var(--text-muted);
		margin-bottom: 1rem;
	}

	.empty-state h2 {
		font-size: 1.25rem;
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
		gap: 0.75rem;
		flex: 1;
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
		padding: 0.875rem 1rem;
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
		gap: 0.75rem;
		color: var(--text-primary);
	}

	.enemy-header:hover {
		background: var(--bg-secondary);
	}

	.enemy-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		min-width: 0;
		flex: 1;
	}

	.enemy-avatar,
	.enemy-avatar-img {
		width: 40px;
		height: 40px;
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
		font-size: 1rem;
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
		font-size: 0.9375rem;
		font-weight: 600;
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		color: var(--text-primary);
	}

	.enemy-nickname {
		font-size: 0.75rem;
		color: var(--text-secondary);
		font-style: italic;
		margin: 0.125rem 0 0 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.enemy-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--text-secondary);
		flex-shrink: 0;
	}

	.grievance-count {
		font-size: 0.75rem;
		font-weight: 500;
		background: var(--accent-soft);
		color: var(--accent);
		padding: 0.25rem 0.5rem;
		border-radius: 100px;
		white-space: nowrap;
	}

	/* Expanded Section */
	.enemy-expanded {
		padding: 1rem;
		border-top: 1px solid var(--border);
		background: var(--bg-secondary);
	}

	.grievances-section h4 {
		font-size: 0.75rem;
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
		padding: 0.625rem 0.875rem;
		border-radius: 6px;
		font-size: 0.8125rem;
		border: 1px solid var(--border-subtle);
		gap: 0.5rem;
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
		flex-shrink: 0;
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
		min-width: 0;
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
	.whiteboard-container {
		flex: 1;
		min-height: 500px;
		position: relative;
		background: 
			linear-gradient(90deg, #e5e5e5 1px, transparent 1px),
			linear-gradient(#e5e5e5 1px, transparent 1px);
		background-size: 20px 20px;
		background-color: #f5f5f5;
		border: 1px solid var(--border);
		border-radius: 8px;
		overflow: auto;
		-webkit-overflow-scrolling: touch;
	}

	.whiteboard-container.dragging {
		cursor: grabbing;
	}

	.whiteboard-empty {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: white;
		border: 1px solid var(--border);
		border-radius: 8px;
		width: calc(100% - 2rem);
		max-width: 320px;
	}

	.sticky-note {
		position: absolute;
		width: 180px;
		min-height: 100px;
		padding: 0.875rem;
		border-radius: 4px;
		background: white;
		box-shadow: 0 2px 8px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08);
		cursor: grab;
		user-select: none;
		transition: transform 0.1s ease, box-shadow 0.1s ease;
		border: 1px solid var(--border);
		touch-action: none;
	}

	.sticky-note:hover {
		transform: scale(1.02) rotate(-0.5deg);
		box-shadow: 0 4px 16px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.1);
	}

	.sticky-note:active {
		cursor: grabbing;
		transform: scale(1.04);
		box-shadow: 0 8px 24px rgba(0,0,0,0.18);
		z-index: 10;
	}

	.sticky-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.sticky-avatar {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		object-fit: cover;
		border: 1px solid var(--border);
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
		cursor: pointer;
		padding: 2px;
		color: var(--text-muted);
		opacity: 0.5;
		transition: opacity 0.2s;
		flex-shrink: 0;
	}

	.sticky-delete:hover {
		opacity: 1;
		color: var(--error);
	}

	.sticky-nickname {
		font-size: 0.7rem;
		color: var(--text-secondary);
		font-style: italic;
		margin: 0 0 0.375rem 0;
	}

	.sticky-twitter {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.65rem;
		color: #1da1f2;
		margin-bottom: 0.375rem;
	}

	.sticky-count {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--accent);
		background: var(--accent-soft);
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
		display: inline-block;
		margin-bottom: 0.375rem;
	}

	.sticky-preview {
		font-size: 0.65rem;
		color: var(--text-secondary);
		line-height: 1.4;
		border-top: 1px dashed var(--border);
		padding-top: 0.375rem;
		margin-top: 0.25rem;
	}

	/* Footer */
	.footer {
		margin-top: auto;
		padding: 1.5rem 1rem;
		text-align: center;
		border-top: 1px solid var(--border);
	}

	.footer-links {
		display: flex;
		justify-content: center;
		gap: 1.25rem;
		margin-bottom: 0.75rem;
		flex-wrap: wrap;
	}

	.footer-links a {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		color: var(--text-secondary);
		font-size: 0.8125rem;
		font-weight: 500;
	}

	.footer-links a:hover {
		color: var(--accent);
	}

	.footer-tagline {
		color: var(--text-muted);
		font-size: 0.75rem;
	}

	/* Spinner */
	.spinner-small {
		width: 16px;
		height: 16px;
		border: 2px solid currentColor;
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Responsive */
	@media (max-width: 768px) {
		.dashboard {
			padding: 0.75rem 0;
		}

		.dashboard-header {
			flex-direction: column;
			align-items: stretch;
			text-align: center;
			gap: 0.75rem;
		}

		.header-left {
			text-align: center;
		}

		.dashboard-header h1 {
			font-size: 1.375rem;
		}

		.header-actions {
			justify-content: center;
		}

		.btn-add .btn-text,
		.btn-sync .btn-text {
			display: none;
		}

		.btn-add,
		.btn-sync {
			padding: 0.625rem;
		}

		.form-row {
			grid-template-columns: 1fr;
		}

		.form-actions {
			flex-direction: column;
		}

		.form-actions .btn {
			width: 100%;
		}

		.enemy-header {
			padding: 0.75rem;
		}

		.enemy-info {
			gap: 0.625rem;
		}

		.enemy-avatar,
		.enemy-avatar-img {
			width: 36px;
			height: 36px;
		}

		.enemy-meta {
			gap: 0.375rem;
		}

		.grievance-count {
			font-size: 0.6875rem;
			padding: 0.125rem 0.375rem;
		}

		.enemy-expanded {
			padding: 0.875rem;
		}

		.grievance-item {
			padding: 0.5rem 0.625rem;
			font-size: 0.75rem;
		}

		.grievance-input-row {
			flex-direction: column;
		}

		.grievance-input-row .btn {
			width: 100%;
		}

		.whiteboard-container {
			min-height: 400px;
		}

		.sticky-note {
			width: 150px;
			min-height: 80px;
			padding: 0.625rem;
		}

		.sticky-avatar {
			width: 24px;
			height: 24px;
		}

		.sticky-name {
			font-size: 0.8125rem;
		}

		.footer {
			padding: 1rem;
		}

		.footer-links {
			gap: 1rem;
		}
	}

	@media (max-width: 480px) {
		.search-input {
			font-size: 0.875rem;
			padding: 0.625rem 2.25rem 0.625rem 2.5rem;
		}

		.local-notice {
			font-size: 0.75rem;
			padding: 0.5rem 0.75rem;
		}

		.empty-state {
			padding: 2rem 1rem;
		}

		.empty-state h2 {
			font-size: 1.125rem;
		}
	}
</style>
