import styles from './header.module.scss';
import Link from 'next/dist/client/link';

export default function Header() {
  return(
    <header className={styles.Headercontainer}>
      <div className={styles.Headercontent}>
        <Link href="/">
          <a>
            <img src="/images/Logo.svg" alt="logo" />
          </a>
        </Link>
      </div>
    </header>
  )
}
