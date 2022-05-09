import PrimaryButton from "../buttons/ButtonPrimary"

export default function NotSignedIn({ signIn }: { signIn: () => {} }) {
  return (
    <>
      <span>You are not signed in</span>
      <PrimaryButton
        buttonText="Sign in"
        href={`/api/auth/signin`}
        onClick={signIn}
      />
    </>
  )
}
