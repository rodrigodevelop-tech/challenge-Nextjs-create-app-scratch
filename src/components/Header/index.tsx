import styles from './header.module.scss';

export default function Header() {
  return(
    <header className={styles.Headercontainer}>
      <div className={styles.Headercontent}>
        <img src="/images/Logo.svg" alt="Logo" />
      </div>
    </header>
  )
}
