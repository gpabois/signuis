import { getMonitoringService } from "@/actions/getMonitoringService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, {params}: {params: {x: number, y: number, z: number, t: number, nuisanceTypes: string}}) {
    const mimeType = "image/png";
    const monitoring = await getMonitoringService();

    const canvas = await monitoring.getNuisanceTileImage(params, {mimeType, resolution: 4})
    const resp = new NextResponse(canvas.toBuffer(), {
        headers: {
            "Content-type": mimeType
        }
    });
    return resp;
}
