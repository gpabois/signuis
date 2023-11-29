"use client";

import { Intensity } from "@/lib/model";
import { Cursor } from "@/lib/utils/cursor";
import { FireIcon, StarIcon, UserIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { useState } from "react";

export function getTile({x, y, z}: {x: number, y: number, z: number}): string {
    return `https://a.tile.openstreetmap.org/${z}/${x}/${y}.png`
}

export function NuisanceTileBook(props: {page: Array<NuisanceTile>, cursor: Cursor, count: number}) {
    const [page, setPage] = useState(props.page);
    return <div className="flex flex-wrap">
        {page.map(item => 
           <div key={`nuisance-tile-${item.x}-${item.y}-${item.z}-${item.t}`} className="m-2  bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <img className="rounded-t-lg" src={getTile(item)}/>
            <div className="p-5">
               <div className="flex flex-row mb-2 items-center">
                   <h5 className="text-xl grow font-bold tracking-tight text-gray-900 dark:text-white">
                       {item.nuisanceType.label}
                   </h5>
                   <span className="text-sm text-gray-500 font-bold">{item.nuisanceType.family}</span>
               </div>
               <div className="flex flex-row items-center">
                    <div className="flex flex-1 flex-row items-center">
                        <StarIcon className="w-4 h-4"/>
                        <span className="text-sm">
                            {Math.round(item.weight / item.count)} / 10
                        </span>
                    </div>
                    <div className="flex flex-1 flex-row items-center">
                        <FireIcon className="w-4 h-4"/>
                        <span className="text-sm">
                            {item.weight}
                        </span>
                    </div>
                    <div className="flex flex-1 flex-row items-center">
                        <UserIcon className="w-4 h-4"/>
                        <span className="text-sm">
                            {item.count}
                        </span>
                    </div>
               </div>
            </div>
            <div>
                <Link href={`/monitoring/tiles/${item.nuisanceType.id}/${item.t}/${item.z}/${item.x}/${item.y}`}>Tile</Link>
            </div>
       </div>
            
        )}
    </div>
}