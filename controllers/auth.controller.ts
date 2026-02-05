import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { generateToken } from "../utils/jwt";

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email y contraseña son obligatorios" });
    }

    const existUser = await prisma.user.findUnique({ where: { email } });

    if (existUser) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    const hashedPassword = await Bun.password.hash(password);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    const token = generateToken(newUser.id);

    return res.status(201).json({
      message: "Usuario creado con éxito",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        storage_limit: newUser.storage_limit.toString(),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al registrar usuario" });
  }
};
