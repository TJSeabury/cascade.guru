import { uniqueId } from "lodash"
import { User } from "@prisma/client"
import DeleteUserForm from "./forms/DeleteUser"
import React from "react"

type Props = {
  userList: User[]
  refresh: () => Promise<void>
}

export default class UserList extends React.Component<Props> {
  constructor(props: Props) {
    super(props)
  }

  render() {
    return (
      <ul>
        <figure
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div>
            <strong>ID</strong>
          </div>
          <div>
            <strong>Email</strong>
          </div>
          <div>
            <strong>Role</strong>
          </div>
          <div>
            <strong>Forename</strong>
          </div>
          <div>
            <strong>Surname</strong>
          </div>
        </figure>
        {this.props.userList.map((user) => (
          <li key={uniqueId("user_")}>
            <figure
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div>
                <span>{user.id}</span>
              </div>
              <div>
                <span>{user.email}</span>
              </div>
              <div>
                <span>{user.userRole}</span>
              </div>
              <div>
                <span>{user.forename}</span>
              </div>
              <div>
                <span>{user.surname}</span>
              </div>
              <div>
                <DeleteUserForm user={user} refresh={this.props.refresh} />
              </div>
            </figure>
          </li>
        ))}
      </ul>
    )
  }
}
