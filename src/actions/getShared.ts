import { Shared, createShared } from "@/lib/shared";
import { cache } from "react";

export const getShared = cache(async function (): Promise<Shared> {
    return createShared()
});