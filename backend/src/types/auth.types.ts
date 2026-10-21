export type CreateUserData = {
    name: string;
    email: string;
    passwordHash: string;
};

export type PublicUser = {
    id: number;
    name: string;
    email: string;
};
