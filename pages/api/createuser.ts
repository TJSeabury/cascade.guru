import { PrismaClient } from '@prisma/client';
import { hashIt } from '../../authorization';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

type User = {
    email: string,
    password: string,
    forename: string,
    surname: string
};

async function createUser(u: User) {
    return await prisma.user.create({
        data: {
            forename: u.forename,
            surname: u.surname,
            email: u.email,
            password: await hashIt(u.password)
        }
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const user = await createUser({
            forename: 'tester',
            surname: 'testersonson',
            email: 'test@email.com',
            password: 'testtest'
        })
            .catch((e) => { throw e; })
            .finally(async () => { await prisma.$disconnect(); });
        console.log(user);
    } else {
        res.status(404).send('Endpoint not found.');
    }
}