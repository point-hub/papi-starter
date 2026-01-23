export interface IAuthorizationService {
  hasAccess(userGrants: string[] | undefined, requiredGrant: string): boolean;
}

export const hasAccess = (userGrants: string[] | undefined, requiredGrant: string): boolean => {
  if (!userGrants) { return false; };

  return userGrants.includes(requiredGrant);
};

export const AuthorizationService: IAuthorizationService = {
  hasAccess,
};

