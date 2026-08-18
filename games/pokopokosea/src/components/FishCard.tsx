import type { Fish } from '../types';

interface Props {
  fish: Fish;
  onClick?: () => void;
}

export function FishCard({ fish, onClick }: Props) {
  return (
    <div className={`fish-card ${onClick ? 'fish-card--clickable' : ''}`} onClick={onClick}>
      <img className="fish-card-image" src={`${import.meta.env.BASE_URL}${fish.image}`} alt={fish.name} />
      <p className="fish-card-name">{fish.name}</p>
    </div>
  );
}
