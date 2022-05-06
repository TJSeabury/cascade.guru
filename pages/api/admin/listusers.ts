import { PrismaClient } from '@prisma/client';
import { getSession } from "next-auth/react"
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const session = await getSession({ req })
        if (session) {
            const userList = await prisma.user
                .findMany()
                .catch((e) => {
                    throw e
                })
                .finally(async () => {
                    await prisma.$disconnect()
                })
            res.status(200).json(userList)
        } else {
            res.status(401).json({
                error: "You are not authorized to access this endpoint.",
            })
        }
    } else {
        res.status(404).json('Endpoint not found.');
    }
}