import Layout from "../../components/layout"
import { PrismaClient } from "@prisma/client"
import { Property } from "@prisma/client"
import PropertyList from "../../components/PropertyList"
import type { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/react"
import { CreatePropertyForm } from "../../components/forms/CreateProperty"

const prisma = new PrismaClient()

export default function ProtectedPage({
  propertyList,
}: {
  propertyList: Property[]
}) {
  return (
    <Layout>
      <h1>Dashboard</h1>
      <p>Control your web properties and API keys here.</p>
      <section>
        <header>
          <h2>Current Users</h2>
        </header>
        <PropertyList propertyList={propertyList} />
      </section>
      <hr />
      <section>
        <header>
          <h2>Register new web property</h2>
        </header>
        <CreatePropertyForm />
      </section>
    </Layout>
  )
}

export async function getServerSideProps({
  req,
  res,
}: {
  req: NextApiRequest
  res: NextApiResponse
}) {
  const session = await getSession({ req })
  if (session && session.user) {
    const user = await prisma.user
      .findUnique({
        where: {
          email: session.user.email || "",
        },
      })
      .catch((e) => {
        throw e
      })
      .finally(async () => {
        await prisma.$disconnect()
      })
    if (!user) {
      res.status(500).json("No logged-in user.")
      return
    }
    const propertyList = await prisma.property
      .findMany({
        where: {
          ownerId: user.id,
        },
      })
      .catch((e) => {
        throw e
      })
      .finally(async () => {
        await prisma.$disconnect()
      })
    return {
      props: {
        propertyList: propertyList,
      },
    }
  }
  return null
}
