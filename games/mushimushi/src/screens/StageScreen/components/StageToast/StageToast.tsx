import styles from './StageToast.module.css'

interface Props {
  message: string
  visible: boolean
}

export function StageToast({ message, visible }: Props) {
  if (!visible || !message) return null

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      {message}
    </div>
  )
}
