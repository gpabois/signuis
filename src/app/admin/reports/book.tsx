"use client";

import { ReportList } from "@/components/reports/list";
import { Report } from "@/lib/model";
import { useState } from "react"

export type ReportBookProps = {
    page?: Array<Report>,
    count: number
}

export function ReportBook(props: ReportBookProps) {
    const [page, setPage] = useState<Array<Report>>(props.page || []);
    const [count, setCount] = useState<number>(props.count || 0);

    const rtf = new Intl.DateTimeFormat('fr-FR');

    return <>
        {count}
        <ReportList items={page}/>
    </>
}