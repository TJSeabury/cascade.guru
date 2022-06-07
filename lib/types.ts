export enum userRoles {
  admin = "admin",
  user = "user"
}

export enum planTypes {
  agency = "agency",
  team = "team",
  single = "single"
}

export type User = {
  email: string,
  password: string,
  forename: string | undefined,
  surname: string | undefined,
  userRole: userRoles,
  numberOfProperties: number | undefined,
  maxProperties: number | undefined,
  planType: planTypes,
  billable: boolean | undefined,
  discountPercent: number | undefined
};

