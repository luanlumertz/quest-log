type ResponseWithHeaders = {
    headers: {
        [key: string]: string | string[] | undefined;
    };
};

function getSetCookies(response: ResponseWithHeaders) {
    const setCookieHeader = response.headers["set-cookie"];

    if (!setCookieHeader) {
        return [];
    }

    return Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
}

export function getCookieValue(response: ResponseWithHeaders, cookieName: string) {
    const cookies = getSetCookies(response);

    const cookie = cookies.find((cookie) => cookie.startsWith(`${cookieName}=`));

    if (!cookie) {
        return undefined;
    }

    const firstPart = cookie.split(";")[0];

    if (!firstPart) {
        return undefined;
    }

    return firstPart.replace(`${cookieName}=`, "");
}

export function getAuthCookiesFromResponse(response: ResponseWithHeaders) {
    const cookies = getSetCookies(response);

    const accessTokenCookie = cookies.find((cookie) => cookie.startsWith("accessToken="));

    const refreshTokenCookie = cookies.find((cookie) => cookie.startsWith("refreshToken="));

    return {
        accessTokenCookie,
        refreshTokenCookie,
    };
}
