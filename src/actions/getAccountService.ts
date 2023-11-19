import 'server-only';

import { cache } from 'react';
import { getShared } from './getShared';
import { IAccountService } from '@/lib/services/account';

export const getAccountService = cache(async(): Promise<IAccountService> => {
    const shared = await getShared();
    return shared.services.account;
});