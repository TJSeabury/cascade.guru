import { prisma } from "../../../lib/db";
import { getSession } from "next-auth/react"
import type { NextApiRequest, NextApiResponse } from 'next';
import type { User, Property } from '@prisma/client';
import { randomUUID } from 'crypto';

async function createProperty(p: Property, u: User) {
  return prisma.property.create({
    data: {
      domain: p.domain,
      apiKey: randomUUID(),
      ownerId: u.id
    }
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const session = await getSession({ req })
    if (session && session.user) {
      const user = await prisma.user.findUnique({
        where: {
          email: session.user.email || ''
        }
      }).catch((e) => { throw e; })
        .finally(async () => { await prisma.$disconnect(); });
      if (!user) {
        res.status(500).json('No logged-in user.');
        return;
      }
      const payload = JSON.parse(req?.body);
      const property = await createProperty(payload, user)
        .catch((e) => { throw e; })
        .finally(async () => { await prisma.$disconnect(); });
      res.status(201).json(property)
    } else {
      res.status(401).json({
        error: "You are not authorized to access this endpoint.",
      })
    }
  } else {
    res.status(404).json('Endpoint not found.');
  }
}