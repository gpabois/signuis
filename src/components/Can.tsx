import { createContextualCan } from '@casl/react';
import {AbilityContext} from "@/contexts/Ability"

//@ts-ignore
export const Can = createContextualCan(AbilityContext.Consumer);
