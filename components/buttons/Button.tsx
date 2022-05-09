import styles from "../../styles/buttons.module.css"

export default function Button({
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
      className={styles.button}
      onClick={(e) => {
        e.preventDefault()
        onClick()
      }}
    >
      {buttonText}
    </a>
  )
}
