import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCurrentUser, updateCurrentUser } from "../services/auth.service";
import { useAuth } from "../contexts/AuthContext";

export function useUpdateCurrentUser() {
    const { setUser } = useAuth();

    return useMutation({
        mutationFn: updateCurrentUser,

        onSuccess: (updatedUser) => {
            setUser(updatedUser);
        }
    });
}

export function useDeleteCurrentUser(){
    const { setUser } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteCurrentUser,

        onSuccess: () => {
            queryClient.clear();
            setUser(null);
        }
    });
}
