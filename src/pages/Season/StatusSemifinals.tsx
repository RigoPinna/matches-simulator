import { MatchList } from '../../components/ui';
import { useCurrentSeasonParams } from '../../hooks';

export const StatusSemifinals = () => {
	const season = useCurrentSeasonParams();
	const semifinals = season?.fase.semifinal;
	switch (semifinals?.status) {
		case 'ACTIVE':
			return (
				<>
					{semifinals.matches.matches.map((journey, i) => (
						<MatchList
							type='SEMI'
							key={`jy=${journey.jid}`}
							title={`Semifinals`}
							matches={journey}
							isCurrent={semifinals.currentJourney === i + 1}
						/>
					))}
				</>
			);

		default:
			return (
				<>
					{semifinals?.matches.matches.map((journey, i) => (
						<MatchList
							type='SEMI'
							key={`jy=${journey.jid}`}
							title={`Semifinals`}
							matches={journey}
							isCurrent={semifinals?.currentJourney === i + 1}
						/>
					))}
				</>
			);
	}
};
