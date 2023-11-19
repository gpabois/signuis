export type SignuisError = ValidationError | InternalError | InvalidCredantialsError;

export interface Error {
    type: string
}

export function isError(maybeBaseError: unknown, type: string): maybeBaseError is Error {
    return typeof(maybeBaseError) === "object" 
        && maybeBaseError !== null 
        && !Array.isArray(maybeBaseError)
        && "type" in maybeBaseError
        && maybeBaseError.type == type
}


export interface InternalError {
    type: "InternalError"
}

export interface InvalidCredantialsError {
    type: "InvalidCredentials",
    message: string
}

export function invalid_credentials(message? :string): InvalidCredantialsError {
    return {
        type: "InvalidCredentials", 
        message: message || "Les identifiants sont invalides, ou l'utilisateur n'existe pas."
    };
}

export function isInvalidCredentialsError(maybeInvalidCredentialsError: unknown): maybeInvalidCredentialsError is InvalidCredantialsError {
    return isError(maybeInvalidCredentialsError, 'InvalidCredentialsError')
}

export interface ValidationError {
    type: "ValidationError",
    fieldErrors: {[id: string]: string[]}
}

export function validation_error(fieldErrors: {[id: string]: string[]}): ValidationError {
    return {
        type: "ValidationError",
        fieldErrors
    }
}

export function isValidationError(maybeValidationError: unknown): maybeValidationError is ValidationError {
    return isError(maybeValidationError, 'ValidationError') && "fieldErrors" in maybeValidationError;
}