import { ZodIssueCode, z } from 'zod'
import { NuisanceTypeFamilies } from '../model';

export const PointSchema = z.object( {
    coordinates: z.number().array(),
    type: z.literal( 'Point' ),
  });
  

/**
 * Formulaire pour se connecter avec des crédentials.
 */
export const CredentialsSchema = z.object({
    nameOrEmail: z.string().min(1),
    password: z.string().min(1)
})

/**
 * Formulaire pour s'enregistrer
 */
export const RegisterSchema = z.object({
    name: z.string().max(50),
    email: z.string().email(),
    password: z.string(),
    confirmPassword: z.string()
}).superRefine(({password, confirmPassword}, ctx) => {
    if(password != confirmPassword) {
        ctx.addIssue({
            code: ZodIssueCode.custom,
            path: ['confirmPassword'],
            message: "Les mots de passes ne sont pas égaux."
        });
    }
})

/**
 * Formulaire de création d'un signalement.
 */
export const CreateReportSchema = z.object({
    location: PointSchema,
    nuisanceTypeId: z.string(),
    userId: z.string().optional(),
    intensity: z.coerce.number().min(1).max(10)
})

/**
 * Formulaire de création d'un type de nuisance
 */
export const CreateNuisanceTypeSchema = z.object({
    label: z.string(),
    family: z.enum(NuisanceTypeFamilies.map(f => f.value) as [string, ...string[]]),
    description: z.string()
})
