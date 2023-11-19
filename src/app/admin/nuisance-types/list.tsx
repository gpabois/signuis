"use client";

import { NuisanceType } from "@/lib/model";
import { Cursor } from "@/lib/utils/cursor";
import { useEffect, useState } from "react";
import { deleteNuisanceType, getNuisanceTypesBy } from "../../../actions/nuisance-types/actions";
import { Button } from "@/components/common/Button";
import { TrashIcon } from "@heroicons/react/20/solid";

export function NuisanceTypePage(props: {page: Array<NuisanceType>, cursor: Cursor, count: number}) {
    const [cursor, setCursor] = useState<Cursor>(props.cursor);
    const [page, setPage] = useState(props.page);
    const [count, setCount] = useState(props.count);

    useEffect(() => {
        getNuisanceTypesBy({}, cursor).then((page) => setPage(page))
    }, [cursor])

    async function doDeleteNuisanceType(item: NuisanceType) {
        await deleteNuisanceType(item);
        setPage((p) => p.filter((n) => n.id != item.id))
    }

    return <div>
        <div className="flex flex-col divide-y-2">
        {page && page.map((item)=> 
            <div className="flex flex-col pt-2 mb-2" key={`nuisance-type-${item.id}`}>
                <div className="flex flex-row">
                    <span className="font-bold text-gray-600 dark:text-gray-400 grow">{item.label}</span>
                    <Button onClick={() => deleteNuisanceType(item)}><TrashIcon className="h-5 w-5"/></Button>
                </div>
                <p>{item.description}</p>
            </div>
        )}
        </div>
    </div>
}