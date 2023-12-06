import { SignuisError, isValidationError } from "@/lib/error";
import { Maybe } from "@/lib/maybe";
import { Optional } from "@/lib/option";
import { Result, hasFailed, isSuccessful } from "@/lib/result";
import { useEffect, useMemo, useState } from "react";
import { ZodIssue } from "zod";

/**
 * Result hook
 * @param result 
 * @returns 
 */
export function useResult<D, E=SignuisError>(result: Result<D,E> | undefined | null) {
    const [error, setError] = useState(hasFailed(result) && result.error || undefined);

    useEffect(() => {
        setError(hasFailed(result) && result.error || undefined);
    }, [result])

    const [issues, setIssues] = useState((hasFailed(result) && isValidationError(result.error) && result.error.issues) || []);
    useEffect(() => {
        console.log((hasFailed(result) && isValidationError(result.error) && result.error.issues))
        setIssues((hasFailed(result) && isValidationError(result.error) && result.error.issues) || [])
    }, [result])

    const overallIssues = useMemo(() => issues.filter((z) => z.path.length == 0), [issues])
    const [data, setData] = useState<D|undefined>(isSuccessful(result) && result.data || undefined);
    useEffect(() => {
        setData(isSuccessful(result) && result.data || undefined)
    }, [result])

    return {data, error, issues, overallIssues};
}