import { describe, it, expect, vi, beforeEach } from "vitest";
import { uploadSong, deleteSong } from "./songs.controller";
import { prisma } from "../config/db";
import { AudioService } from "../services/audio.service";

vi.mock("../config/db", () => ({
  prisma: {
    user: { findUnique: vi.fn(), update: vi.fn() },
    song: {
      create: vi.fn(),
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
    $executeRaw: vi.fn(),
  },
}));

vi.mock("../services/audio.service", () => ({
  AudioService: {
    getMetadata: vi.fn(),
    convertToOpus: vi.fn(),
    stripMetadata: vi.fn(),
    deleteFile: vi.fn(),
    generateFinalName: vi.fn().mockReturnValue("final_song.opus"),
  },
}));

vi.mock("fs", () => ({
  default: {
    renameSync: vi.fn(),
    statSync: vi.fn().mockReturnValue({ size: 1024 * 1024 }), // 1MB
    existsSync: vi.fn().mockReturnValue(true),
  },
}));

vi.mock("config/concurrency", () => ({
  audioLimit: vi.fn((fn) => fn()),
}));

describe("Songs Controller - uploadSong", () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  it("debería fallar si no hay archivo", async () => {
    mockReq = { body: { title: "Test" }, userId: 1, file: null };
    await uploadSong(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "No se ha subido ningún archivo",
    });
  });

  it("debería fallar si el almacenamiento está crítico (507)", async () => {
    mockReq = {
      body: { title: "Test" },
      userId: 1,
      file: { path: "temp/path.mp3", mimetype: "audio/mpeg" },
    };

    (prisma.user.findUnique as any).mockResolvedValue({
      storage_limit: BigInt(1000),
      storage_used: BigInt(999),
    });

    await uploadSong(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(507);
    expect(AudioService.deleteFile).toHaveBeenCalled();
  });

  it("debería procesar y subir una canción correctamente", async () => {
    mockReq = {
      body: { title: "Mi Canción" },
      userId: 1,
      file: {
        path: "temp/original.mp3",
        mimetype: "audio/mpeg",
        originalname: "original.mp3",
      },
    };

    // Mocks de datos
    (prisma.user.findUnique as any).mockResolvedValue({
      storage_limit: BigInt(100 * 1024 * 1024),
      storage_used: BigInt(0),
    });

    (AudioService.getMetadata as any).mockResolvedValue({
      format: {
        duration: 180,
        tags: { title: "Tag Title", artist: "Tag Artist" },
      },
    });

    (prisma.user.update as any).mockResolvedValue({
      storage_used: BigInt(1024),
    });

    await uploadSong(mockReq, mockRes);

    // Verificamos el pipeline
    expect(AudioService.convertToOpus).toHaveBeenCalled();
    expect(AudioService.stripMetadata).toHaveBeenCalled();
    expect(prisma.song.create).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(201);
  });

  it("debería saltar la conversión si el archivo ya es Opus", async () => {
    mockReq = {
      body: { title: "Ya soy Opus" },
      userId: 1,
      file: {
        path: "temp/original.opus",
        mimetype: "audio/opus",
        originalname: "original.opus",
      },
    };

    (prisma.user.findUnique as any).mockResolvedValue({
      storage_limit: BigInt(100 * 1024 * 1024),
      storage_used: BigInt(0),
    });

    await uploadSong(mockReq, mockRes);

    expect(AudioService.convertToOpus).not.toHaveBeenCalled();
    // Verifica que se intentó renombrar el archivo original directamente
    const fs = await import("fs");
    expect(fs.default.renameSync).toHaveBeenCalledWith(
      "temp/original.opus",
      expect.stringContaining("raw-"),
    );
  });

  it("debería fallar si el archivo procesado excede el límite final", async () => {
    mockReq = {
      body: { title: "Canción Pesada" },
      userId: 1,
      file: { path: "t.mp3", mimetype: "audio/mpeg", originalname: "t.mp3" },
    };

    const limit = BigInt(10 * 1024 * 1024); // 10MB
    const used = BigInt(4 * 1024 * 1024); // 4MB usado

    (prisma.user.findUnique as any).mockResolvedValue({
      storage_limit: limit,
      storage_used: used,
    });

    const fs = await import("fs");
    (fs.default.statSync as any).mockReturnValue({ size: 7 * 1024 * 1024 });

    await uploadSong(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: expect.stringContaining("excede tu límite"),
    });
  });
});

describe("Songs Controller - getSongsPaged", () => {
  it("debería devolver canciones paginadas correctamente", async () => {
    const mockReq = {
      userId: 1,
      query: { limit: "10", page: "2" },
    } as any;
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;

    (prisma.song.findMany as any).mockResolvedValue([
      { id: 1, title: "S1", file_size: BigInt(100) },
    ]);

    await import("./songs.controller").then((m) =>
      m.getSongsPaged(mockReq, mockRes),
    );

    expect(prisma.song.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 10,
        skip: 10, // (page 2 - 1) * 10
      }),
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});

describe("Songs Controller - shuffleListNow", () => {
  it("debería ejecutar el raw query de aleatorización", async () => {
    const mockReq = { userId: 1, query: {} } as any;
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;

    (prisma.song.findMany as any).mockResolvedValue([]);

    await import("./songs.controller").then((m) =>
      m.shuffleListNow(mockReq, mockRes),
    );

    expect(prisma.$executeRaw).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});

describe("Songs Controller - deleteSong", () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  it("debería eliminar canciones específicas y actualizar storage", async () => {
    mockReq = {
      body: { ids: [1, 2] },
      userId: 1,
    };

    const songsToDelete = [
      { id: 1, file_path: "path1.opus", file_size: BigInt(500) },
      { id: 2, file_path: "path2.opus", file_size: BigInt(500) },
    ];

    (prisma.song.findMany as any).mockResolvedValue(songsToDelete);
    (prisma.user.update as any).mockResolvedValue({
      storage_used: BigInt(0),
      storage_limit: BigInt(1000),
    });

    await deleteSong(mockReq, mockRes);

    expect(AudioService.deleteFile).toHaveBeenCalledTimes(2);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { storage_used: { decrement: BigInt(1000) } },
      }),
    );
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Canciones eliminadas",
        count: 2,
      }),
    );
  });
});
