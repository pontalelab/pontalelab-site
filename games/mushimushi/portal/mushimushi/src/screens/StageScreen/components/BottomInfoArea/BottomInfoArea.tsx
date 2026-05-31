import type { TimeOfDay } from '../../../../types'
import styles from './BottomInfoArea.module.css'

interface Props {
  stageName: string
  timeOfDay: string
  timeOfDayKey: TimeOfDay
  ambientText: string
  captureCount: number
  capturesPerStage: number
}

export function BottomInfoArea({ stageName, timeOfDay, timeOfDayKey, ambientText, captureCount, capturesPerStage }: Props) {
  return (
    <div className={styles.area} data-time={timeOfDayKey}>
      <div className={styles.stageLabel}>
        <span className={styles.stageName}>{stageName}</span>
        <span className={styles.separator}>・</span>
        <span className={styles.timeOfDay}>{timeOfDay}</span>
        <div className={styles.dots}>
          {Array.from({ length: capturesPerStage }).map((_, i) => (
            <span
              key={i}
              className={`${styles.dot} ${i < captureCount ? styles.dotFilled : ''}`}
            />
          ))}
        </div>
      </div>
      <p className={styles.ambientText}>{ambientText}</p>
    </div>
  )
}
