import { TWorldCupStage } from '../../store';

export const STAGE_LABEL: Record<TWorldCupStage, string> = {
	GROUP_DRAW: 'Group draw',
	GROUPS: 'Group stage',
	KNOCKOUT_DRAW: 'Quarterfinal draw',
	QUARTERS: 'Quarterfinals',
	SEMIS: 'Semifinals',
	FINAL: 'Final',
	FINISHED: 'Finished',
};
