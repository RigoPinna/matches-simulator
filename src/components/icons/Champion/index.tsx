import champion from '../../../assets/champion.png';

interface IChampion {
	className?: string;
}
export const Champion = ({ className = '' }: IChampion) => {
	return <img className={className} src={champion} />;
};
