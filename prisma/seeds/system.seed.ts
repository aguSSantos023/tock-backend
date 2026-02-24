import { PrismaClient } from "@prisma/client";

export async function seedSystem(prisma: PrismaClient) {
  await prisma.systemConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      is_register_blocked: false,
      is_login_blocked: false,
    },
  });
  console.log("✅ Configuración del sistema sincronizada.");
}
