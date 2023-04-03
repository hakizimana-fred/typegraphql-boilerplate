import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const connectDb = async () => {
    try {
        await prisma.$connect()
        console.log(`DB connected successfully`)
    }catch(e) {
        console.log(e.message)
    }
}