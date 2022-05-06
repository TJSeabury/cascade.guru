import * as bcrypt from 'bcrypt';
import type { NextApiRequest } from "next";
import { PrismaClient, User } from '@prisma/client';


const prisma = new PrismaClient()

export async function hashIt(password: string) {
    console.log(password);
    return await bcrypt.hash(password, await bcrypt.genSalt(12));
}

// compare the password user entered with hashed pass.
export async function compareIt(password: string, hashed: string) {
    return await bcrypt.compare(password, hashed);
}

export async function login(email: string | null | undefined, password: string | null | undefined) {
    if (!email || !password) {
        return null;
    }
    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    });
    await prisma.$disconnect()
    if (!user) return null;
    if (await compareIt(password, user?.password || '')) {
        return user;
    }
    return null;
}

export async function authenticate(user: User, apiKey: string, targetUrl: string) {
    const domain = new URL(targetUrl).host;
    if (!domain) return false;
    const properties = await prisma.property.findMany({
        where: {
            ownerId: user.id
        }
    })
    await prisma.$disconnect()
    const found = properties.filter(p => {
        if (p.domain === domain && p.apiKey === apiKey) return true;
        return false;
    })
    if (found.length > 0) {
        return true;
    }
    return false;
}

export function credentialsFromBasicAuth(req: NextApiRequest) {
    const bAuth = req?.headers?.authorization;
    if (!bAuth) return null;
    const b64Auth = Buffer.from(bAuth.replace('Basic ', ''), 'base64').toString('utf8');
    if (!b64Auth) return null;
    return b64Auth.split(':');
}