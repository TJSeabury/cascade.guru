import { User } from "@prisma/client"
import React from "react"
import { CreateUserForm } from "../forms/CreateUser"
import UserList from "../UserList"

type Props = {
  userList: User[]
}
type State = {
  userList: User[]
}

export default class UsersView extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = props
    this.refresh = this.refresh.bind(this)
  }

  async refresh() {
    const response = await fetch("/api/admin/listusers", {
      headers: {},
      method: "GET",
    })
    const users = await response.json()
    if (users) {
      this.setState({
        userList: users,
      })
    }
    console.log(response.status)
  }

  render() {
    return (
      <>
        <section>
          <header>
            <h2>Current Users</h2>
          </header>
          <UserList userList={this.state.userList} refresh={this.refresh} />
        </section>
        <hr />
        <section>
          <header>
            <h2>Create new user</h2>
          </header>
          <CreateUserForm refresh={this.refresh} />
        </section>
      </>
    )
  }
}
