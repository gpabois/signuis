import { isValidationError } from "@/lib/error";
import { Result, hasFailed, isSuccessful } from "@/lib/result";
import { useMemo } from "react";

/**
 * Result hook
 * @param result 
 * @returns 
 */
export function useResult<D, E>(result: Result<D,E>|undefined|null): {data: D | undefined, error: E | undefined, fieldErrors: {[field: string]: string[]} | undefined} {
    const error = useMemo(() => hasFailed(result) && result.error || undefined, [result]);
    const fieldErrors = useMemo(() => (hasFailed(result) && isValidationError(result.error) && result.error.fieldErrors) || {}, [result]);
    const data = useMemo(() => isSuccessful(result) && result.data || undefined, [result]);
    return {data, error, fieldErrors};
}