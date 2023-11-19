"use client";

import { CurrentSessionContext } from "@/contexts/CurrentSession";
import { useContext } from "react";

export function useCurrentSession() {
    return useContext(CurrentSessionContext);
}