import { useUiStore } from '../../stores/uiStore';
import styles from './Toast.module.css';

export function ToastContainer() {
  const toasts = useUiStore((s) => s.toasts);

  return (
    <div className={styles.container}>
      {toasts.map((t) => (
        <div key={t.id} className={`${styles.toast} ${t.isNew ? styles.newBug : ''}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
