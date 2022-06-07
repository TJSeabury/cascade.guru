import { User } from "@prisma/client"
import React, { FormEvent } from "react"

type Props = {
  user: User
  refresh: () => Promise<void>
}

export default class DeleteUserForm extends React.Component<Props> {
  constructor(props: Props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  async handleSubmit(event: FormEvent) {
    event.preventDefault()
    const response = await fetch("/api/admin/deleteuser", {
      headers: {},
      method: "DELETE",
      body: JSON.stringify(this.props.user),
    })
    this.props.refresh()
    console.log(response.status)
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input type="submit" value="Delete" />
      </form>
    )
  }
}
