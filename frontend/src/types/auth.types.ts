export type User = {
    id: number;
    name: string;
    email: string;
};

export type AuthResponse = {
    user: User;
};

export type RegistrationResponse = {
    pendingRegistrationId: string;
    email: string;
};

export type PendingRegistration = RegistrationResponse & {
    expiresAt: number;
    resendAvailableAt: number;
};
