import { SetMetadata } from '@nestjs/common';

export const IS_OPTIONAL_AUTH_KEY = 'isOptionalAuth';
/** Mark a route as optionally authenticated: JWT is validated if present, but anonymous access is also allowed. req.user is populated if token is valid. */
export const OptionalAuth = () => SetMetadata(IS_OPTIONAL_AUTH_KEY, true);
