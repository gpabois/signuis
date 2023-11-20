import { signOut } from "@/actions/auth/signOut";
import { NextResponse } from "next/server";

export async function GET() {
    await signOut()
    return NextResponse.redirect("/")
}

export async function POST() {
    await signOut()
    return NextResponse.redirect("/")
}