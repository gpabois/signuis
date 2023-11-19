"use client";

import { Report } from "@/lib/model";
import { useState } from "react"

export type ReportListProps = {
    page?: Array<Report>,
    size: number
}

export function ReportList(props: ReportListProps) {
    const [page, setPage] = useState<Array<Report>>(props.page || []);
    const [size, setSize] = useState<number>(props.size || 0);

    const rtf = new Intl.DateTimeFormat('fr-FR');

    return <div className="flex flex-col divide-y-2">
        {page.map((report) => <div className="flex flex-col">
            <span className="text-xs">{report.id}</span>
            <span className="text-xs">{rtf.format(report.createdAt)}</span>
            <span className="text-xs">{report.intensity}</span>
            <span className="text-xs">{report.nuisanceType.label}</span>
            <span className="text-xs">{JSON.stringify(report.location)}</span>
        </div>
        )}
    </div>
}