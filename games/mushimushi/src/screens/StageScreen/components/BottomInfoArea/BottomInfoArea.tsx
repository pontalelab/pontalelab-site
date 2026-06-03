import styles from './BottomInfoArea.module.css'

interface Props {
  runCaptures: string[]
}

export function BottomInfoArea({ runCaptures }: Props) {
  const base = import.meta.env.BASE_URL
  return (
    <div className={styles.area}>
      {runCaptures.map((bugId, i) => (
        <img
          key={i}
          className={styles.icon}
          src={`${base}bugs/${bugId}.png`}
          alt={bugId}
          draggable={false}
        />
      ))}
    </div>
  )
}
