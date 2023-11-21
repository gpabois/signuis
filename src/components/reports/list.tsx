import { CalendarIcon, MapPinIcon, StarIcon, UserIcon } from "@heroicons/react/20/solid";
import { DynamicMap, DynamicMarker, DynamicMarkerLayer } from "../leaflet/dynamic";
import { Report } from "@/lib/model";

export function ReportList(props: {items: Array<Report>}) {
    const rtf = new Intl.DateTimeFormat('fr-FR');
    return <div className="flex flex-wrap">
    {props.items.map((report) => 
    <div key={`report-${report.id}`} className="m-2 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        <DynamicMap zoom={16} dragging={false} scrollWheelZoom={false} attributionControl={false} center={[report.location.coordinates.at(1), report.location.coordinates.at(0)]} className="w-full h-40 rounded-t-lg" zoomControl={false}>
            <DynamicMarkerLayer>
                <DynamicMarker position={[report.location.coordinates.at(1), report.location.coordinates.at(0)]}>
                    <MapPinIcon className="w-5 h-5"/>
                </DynamicMarker>
            </DynamicMarkerLayer>
        </DynamicMap>
        <div className="p-5">
            <div className="flex flex-row mb-2 items-center">
                <h5 className="text-xl grow font-bold tracking-tight text-gray-900 dark:text-white">
                    {report.nuisanceType.label}
                </h5>
                <div className="text-sm text-gray-800 font-bold">{report.nuisanceType.family}</div>
            </div>
            <div className="flex flex-row flex-wrap space-x-2 mb-2">
                <div className="flex flex-1 flex-row items-center">
                    <StarIcon className="w-5 h-5 pr-1"/> 
                    <span className="text-sm">
                        {report.intensity} / 10
                    </span>
                </div>
                <div className="flex flex-1 flex-row items-center">
                    <CalendarIcon className="w-5 h-5 pr-1"/> 
                    <span className="text-sm">
                        {rtf.format(report.createdAt)}
                    </span>
                </div>
            </div>
            {report.user && 
                <div className="flex flex-row items-center">
                    <UserIcon className="w-5 h-5 pr-1"/> 
                    <span className="text-sm">{report.user?.name} </span>
                </div>
            }
        </div>
        <div className="p-2 text-end">
            <span className="text-xs text-gray-400">{report.id.slice(0, 8)}...</span>
        </div>
    </div>
    )}
</div>
}