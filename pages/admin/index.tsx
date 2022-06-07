import { prisma } from "../../lib/db"
import Layout from "../../components/layout"
import type { User } from "@prisma/client"
import UsersView from "../../components/admin/UsersView"

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
      <UsersView userList={userList} />
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
