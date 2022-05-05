import * as bcrypt from 'bcrypt';
import type { NextApiRequest } from "next";
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient()

export async function hashIt(password: string) {
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
    console.log(user);
    await prisma.$disconnect()
    if (!user) return null;
    if (await compareIt(password, user?.password || '')) {
        return user;
    }
    return null;
}

export function credentialsFromBasicAuth(req: NextApiRequest) {
    const bAuth = req?.headers?.authorization;
    if (!bAuth) return null;
    const b64Auth = Buffer.from(bAuth.replace('Basic ', ''), 'base64').toString('utf8');
    if (!b64Auth) return null;
    return b64Auth.split(':');
}

export function authenticate(user: string, pass: string) {
    if (user === "coolUsername" && pass === "securePassword") {
        return true;
    }
    return false;
}