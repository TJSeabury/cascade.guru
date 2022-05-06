import type { ReactChildren } from "react"
import { uniqueId } from "lodash"
import { useEffect, useState } from "react"
import { User } from "@prisma/client"

interface Props {
  userList: User[]
}

export default function UserList({ userList }: Props) {
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
      {userList?.map((user) => (
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
          </figure>
        </li>
      ))}
    </ul>
  )
}
