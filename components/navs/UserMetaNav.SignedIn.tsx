import { Session } from "next-auth"
import Button from "../buttons/Button"
import styles from "../header.module.css"

export default function SignedIn({
  session,
  signOut,
}: {
  session: Session
  signOut: () => {}
}) {
  if (!session?.user) return <></>
  return (
    <>
      {session.user.image && (
        <span
          style={{ backgroundImage: `url('${session.user.image}')` }}
          className={styles.avatar}
        />
      )}
      <span className={styles.signedInText}>
        <small>Signed in as</small>
        <br />
        <strong>{session.user.email ?? session.user.name}</strong>
      </span>
      <Button
        buttonText="Sign out"
        href={`/api/auth/signout`}
        onClick={signOut}
      />
    </>
  )
}
