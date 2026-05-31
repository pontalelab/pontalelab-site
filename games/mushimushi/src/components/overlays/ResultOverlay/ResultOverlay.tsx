import styles from './ResultOverlay.module.css'

interface Props {
  onClose: () => void
}

export function ResultOverlay({ onClose }: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <h3 className={styles.title}>捕獲！</h3>
        {/* TODO Phase 4: 捕獲した虫のdetailをここに表示 */}
        <div className={styles.body}>
          <p className={styles.placeholder}>捕獲結果（Phase 4で実装）</p>
        </div>
        <button className={styles.continueBtn} onClick={onClose}>
          つづける
        </button>
      </div>
    </div>
  )
}
