import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createUser(email: string, username: string, password: string) {
  const hashedPassword = await hashPassword(password)
  
  return prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
    },
  })
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  })
}

export async function getUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username },
  })
}

export async function createSession(userId: string, token: string, expiresAt: Date) {
  return prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })
}

export async function getSessionByToken(token: string) {
  return prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })
}

export async function deleteSession(token: string) {
  return prisma.session.delete({
    where: { token },
  })
}
