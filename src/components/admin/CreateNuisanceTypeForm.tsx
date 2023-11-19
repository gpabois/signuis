import { NuisanceType, NuisanceTypeFamilies } from "@/lib/model";
import { Select, SelectOption } from "../common/forms/Select";
import { Input } from "../common/forms/Input";
import { Textarea } from "../common/forms/Textarea";
import {useFormState } from 'react-dom'
import { FormButton } from "../common/forms/FormButton";
import { createNuisanceType } from "@/app/admin/nuisance-types/create/actions";
import { ValidationError, isValidationError } from "@/lib/error";
import { Result } from "@/lib/result";
import { useResult } from "@/hooks/useResult";
import { Maybe } from "@/lib/maybe";


export function CreateNuisanceTypeForm(props: {onNuisanceTypeCreated?: (createdNuisanceType: NuisanceType) => void}) {
    //@ts-ignore
    const [state, formCreation] = useFormState<Maybe<Result<NuisanceType, ValidationError>>>(createNuisanceType, null);
    const {fieldErrors} = useResult(state)
    
    return <form action={formCreation}>
        <Input 
            id="label"
            name="label"
            label="Libellé" 
            className="mb-4"
            fieldErrors={fieldErrors}
        />
        <Select 
            id="family"
            name="family"
            label="Famille" 
            className="mb-4"
            fieldErrors={fieldErrors}
        >
            {NuisanceTypeFamilies.map(f => <SelectOption value={f.value} label={f.label}></SelectOption>)}
        </Select>
        <Textarea 
            id="description"
            name="description"
            label="Description" 
            className="mb-4"
            fieldErrors={fieldErrors}
        />
        <FormButton type="submit">Créer</FormButton>
    </form>
}