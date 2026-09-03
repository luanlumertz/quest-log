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

export function validateQuery<T extends ZodType>(schema: T) {
    return function middleware(req: Request, res: Response, next: NextFunction) {

        const result = schema.safeParse(req.query);

        if (!result.success) {
            return res.status(422).json({ error: "Erro de Validação", issues: result.error.issues });
        }

        res.locals.query = result.data;

        return next();
    };
}

export function validateParams<T extends ZodType>(schema: T) {
    return function middleware(req: Request, res: Response, next: NextFunction) {

        const result = schema.safeParse(req.params);

        if (!result.success) {
            return res.status(422).json({ error: "Erro de Validação", issues: result.error.issues });
        }

        res.locals.params = result.data;

        return next();
    };
}