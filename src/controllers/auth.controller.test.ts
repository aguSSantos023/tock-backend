import { describe, it, expect, vi, beforeEach } from "vitest";
import { verifyOtp, register } from "./auth.controller";
import { prisma } from "../config/db";
import { EmailService } from "../services/email.service";

// 1. Mockeamos la base de datos y los servicios
vi.mock("../config/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("../services/email.service", () => ({
  EmailService: {
    sendVerificationCode: vi.fn(),
  },
}));

describe("Auth Controller - verifyOtp", () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  it("debería verificar la cuenta con éxito si el código coincide", async () => {
    mockReq = {
      body: { otpCode: "20C0" },
      userId: 1,
    };

    const mockUser = {
      id: 1,
      email: "test@tock.com",
      otp_code: "20C0",
      otp_create_at: new Date(), // Reciente
      is_verified: false,
    };

    (prisma.user.findUnique as any).mockResolvedValue(mockUser);
    (prisma.user.update as any).mockResolvedValue({
      ...mockUser,
      is_verified: true,
    });

    await verifyOtp(mockReq, mockRes);

    expect(prisma.user.update).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: "authenticated" }),
    );
  });

  it("debería devolver 400 si el código no coincide", async () => {
    mockReq = { body: { otpCode: "WRONG" }, userId: 1 };

    (prisma.user.findUnique as any).mockResolvedValue({
      otp_code: "20C0",
      otp_create_at: new Date(),
    });

    await verifyOtp(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "Código no válido" });
  });

  it("debería devolver 403 y enviar nuevo correo si el código expiró", async () => {
    mockReq = { body: { otpCode: "20C0" }, userId: 1 };

    // Fecha de creación de hace 20 minutos
    const expiredDate = new Date(Date.now() - 20 * 60 * 1000);

    (prisma.user.findUnique as any).mockResolvedValue({
      id: 1,
      email: "test@tock.com",
      otp_code: "20C0",
      otp_create_at: expiredDate,
    });

    await verifyOtp(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(EmailService.sendVerificationCode).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "El código ha expirado. Te hemos enviado uno nuevo.",
    });
  });
});
