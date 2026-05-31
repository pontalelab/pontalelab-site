import styles from './SettingsOverlay.module.css'

interface Props {
  onClose: () => void
}

export function SettingsOverlay({ onClose }: Props) {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>設定</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="閉じる">
            ✕
          </button>
        </div>
        {/* TODO Phase 6: サウンド・データリセット等の設定項目を追加 */}
        <div className={styles.body}>
          <p className={styles.placeholder}>設定（Phase 6で実装）</p>
        </div>
      </div>
    </div>
  )
}
