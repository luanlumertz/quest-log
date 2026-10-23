import { randomInt } from "node:crypto";

import { hashPassword, comparePassword } from "./bcrypt.js";

export function generateVerificationCode(): string {
    return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export async function hashVerificationCode(code: string): Promise<string> {
    return hashPassword(code);
}

export async function verifyVerificationCode(code: string, codeHash: string): Promise<boolean> {
    return comparePassword(code, codeHash);
}
