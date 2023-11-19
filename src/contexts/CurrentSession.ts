"use client";

import { Session } from '@/lib/model';
import { Context, createContext } from 'react';

export const CurrentSessionContext: Context<Session|undefined> = createContext<Session|undefined>(undefined);