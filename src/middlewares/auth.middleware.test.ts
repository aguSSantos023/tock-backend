import { beforeEach, describe, expect, it, vi } from "vitest";
import { authenticateToken } from "./auth.middleware";
import jwt from "jsonwebtoken";

describe("middleware authenticateToken", () => {
  let mockReq: any;
  let mockRes: any;
  let nextFunction: any;

  beforeEach(() => {
    vi.restoreAllMocks();

    // usamos cookies
    mockReq = { cookies: {} };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      clearCookie: vi.fn().mockReturnThis(),
    };
    nextFunction = vi.fn();
    process.env.JWT_SECRET = "test_secret";
  });

  it("debería devolver 401 si no hay cookie 'auth_token'", () => {
    authenticateToken(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "No autorizado: Token ausente",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("debería devolver 403 y limpiar cookie si el token es inválido", () => {
    mockReq.cookies.auth_token = "token_falso";

    vi.spyOn(jwt, "verify").mockImplementation(() => {
      throw new Error("Invalid token");
    });

    authenticateToken(mockReq, mockRes, nextFunction);

    expect(mockRes.clearCookie).toHaveBeenCalledWith("auth_token");
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Token inválido o expirado",
    });
  });

  it("debería setear req.userId y llamar a next() si el token es válido", () => {
    mockReq.cookies.auth_token = "token_valido";
    const payload = { id: 123 };

    vi.spyOn(jwt, "verify").mockReturnValue(payload as any);

    authenticateToken(mockReq, mockRes, nextFunction);

    expect(mockReq.userId).toBe(123);
    expect(nextFunction).toHaveBeenCalled();
  });
});
