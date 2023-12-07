import { getMonitoringService } from "@/actions/getMonitoringService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, {params}: {params: {x: number, y: number, z: number, between: string, nuisanceTypeIds: string}}) {
    const mimeType = "image/png";
    const monitoring = await getMonitoringService();

    // @ts-ignore
    const between = Object.fromEntries(
        params.between
        .split(',')
        .map((t) => new Date(Number(t)))
        .map((t, i) => i == 0 ? ["from", t] : ["to", t])
    ) as {from: Date, to: Date}

    const nuisanceTypeIds = params.nuisanceTypeIds == "all" ? [] : params.nuisanceTypeIds.split(',')

    const canvas = await monitoring.getNuisanceTileImage({
        x: params.x, y: params.y, z: params.z, between, nuisanceTypeIds
    }, {mimeType, resolution: 2})
    const resp = new NextResponse(canvas.toBuffer(), {
        headers: {
            "Content-type": mimeType
        }
    });
    return resp;
}
