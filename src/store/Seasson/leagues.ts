import type { IClub } from './SeassonContext';

/**
 * Leagues that run in parallel every season. PRIMERA / PLATE are the
 * Mexican first and second division (with promotion/relegation between
 * them); the other three are international leagues that are always fully
 * simulated in the background and only feed the World Cup.
 */
export const INTL_LEAGUES = ['ESP_ENG', 'BRA_ARG', 'GER_USA'] as const;
export type TIntlLeague = (typeof INTL_LEAGUES)[number];
export type TLeague = 'PRIMERA' | 'PLATE' | TIntlLeague;

/** Leagues whose top 4 (summed over a World Cup cycle) qualify for the World Cup. */
export const WORLD_CUP_LEAGUES: TLeague[] = ['PRIMERA', ...INTL_LEAGUES];

/** A World Cup is played after every this many seasons. */
export const SEASONS_PER_WORLD_CUP = 4;
/** Clubs each league sends to the World Cup. */
export const QUALIFIERS_PER_LEAGUE = 4;

export const LEAGUE_INFO: Record<TLeague, { name: string; short: string }> = {
	PRIMERA: { name: 'Primera División', short: 'Primera' },
	PLATE: { name: 'Plate Ligue', short: 'Plate' },
	ESP_ENG: { name: 'Spain & England', short: 'ESP/ENG' },
	BRA_ARG: { name: 'Brazil & Argentina', short: 'BRA/ARG' },
	GER_USA: { name: 'Germany & USA', short: 'GER/USA' },
};

export const isIntlLeague = (league: TLeague): league is TIntlLeague =>
	(INTL_LEAGUES as readonly string[]).includes(league);

/**
 * International leagues can be browsed but never played by hand: they only
 * advance when the user's own league advances.
 */
export const isReadOnlyLeague = isIntlLeague;

/**
 * International clubs. They have no logo yet: `ClubBadge`/`ItemClub` fall
 * back to an initials badge in the club color. To add a logo, put the PNG in
 * src/assets, import it here and set `image` — old saves pick it up
 * automatically on the next load (see sanitizeSeasonImages).
 */
export const intlClubsDefaults: Record<TIntlLeague, IClub[]> = {
	ESP_ENG: [
		{ uuid: 'esp-1', name: 'Real Madrid', color: '#D4AF37' },
		{ uuid: 'esp-2', name: 'Barcelona', color: '#A50044' },
		{ uuid: 'esp-3', name: 'Atlético de Madrid', color: '#CB3524' },
		{ uuid: 'esp-4', name: 'Athletic Club', color: '#EE2523' },
		{ uuid: 'eng-1', name: 'Manchester City', color: '#6CABDD' },
		{ uuid: 'eng-2', name: 'Liverpool', color: '#C8102E' },
		{ uuid: 'eng-3', name: 'Arsenal', color: '#EF0107' },
		{ uuid: 'eng-4', name: 'Chelsea', color: '#034694' },
	],
	BRA_ARG: [
		{ uuid: 'bra-1', name: 'Flamengo', color: '#C3281E' },
		{ uuid: 'bra-2', name: 'Palmeiras', color: '#006437' },
		{ uuid: 'bra-3', name: 'São Paulo', color: '#E30613' },
		{ uuid: 'bra-4', name: 'Corinthians', color: '#5A5A5A' },
		{ uuid: 'arg-1', name: 'River Plate', color: '#EB192E' },
		{ uuid: 'arg-2', name: 'Boca Juniors', color: '#103F79' },
		{ uuid: 'arg-3', name: 'Racing Club', color: '#75AADB' },
		{ uuid: 'arg-4', name: 'Estudiantes', color: '#D50032' },
	],
	GER_USA: [
		{ uuid: 'ger-1', name: 'Bayern Munich', color: '#DC052D' },
		{ uuid: 'ger-2', name: 'Borussia Dortmund', color: '#E5C700' },
		{ uuid: 'ger-3', name: 'Bayer Leverkusen', color: '#E32221' },
		{ uuid: 'ger-4', name: 'RB Leipzig', color: '#DD0741' },
		{ uuid: 'usa-1', name: 'LAFC', color: '#C39E6D' },
		{ uuid: 'usa-2', name: 'Inter Miami', color: '#F7B5CD' },
		{ uuid: 'usa-3', name: 'LA Galaxy', color: '#00245D' },
		{ uuid: 'usa-4', name: 'Columbus Crew', color: '#D4C400' },
	],
};
