import type { Fish } from '../types';

interface Props {
  fish: Fish;
  onClick?: () => void;
}

export function FishCard({ fish, onClick }: Props) {
  return (
    <div className={`fish-card ${onClick ? 'fish-card--clickable' : ''}`} onClick={onClick}>
      <div className="fish-card-image">{fish.emoji ?? '🐟'}</div>
      <p className="fish-card-name">{fish.name}</p>
    </div>
  );
}
