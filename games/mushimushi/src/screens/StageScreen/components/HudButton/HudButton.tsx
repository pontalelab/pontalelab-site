import styles from './HudButton.module.css'

interface Props {
  icon: string
  label: string
  onClick: () => void
}

export function HudButton({ icon, label, onClick }: Props) {
  return (
    <button
      className={styles.button}
      onClick={onClick}
      aria-label={label}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  )
}
