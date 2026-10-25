export function getTrustProxyHops(): number {
    const value = process.env.TRUST_PROXY_HOPS ?? "0";
    const hops = Number(value);

    if (!/^\d+$/.test(value) || !Number.isSafeInteger(hops)) {
        throw new Error("TRUST_PROXY_HOPS deve ser um inteiro maior ou igual a zero.");
    }

    return hops;
}
