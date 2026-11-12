import type { IClub } from './SeassonContext';
import realMadrid from '../../assets/clubs/real-madrid.png';
import barcelona from '../../assets/clubs/barcelona.png';
import atleticoMadrid from '../../assets/clubs/atletico-madrid.png';
import athleticClub from '../../assets/clubs/athletic-club.png';
import manchesterCity from '../../assets/clubs/manchester-city.png';
import liverpool from '../../assets/clubs/liverpool.png';
import arsenal from '../../assets/clubs/arsenal.png';
import chelsea from '../../assets/clubs/chelsea.png';
import flamengo from '../../assets/clubs/flamengo.png';
import palmeiras from '../../assets/clubs/palmeiras.png';
import saoPaulo from '../../assets/clubs/sao-paulo.png';
import corinthians from '../../assets/clubs/corinthians.png';
import riverPlate from '../../assets/clubs/river-plate.png';
import bocaJuniors from '../../assets/clubs/boca-juniors.png';
import racing from '../../assets/clubs/racing.png';
import estudiantes from '../../assets/clubs/estudiantes.png';
import bayernMunich from '../../assets/clubs/bayern-munich.png';
import borussiaDortmund from '../../assets/clubs/borussia-dortmund.png';
import bayerLeverkusen from '../../assets/clubs/bayer-leverkusen.png';
import rbLeipzig from '../../assets/clubs/rb-leipzig.png';
import lafc from '../../assets/clubs/lafc.png';
import interMiami from '../../assets/clubs/inter-miami.png';
import laGalaxy from '../../assets/clubs/la-galaxy.png';
import columbusCrew from '../../assets/clubs/columbus-crew.png';

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
 * International clubs. Logos live in src/assets/clubs (256x256, transparent
 * background). Changing a logo is enough: old saves pick it up automatically
 * on the next load (see sanitizeSeasonImages).
 */
export const intlClubsDefaults: Record<TIntlLeague, IClub[]> = {
	ESP_ENG: [
		{ uuid: 'esp-1', name: 'Real Madrid', image: realMadrid, color: '#D4AF37' },
		{ uuid: 'esp-2', name: 'Barcelona', image: barcelona, color: '#A50044' },
		{ uuid: 'esp-3', name: 'Atlético de Madrid', image: atleticoMadrid, color: '#CB3524' },
		{ uuid: 'esp-4', name: 'Athletic Club', image: athleticClub, color: '#EE2523' },
		{ uuid: 'eng-1', name: 'Manchester City', image: manchesterCity, color: '#6CABDD' },
		{ uuid: 'eng-2', name: 'Liverpool', image: liverpool, color: '#C8102E' },
		{ uuid: 'eng-3', name: 'Arsenal', image: arsenal, color: '#EF0107' },
		{ uuid: 'eng-4', name: 'Chelsea', image: chelsea, color: '#034694' },
	],
	BRA_ARG: [
		{ uuid: 'bra-1', name: 'Flamengo', image: flamengo, color: '#C3281E' },
		{ uuid: 'bra-2', name: 'Palmeiras', image: palmeiras, color: '#006437' },
		{ uuid: 'bra-3', name: 'São Paulo', image: saoPaulo, color: '#E30613' },
		{ uuid: 'bra-4', name: 'Corinthians', image: corinthians, color: '#5A5A5A' },
		{ uuid: 'arg-1', name: 'River Plate', image: riverPlate, color: '#EB192E' },
		{ uuid: 'arg-2', name: 'Boca Juniors', image: bocaJuniors, color: '#103F79' },
		{ uuid: 'arg-3', name: 'Racing Club', image: racing, color: '#75AADB' },
		{ uuid: 'arg-4', name: 'Estudiantes', image: estudiantes, color: '#D50032' },
	],
	GER_USA: [
		{ uuid: 'ger-1', name: 'Bayern Munich', image: bayernMunich, color: '#DC052D' },
		{ uuid: 'ger-2', name: 'Borussia Dortmund', image: borussiaDortmund, color: '#E5C700' },
		{ uuid: 'ger-3', name: 'Bayer Leverkusen', image: bayerLeverkusen, color: '#E32221' },
		{ uuid: 'ger-4', name: 'RB Leipzig', image: rbLeipzig, color: '#DD0741' },
		{ uuid: 'usa-1', name: 'LAFC', image: lafc, color: '#C39E6D' },
		{ uuid: 'usa-2', name: 'Inter Miami', image: interMiami, color: '#F7B5CD' },
		{ uuid: 'usa-3', name: 'LA Galaxy', image: laGalaxy, color: '#00245D' },
		{ uuid: 'usa-4', name: 'Columbus Crew', image: columbusCrew, color: '#D4C400' },
	],
};
