import 'server-only';

import { cache } from 'react';
import { getShared } from './getShared';
import { IMonitoringService } from '@/lib/services/monitoring';

export const getMonitoringService = cache(async(): Promise<IMonitoringService> => {
    const shared = await getShared();
    return shared.services.monitoring;
});