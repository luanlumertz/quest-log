import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

export function validateBody<T extends ZodType>(schema: T) {

    return function middleware(req: Request, res: Response, next: NextFunction) {

        const result = schema.safeParse(req.body);

        if (!result.success) {
            return res.status(422).json({ error: "Erro de Validação", issues: result.error.issues });
        }

        req.body = result.data;

        return next();
    };

}