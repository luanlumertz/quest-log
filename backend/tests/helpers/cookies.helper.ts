type ResponseWithHeaders = {
    headers: {
        [key: string]: string | string[] | undefined;
    };
};

export function getCookieValue(
    response: ResponseWithHeaders,
    cookieName: string,
) {
    const setCookieHeader = response.headers["set-cookie"];

    if (!setCookieHeader) {
        return undefined;
    }

    const cookies = Array.isArray(setCookieHeader)
        ? setCookieHeader
        : [setCookieHeader];

    const cookie = cookies.find((cookie) =>
        cookie.startsWith(`${cookieName}=`),
    );

    if (!cookie) {
        return undefined;
    }

    const firstPart = cookie.split(";")[0];

    if (!firstPart) {
        return undefined;
    }

    return firstPart.replace(`${cookieName}=`, "");
}
