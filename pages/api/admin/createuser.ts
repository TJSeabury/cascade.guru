import { prisma } from '../../../lib/db';
import { User } from '@prisma/client';
import { hashIt } from '../../../lib/authorization';
import { getSession } from "next-auth/react"
import type { NextApiRequest, NextApiResponse } from 'next';

async function createUser(u: User) {
    return prisma.user.create({
        data: {
            forename: u.forename,
            surname: u.surname,
            email: u.email,
            userRole: u.userRole,
            password: await hashIt(u.password)
        }
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const session = await getSession({ req })
        if (session) {
            const payload = JSON.parse(req?.body);
            const user = await createUser(payload)
                .catch((e) => { throw e; })
                .finally(async () => { await prisma.$disconnect(); });
            res.status(201).json({
                content:
                    "User created.",
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