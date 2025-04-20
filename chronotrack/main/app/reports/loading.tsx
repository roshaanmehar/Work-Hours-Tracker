import styles from "./loading.module.css"

export default function Loading() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.pixelLoader}>
        <div className={styles.pixelLoaderInner}></div>
      </div>
      <p>Loading reports...</p>
    </div>
  )
}
