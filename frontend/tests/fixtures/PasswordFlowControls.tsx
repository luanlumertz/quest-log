import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router";

import { usePasswordRecovery } from "../../src/contexts/PasswordRecoveryContext";
import type { PasswordResetResponse } from "../../src/types/auth.types";

export function PasswordAuthorizationSeed({ response }: { response?: PasswordResetResponse }) {
    const { recovery, saveAuthorization } = usePasswordRecovery();
    const seeded = useRef(false);

    useEffect(() => {
        if (!seeded.current && response && recovery) {
            seeded.current = true;
            saveAuthorization(recovery, response);
        }
    }, [recovery, response, saveAuthorization]);

    return <Outlet />;
}

export function PasswordFlowLocation() {
    const { pathname, search } = useLocation();

    return <div data-testid="rota-atual">{pathname + search}</div>;
}
