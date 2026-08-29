import jwt, { type JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET não configurado");
};

export function generateToken(userId: number) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" });
};

export function verifyToken(token: string) {
    const payload = jwt.verify(token, JWT_SECRET);

    if (
        typeof payload === "string" ||
        typeof payload.userId !== "number"
    ) {
        throw new Error("Token inválido");
    }

    return {
        ...payload,
        userId: payload.userId,
    };
}
