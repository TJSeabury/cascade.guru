import { signIn, signOut, useSession } from "next-auth/react"
import styles from "../header.module.css"
import NotSignedIn from "./UserMetaNav.NotSignedIn"
import SignedIn from "./UserMetaNav.SignedIn"

export default function UserMetaNav() {
  const { data: session, status } = useSession()
  const loading = status === "loading"

  return (
    <div className={styles.signedInStatus}>
      <p
        className={`nojs-show ${
          !session && loading ? styles.loading : styles.loaded
        }`}
      >
        {!session && <NotSignedIn signIn={signIn} />}
        {session && <SignedIn session={session} signOut={signOut} />}
      </p>
    </div>
  )
}
