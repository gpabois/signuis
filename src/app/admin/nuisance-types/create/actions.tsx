'use server'

import { getReportingService } from "@/actions/getReportingService"
import { CreateNuisanceTypeSchema } from "@/lib/forms";
import { NuisanceType } from "@/lib/model";
import { ValidationError, validation_error } from "@/lib/error";
import { Result, failed, success } from "@/lib/result";
import { Maybe } from "@/lib/maybe";
import { redirect } from "next/navigation";

export async function createNuisanceType(prevState: Maybe<Result<NuisanceType, ValidationError>>, formData: FormData): Promise<Maybe<Result<NuisanceType, ValidationError>>> {
    const reporting = await getReportingService();

    const validation = CreateNuisanceTypeSchema.safeParse({
        label: formData.get("label"),
        family: formData.get("family"),
        description: formData.get("description")
    });

    if(validation.success == false) {
        return failed(validation_error(validation.error.issues));
    }

    let result = success(await reporting.createNuisanceType(validation.data));
    redirect("/admin/nuisance-types");
}

