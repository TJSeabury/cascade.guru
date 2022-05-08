import { PrismaClient } from '@prisma/client';
import { hashIt } from '../lib/authorization';
import { User, userRoles } from '../lib/types';

const prisma = new PrismaClient();

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

async function seed() {
  const user = await createUser({
    forename: 'Balin',
    surname: 'Firebeard',
    email: 'admin@cascade.guru',
    userRole: userRoles.admin,
    password: 'FullM3talViking'
  })
    .catch((e) => { throw e; })
    .finally(async () => { await prisma.$disconnect(); });
}
seed();