import 'server-only';

import { cache } from 'react';
import { IReportingService } from '@/lib/services/reporting';
import { getShared } from './getShared';

export const getReportingService = cache(async(): Promise<IReportingService> => {
    const shared = await getShared();
    return shared.services.reporting;
});