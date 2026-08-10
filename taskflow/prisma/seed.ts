import { PrismaClient } from '../src/prisma/index.js';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with test users...');

  // Common password for all test users
  const passwordHash = await bcrypt.hash('password123', 10);

  const users = [
    {
      name: 'Admin User',
      email: 'admin@taskflow.com',
      password: passwordHash,
      isActive: true,
      emailVerifiedAt: new Date(),
    },
    {
      name: 'John Doe',
      email: 'john@taskflow.com',
      password: passwordHash,
      isActive: true,
      emailVerifiedAt: new Date(),
    },
    {
      name: 'Jane Smith',
      email: 'jane@taskflow.com',
      password: passwordHash,
      isActive: true,
      emailVerifiedAt: new Date(),
    }
  ];

  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });
    console.log(`Created user: ${user.email} (Password: password123)`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error while seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
