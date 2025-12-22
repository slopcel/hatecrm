import { browser } from '$app/environment';

export interface LocalEnemy {
	id: string;
	name: string;
	nickname: string | null;
	twitter_handle: string | null;
	tweet_url: string | null;
	created_at: string;
	// Position for whiteboard view
	position_x: number | null;
	position_y: number | null;
}

export interface LocalGrievance {
	id: string;
	enemy_id: string;
	reason: string;
	tweet_url: string | null;
	created_at: string;
}

export interface LocalEnemyWithGrievances extends LocalEnemy {
	grievances: LocalGrievance[];
	grievance_count: number;
}

const ENEMIES_KEY = 'hatecrm_enemies';
const GRIEVANCES_KEY = 'hatecrm_grievances';

function generateId(): string {
	return crypto.randomUUID();
}

function getStoredEnemies(): LocalEnemy[] {
	if (!browser) return [];
	const stored = localStorage.getItem(ENEMIES_KEY);
	return stored ? JSON.parse(stored) : [];
}

function getStoredGrievances(): LocalGrievance[] {
	if (!browser) return [];
	const stored = localStorage.getItem(GRIEVANCES_KEY);
	return stored ? JSON.parse(stored) : [];
}

function saveEnemies(enemies: LocalEnemy[]): void {
	if (!browser) return;
	localStorage.setItem(ENEMIES_KEY, JSON.stringify(enemies));
}

function saveGrievances(grievances: LocalGrievance[]): void {
	if (!browser) return;
	localStorage.setItem(GRIEVANCES_KEY, JSON.stringify(grievances));
}

export function getEnemiesWithGrievances(): LocalEnemyWithGrievances[] {
	const enemies = getStoredEnemies();
	const grievances = getStoredGrievances();

	return enemies
		.map((enemy) => {
			const enemyGrievances = grievances.filter((g) => g.enemy_id === enemy.id);
			return {
				...enemy,
				grievances: enemyGrievances,
				grievance_count: enemyGrievances.length
			};
		})
		.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function addEnemy(
	name: string, 
	nickname: string | null,
	twitter_handle: string | null = null,
	tweet_url: string | null = null
): LocalEnemy {
	const enemies = getStoredEnemies();
	const newEnemy: LocalEnemy = {
		id: generateId(),
		name,
		nickname,
		twitter_handle,
		tweet_url,
		created_at: new Date().toISOString(),
		position_x: null,
		position_y: null
	};
	enemies.push(newEnemy);
	saveEnemies(enemies);
	return newEnemy;
}

export function updateEnemyPosition(enemyId: string, x: number, y: number): void {
	const enemies = getStoredEnemies();
	const enemy = enemies.find((e) => e.id === enemyId);
	if (enemy) {
		enemy.position_x = x;
		enemy.position_y = y;
		saveEnemies(enemies);
	}
}

export function deleteEnemy(enemyId: string): void {
	const enemies = getStoredEnemies().filter((e) => e.id !== enemyId);
	const grievances = getStoredGrievances().filter((g) => g.enemy_id !== enemyId);
	saveEnemies(enemies);
	saveGrievances(grievances);
}

export function addGrievance(enemyId: string, reason: string, tweet_url: string | null = null): LocalGrievance {
	const grievances = getStoredGrievances();
	const newGrievance: LocalGrievance = {
		id: generateId(),
		enemy_id: enemyId,
		reason,
		tweet_url,
		created_at: new Date().toISOString()
	};
	grievances.push(newGrievance);
	saveGrievances(grievances);
	return newGrievance;
}

export function deleteGrievance(grievanceId: string): void {
	const grievances = getStoredGrievances().filter((g) => g.id !== grievanceId);
	saveGrievances(grievances);
}

export function clearAllData(): void {
	if (!browser) return;
	localStorage.removeItem(ENEMIES_KEY);
	localStorage.removeItem(GRIEVANCES_KEY);
}

export function getAllDataForSync(): { enemies: LocalEnemy[]; grievances: LocalGrievance[] } {
	return {
		enemies: getStoredEnemies(),
		grievances: getStoredGrievances()
	};
}

export function hasLocalData(): boolean {
	if (!browser) return false;
	const enemies = getStoredEnemies();
	return enemies.length > 0;
}

// Helper to extract tweet ID from URL
export function extractTweetId(url: string): string | null {
	const match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
	return match ? match[1] : null;
}

// Helper to clean twitter handle (remove @ if present)
export function cleanTwitterHandle(handle: string): string {
	return handle.replace(/^@/, '').trim();
}
