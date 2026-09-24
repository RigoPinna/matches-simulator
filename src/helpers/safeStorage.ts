/**
 * Season/match history grows without bound (every journey snapshot keeps a
 * full copy of each club, images included) and localStorage quotas are
 * small and vary a lot by browser (Safari is ~5MB). Writing past quota
 * throws synchronously and, with no error boundary in this app, blanks the
 * whole page. This keeps that failure from taking the app down: gameplay
 * keeps working in memory even if history can no longer be persisted.
 */
export const safeSetItem = (key: string, value: string): boolean => {
	try {
		localStorage.setItem(key, value);
		return true;
	} catch (error) {
		console.warn(
			`[matches-simulator] Could not save "${key}" to localStorage (quota likely exceeded). ` +
				'Progress will keep working for this session but won\'t be saved.',
			error,
		);
		return false;
	}
};
