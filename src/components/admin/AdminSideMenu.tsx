import Link from "next/link";

export function AdminSideMenu({children}: {children: React.ReactNode}) {
    return <aside className="z-40 w-64 h-screen 
    bg-slate-300
    shadow-xl
    dark:bg-gray-800 dark:border-gray-700 dark:text-white" >
    <div className="h-full overflow-y-auto">
        <ul className="space-y-2 font-medium">
            {children}
        </ul>
    </div>
</aside>
}