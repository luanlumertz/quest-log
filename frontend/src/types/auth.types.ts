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

export type PasswordRecovery = {
    email: string;
    resendAvailableAt: number;
};

export type PasswordResetResponse = {
    resetToken: string;
    expiresIn: number;
};

export type PasswordResetAuthorization = {
    resetToken: string;
    expiresAt: number;
};
