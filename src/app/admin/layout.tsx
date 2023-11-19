import { AdminMenu } from "@/components/admin/AdminMenu";
import { AdminSideMenu } from "@/components/admin/AdminSideMenu";
import { AdminSideMenuItem } from "@/components/admin/AdminSideMenuItem";
import { BellAlertIcon, MegaphoneIcon, UserGroupIcon, UserIcon } from "@heroicons/react/20/solid";

export default function AdminLayout({children}: {children: React.ReactNode}) {
    return <div className="flex flex-col">
            <AdminMenu/>
        <div className="flex flex-row">
            <AdminSideMenu>
                <AdminSideMenuItem href="/admin/nuisance-types">
                    <span>Types de nuisance</span>
                    <MegaphoneIcon className="h-5 w-5"/>
                </AdminSideMenuItem>
                <AdminSideMenuItem href="/admin/reports">
                    <span>Signalements</span>
                    <BellAlertIcon className="h-5 w-5"/>
                </AdminSideMenuItem>
                <AdminSideMenuItem href="/admin/organisations">
                    <span>Organisations</span>
                    <UserGroupIcon className="h-5 w-5"/>
                </AdminSideMenuItem>
                <AdminSideMenuItem href="/admin/users">
                    <span>Utilisateurs</span>
                    <UserIcon className="h-5 w-5"/>
                </AdminSideMenuItem>
            </AdminSideMenu>
            <div className="grow p-4 dark:bg-slate-800 dark:text-white">
                {children}
            </div>
            
        </div>
    </div>
}