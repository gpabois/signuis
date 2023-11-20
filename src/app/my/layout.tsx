import { Menu } from "@/components/common/menu/Menu";
import { SideMenu } from "@/components/common/menu/SideMenu";
import { SideMenuItem } from "@/components/common/menu/SideMenuItem";
import { BellAlertIcon, Cog6ToothIcon } from "@heroicons/react/20/solid";

export default function AdminLayout({children}: {children: React.ReactNode}) {
    return <div className="flex flex-col">
            <Menu/>
        <div className="flex flex-row">
            <SideMenu>
                <SideMenuItem href="/my/reports">
                    <span className="hidden sm:block pr-2">Signalements</span>
                    <BellAlertIcon className="h-5 w-5"/>
                </SideMenuItem>
                <SideMenuItem href="/my/settings">
                    <span className="hidden sm:block pr-2">Paramètres</span>
                    <Cog6ToothIcon className="h-5 w-5"/>
                </SideMenuItem>
            </SideMenu>
            <div className="grow p-4 dark:bg-slate-800 dark:text-white">
                {children}
            </div>
            
        </div>
    </div>
}