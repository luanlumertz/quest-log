import type { Request, Response } from "express";
// Aqui chamamos o service de cada req

export async function getPong(req: Request, res: Response) {
  res.json({ pong: true })
}