export type CreateUserData = {
    name: string,
    email: string,
    passwordHash: string
}

export type RegisterUserData = {
    name: string,
    email: string,
    password: string
}

export type LoginUserData = {
    email: string,
    password: string
}