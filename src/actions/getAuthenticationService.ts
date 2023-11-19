import 'server-only';

import { cache } from 'react';
import { getShared } from './getShared';
import { IAuthenticationService } from '@/lib/services/authentication';

export const getAuthenticationService = cache(async(): Promise<IAuthenticationService> => {
    const shared = await getShared();
    return shared.services.auth;
});