import type { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/AppError.js";

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
    next(new AppError("Rota não encontrada", 404));
}
