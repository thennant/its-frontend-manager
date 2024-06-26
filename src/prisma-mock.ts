import prisma from "@/lib/prisma"
import { PrismaClient } from "@prisma/client"
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended"

jest.mock("@/lib/prisma", () => ({
    __esModule: true,
    default: mockDeep<PrismaClient>(),
}))

beforeEach(() => {
    mockReset(prismaMock)
})

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>
