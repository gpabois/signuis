import { ZodIssue } from "zod";
import { SignuisError } from "./error"
import { Maybe } from "./maybe";

export type Result<D, E=SignuisError> =  SuccessResult<D> | FailedResult<E>

export type FailedResult<E> = {result: "failed", error: E};

export type InvalidFormError = {
    type: "invalid_form",
    issues: Array<ZodIssue>
}

export type SuccessResult<D> = D extends void ? SuccessResultNoData: SuccessResultWithData<D> ;
export type SuccessResultWithData<D> = {result: "success", data: D};
export type SuccessResultNoData = {result: "success"};

export function success
        <D, E=SignuisError, R = D extends void ? SuccessResultNoData : SuccessResultWithData<D>>
        (...args: D extends void ? [] : [D]): R {
    if(args.length > 0) {
        const data = args.at(0)!;
        const result: SuccessResultWithData<D>  = {result: "success", data}
        return result as R;
    } else {
        const result: SuccessResultNoData = {result: "success"};
        return result as R;
    }

}

export function failed<D, E>(error: E): Result<D,E> {
    return {
        result: "failed",
        error
    }
}

export function invalid_form<D>(issues: ZodIssue[]): Result<D, InvalidFormError> {
    return failed({
        type: "invalid_form",
        issues
    })
}

export function hasFailed<D,E>(result: Maybe<Result<D,E>>): result is FailedResult<E> {
    return result !== undefined && result !== null && result.result == "failed"
}

export function isSuccessful<D,E>(result: Maybe<Result<D,E>>): result is SuccessResult<D> {
    return result !== undefined && result !== null && result.result == "success"
}
