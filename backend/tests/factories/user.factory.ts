export type RegisterUserPayload = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export function makeRegisterUserPayload(
  overrides: Partial<RegisterUserPayload> = {},
): RegisterUserPayload {
  return {
    name: "Luan",
    email: "luan@email.com",
    password: "12345678",
    confirmPassword: "12345678",
    ...overrides,
  };
}
