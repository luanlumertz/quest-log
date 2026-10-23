import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCurrentUser, updateCurrentUser } from "../services/auth.service";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router";
import { storePasswordRecovery } from "../lib/passwordRecoverySession";
import { storePasswordChangeNotice } from "../lib/passwordChangeNotice";

export function useUpdateCurrentUser() {
    const { setUser } = useAuth();

    return useMutation({
        mutationFn: updateCurrentUser,

        onSuccess: (updatedUser) => {
            setUser(updatedUser);
        },
    });
}

export function useDeleteCurrentUser() {
    const { setUser } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteCurrentUser,

        onSuccess: () => {
            queryClient.clear();
            setUser(null);
        },
    });
}

export function usePasswordChangeSuccess() {
    const { setUser } = useAuth();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return (email?: string) => {
        storePasswordChangeNotice(email);
        // O backend já revogou as sessões e limpou os cookies; não é necessário chamar logout.
        queryClient.clear();
        setUser(null);
        navigate("/login", { replace: true, state: { passwordChanged: true, email } });
        storePasswordRecovery(null);
    };
}
