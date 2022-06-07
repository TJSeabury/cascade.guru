import { prisma } from "../../lib/db"
import Layout from "../../components/layout"
import type { User } from "@prisma/client"
import { CreateUserForm } from "../../components/forms/CreateUser"
import UserList from "../../components/UserList"



export default function Page({ userList }: { userList: User[] }) {
  return (
    <Layout>
      <h1>This page is protected by Middleware</h1>
      <p>Only admin users can see this page.</p>
      <p>
        To learn more about the NextAuth middleware see&nbsp;
        <a href="https://docs-git-misc-docs-nextauthjs.vercel.app/configuration/nextjs#middleware">
          the docs
        </a>
        .
      </p>
      <section>
        <header>
          <h2>Current Users</h2>
        </header>
        <UserList userList={userList} />
      </section>
      <hr />
      <section>
        <header>
          <h2>Create new user</h2>
        </header>
        <CreateUserForm />
      </section>
    </Layout>
  )
}

export async function getServerSideProps() {
  const userList = await prisma.user
    .findMany()
    .catch((e) => {
      throw e
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
  return {
    props: {
      userList: userList,
    },
  }
}
