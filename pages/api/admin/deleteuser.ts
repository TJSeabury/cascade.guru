import { prisma } from '../../../lib/db';
import { User } from '@prisma/client';
import { getSession } from "next-auth/react"
import type { NextApiRequest, NextApiResponse } from 'next';

async function deleteUser(u: User) {
  return prisma.user.delete({
    where: {
      id: u.id
    }
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const session = await getSession({ req })
    if (session) {
      const payload = JSON.parse(req?.body);
      await deleteUser(payload)
        .catch((e) => { throw e; })
        .finally(async () => { await prisma.$disconnect(); });
      res.status(204).json({
        content:
          "User deleted.",
      })
    } else {
      res.status(401).json({
        error: "You are not authorized to access this endpoint.",
      })
    }
  } else {
    res.status(404).json('Endpoint not found.');
  }
}