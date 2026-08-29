import type { Request, Response } from "express";

export async function getPong(req: Request, res: Response) {
  res.json({ pong: true })
}