export type CreateUserData = {
    name: string;
    email: string;
    passwordHash: string;
};

export type LoginUserData = {
    email: string;
    password: string;
};

export type UpdateUserData = {
    name: string;
};

export type PublicUser = {
    id: number;
    name: string;
    email: string;
};
