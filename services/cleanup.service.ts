import cron from "node-cron";
import { prisma } from "../utils/db";

export const CleanupService = {
  async initCleanupCron() {
    // Se ejecuta cada día a media noche (00:00)
    cron.schedule("0 0 * * *", async () => {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      try {
        const deleted = await prisma.user.deleteMany({
          where: {
            is_verified: false,
            created_at: {
              lt: oneDayAgo, // "lt" significa "less than" (más antiguo que)
            },
          },
        });

        console.log(
          `Limpieza completada: ${deleted.count} cuentas eliminadas.`,
        );
      } catch (error) {
        console.error("Error en la limpieza de cuentas:", error);
      }
    });
  },
};
