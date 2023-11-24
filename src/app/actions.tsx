"use server";

import { ValidationError } from "@/lib/error";
import { CreateReportSchema } from "@/lib/forms";
import { CreateReport, Report } from "@/lib/model";
import { Result, failed, success } from "@/lib/result";
import { getReportingService } from "@/actions/getReportingService";
import { getCurrentSession } from "@/actions/auth/getCurrentSession";

export default async function createReport(newReportRequest: Partial<CreateReport>): Promise<Result<Report, ValidationError>> {
    const reporting = await getReportingService();
    const validation = CreateReportSchema.safeParse(newReportRequest);

    if(validation.success == false) {
        return failed({
            type: "ValidationError",
            fieldErrors: validation.error.formErrors.fieldErrors
        });
    }

    const session = await getCurrentSession();
    if(session) {
        validation.data.userId = session.user.id;
    }

    return success(await reporting.createReport(validation.data));
}