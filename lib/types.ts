export enum userRoles {
    admin = "admin",
    user = "user"
}

export type User = {
    email: string,
    password: string,
    forename: string | undefined,
    surname: string | undefined,
    userRole: userRoles
};