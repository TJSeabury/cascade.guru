import styles from "../../styles/buttons.module.css"

export default function ButtonPrimary({
  buttonText,
  href,
  onClick,
}: {
  buttonText: string
  href: string
  onClick: () => {}
}) {
  return (
    <a
      href={href}
      className={styles.buttonPrimary}
      onClick={(e) => {
        e.preventDefault()
        onClick()
      }}
    >
      {buttonText}
    </a>
  )
}
