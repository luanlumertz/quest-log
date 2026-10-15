export function captureError<T extends Error>(
    callback: () => unknown,
    errorClass: new (...args: never[]) => T,
): T {
    try {
        callback();
    } catch (error) {
        if (error instanceof errorClass) {
            return error;
        }

        throw error;
    }

    throw new Error("Era esperado que a função lançasse um erro");
}
