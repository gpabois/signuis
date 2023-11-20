import { z } from 'zod'
import { NuisanceTypeFamilies } from '../model';

export const PointSchema = z.object( {
    coordinates: z.number().array(),
    type: z.literal( 'Point' ),
  });
  

export const CredentialsSchema = z.object({
    nameOrEmail: z.string(),
    password: z.string()
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

export const CreateNuisanceTypeSchema = z.object({
    label: z.string(),
    family: z.enum(NuisanceTypeFamilies.map(f => f.value) as [string, ...string[]]),
    description: z.string()
})
