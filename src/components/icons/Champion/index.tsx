import champion from '../../../assets/champion.png';
import supercup from '../../../assets/supercup.png';

interface IChampion {
	className?: string;
	type: 'league' | 'supercup';
}
export const Champion = ({ className = '', type }: IChampion) => {
	return <img className={className} src={type === 'league' ? champion : supercup} />;
};
