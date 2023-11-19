"use server";

import { ValidationError } from "@/lib/error";
import { CreateReportSchema } from "@/lib/forms";
import { NewReport, Report } from "@/lib/model";
import { Result, failed, success } from "@/lib/result";
import { getReportingService } from "@/actions/getReportingService";

export default async function createReport(newReportRequest: Partial<NewReport>): Promise<Result<Report, ValidationError>> {
    const reporting = await getReportingService();
    const validation = CreateReportSchema.safeParse(newReportRequest);

    if(validation.success == false) {
        return failed({
            type: "ValidationError",
            fieldErrors: validation.error.formErrors.fieldErrors
        });
    }

    return success(await reporting.addReport(validation.data));
}