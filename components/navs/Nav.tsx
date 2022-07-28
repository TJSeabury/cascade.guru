import Link from "next/link"
import styles from "../header.module.css"

export default function Nav() {
  return (
    <nav>
      <ul className={styles.navItems}>
        <li className={styles.navItem}>
          <Link href="/">
            <a>Home</a>
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/dashboard">
            <a>Dashboard</a>
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/admin">
            <a>Users</a>
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/me">
            <a>Profile</a>
          </Link>
        </li>
      </ul>
    </nav>
  )
}
