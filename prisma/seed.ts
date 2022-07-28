import { prisma } from '../lib/db';
import { hashIt } from '../lib/authorization';
import { User, planTypes, userRoles } from '../lib/types';

async function createUser(u: User) {
  return prisma.user.create({
    data: {
      forename: u.forename,
      surname: u.surname,
      email: u.email,
      userRole: u.userRole,
      password: await hashIt(u.password),
      maxProperties: u.maxProperties || 1,
      planType: u.planType || planTypes.single,
      billable: u.billable || true,
      discountPercent: u.discountPercent || 0.0
    }
  });
}

async function seed() {
  await createUser({
    forename: 'Balin',
    surname: 'Firebeard',
    email: 'admin@cascade.guru',
    userRole: userRoles.admin,
    password: '7QoK9$rk^0VxQXxeQ7tHUuc0o32NYM5GrVFL6JOKCGVrcGzUNKDLWKHcw*8N$sUH',
    planType: planTypes.agency,
    billable: false,
    numberOfProperties: undefined,
    maxProperties: undefined,
    discountPercent: undefined
  })
    .catch((e) => { throw e; })
    .finally(async () => { await prisma.$disconnect(); });
}
seed();