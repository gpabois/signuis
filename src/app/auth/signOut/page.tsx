import { signOut } from "@/actions/auth/actions";

export default async function Page() {
    await signOut()
}