import { describe, expect, it, vi, beforeEach } from "vitest";
import { validate } from "./validate.middleware";
import { loginSchema, otpSchema } from "../schemas/auth.schema";

describe("Middleware: validate", () => {
  let mockReq: any;
  let mockRes: any;
  let nextFunction: any;

  beforeEach(() => {
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    nextFunction = vi.fn();
  });

  // --- Pruebas con LoginSchema ---
  describe("Login Schema", () => {
    it("debería pasar (next) si las credenciales son correctas", () => {
      mockReq = {
        body: { email: "test@tock.com", password: "password123" },
      };

      validate(loginSchema)(mockReq, mockRes, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it("debería fallar si falta el email o la contraseña", () => {
      mockReq = { body: { email: "test@tock.com" } }; // Falta password

      validate(loginSchema)(mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Error de validación" }),
      );
    });
  });

  // --- Pruebas con OtpSchema  ---
  describe("OTP Schema", () => {
    it("debería rechazar códigos con minúsculas (20c0)", () => {
      mockReq = { body: { otpCode: "20c0" } };

      validate(otpSchema)(mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("debería aceptar códigos hexadecimales válidos (20C0)", () => {
      mockReq = { body: { otpCode: "20C0" } };

      validate(otpSchema)(mockReq, mockRes, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it("debería rechazar códigos que no tengan exactamente 4 caracteres", () => {
      mockReq = { body: { otpCode: "ABC" } };

      validate(otpSchema)(mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  // --- Prueba de Sanitización ---
  it("debería limpiar campos extra no definidos en el esquema", () => {
    mockReq = {
      body: {
        otpCode: "F2A1",
        admin: true, // Campo malicioso/extra
      },
    };

    validate(otpSchema)(mockReq, mockRes, nextFunction);

    expect(mockReq.body).not.toHaveProperty("admin");
    expect(mockReq.body.otpCode).toBe("F2A1");
  });
});
