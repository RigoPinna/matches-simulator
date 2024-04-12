import { IItemTable, ITeamMatch, TJourney } from '../store';
import { TWinner, getWinner } from './getWinner';

const updateWinner = (club: ITeamMatch, table: IItemTable[]): IItemTable => {
	const currentClub = table.find(item => item.club.uuid === club.uuid) as IItemTable;
	const wgf = currentClub.gf + club.score;
	const wga = currentClub.ga + club.score;
	return {
		club: {
			image: club.image,
			name: club.name,
			uuid: club.uuid,
		},
		mg: currentClub.mg + 1,
		mw: currentClub.mw + 1,
		md: currentClub.md,
		ml: currentClub.ml,
		pts: currentClub.pts + 3,
		gf: wgf,
		ga: wga,
		gd: wgf - wga,
	};
};
const updateLoser = (club: ITeamMatch, table: IItemTable[]): IItemTable => {
	const currentClub = table.find(item => item.club.uuid === club.uuid) as IItemTable;
	const wgf = currentClub.gf + club.score;
	const wga = currentClub.ga + club.score;
	return {
		club: {
			image: club.image,
			name: club.name,
			uuid: club.uuid,
		},
		mg: currentClub.mg + 1,
		mw: currentClub.mw,
		md: currentClub.md,
		ml: currentClub.ml + 1,
		pts: currentClub.pts,
		gf: wgf,
		ga: wga,
		gd: wgf - wga,
	};
};
const updateDraw = (club: ITeamMatch, table: IItemTable[]): IItemTable => {
	const currentClub = table.find(item => item.club.uuid === club.uuid) as IItemTable;
	const wgf = currentClub.gf + club.score;
	const wga = currentClub.ga + club.score;
	return {
		club: {
			image: club.image,
			name: club.name,
			uuid: club.uuid,
		},
		mg: currentClub.mg + 1,
		mw: currentClub.mw,
		md: currentClub.md + 1,
		ml: currentClub.ml,
		pts: currentClub.pts + 1,
		gf: wgf,
		ga: wga,
		gd: wgf - wga,
	};
};

const updateClubs = ({ type, winner, loser }: TWinner, table: IItemTable[]): IItemTable[] => {
	switch (type) {
		case 'LOCAL': {
			const local = updateWinner(winner, table);
			const visit = updateLoser(loser, table);
			return [local, visit];
		}
		case 'VISITOR': {
			const local = updateWinner(winner, table);
			const visit = updateLoser(loser, table);
			return [local, visit];
		}

		default: {
			const local = updateDraw(winner, table);
			const visit = updateDraw(loser, table);
			return [local, visit];
		}
	}
};

/**
 * The function `orderTable` takes in an array of items and a journey, updates the items based on match
 * results, and then sorts the items by points and goal difference.
 * @param {IItemTable[]} table - The `table` parameter is an array of objects of type `IItemTable`,
 * which likely contains information about different clubs or teams in a sports league, such as their
 * points, goal difference, etc.
 * @param {TJourney} journey - The `journey` parameter is of type `TJourney`, which seems to represent
 * a collection of matches or games. The function iterates over each match in `matches.value` and
 * processes the results to update the clubs' standings in the table.
 * @returns The function `orderTable` is returning a sorted array of `IItemTable` objects based on the
 * points (`pts`) and goal difference (`gd`) properties of each object.
 */
export const orderTable = (table: IItemTable[], journey: TJourney) => {
	const matches = journey.value;
	let newTable = [...table];
	for (const match of matches) {
		const result = getWinner(match);
		const clubs = updateClubs(result, newTable);

		newTable = newTable.map(current => {
			const club = clubs.find(item => item.club.uuid === current.club.uuid);
			return club || current;
		});
	}
	return newTable.sort((a, b) => b.pts - a.pts);
};
