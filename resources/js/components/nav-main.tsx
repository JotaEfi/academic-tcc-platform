import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { PanelLeftClose, Menu } from 'lucide-react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const { toggleSidebar } = useSidebar();
    return (
        <SidebarGroup className="p-0">
            <div className="flex items-center h-12 border-b border-[#17a8bb] text-white px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                <span className="font-bold text-sm tracking-wide text-white/80 group-data-[collapsible=icon]:hidden flex-1">
                    Avalia TCC
                </span>
                <button
                    onClick={toggleSidebar}
                    className="p-1.5 rounded-md hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                    title="Alternar menu"
                >
                    <Menu className="w-5 h-5 hidden group-data-[collapsible=icon]:block" />
                    <PanelLeftClose className="w-5 h-5 group-data-[collapsible=icon]:hidden" />
                </button>
            </div>
            <SidebarMenu className="gap-0">
                {items.map((item) => (
                    <SidebarMenuItem key={item.title} className="border-b border-[#17a8bb] last:border-b-0">
                        <SidebarMenuButton
                            asChild
                            isActive={page.url === resolveUrl(item.href)}
                            tooltip={{ children: item.title }}
                            className={page.url === resolveUrl(item.href)
                                ? 'bg-[#216f7d]! text-white! font-bold rounded-none! h-12 w-full px-4 group-data-[collapsible=icon]:w-full! group-data-[collapsible=icon]:h-12! group-data-[collapsible=icon]:px-0!'
                                : 'hover:bg-[#216f7d] text-white hover:text-white rounded-none! h-12 w-full px-4 group-data-[collapsible=icon]:w-full! group-data-[collapsible=icon]:h-12! group-data-[collapsible=icon]:px-0! transition-colors'
                            }
                        >
                            <Link
                                href={item.href}
                                prefetch
                                className="flex items-center w-full h-full gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
                            >
                                {item.icon && <item.icon className="w-5 h-5 shrink-0 group-data-[collapsible=icon]:!w-6 group-data-[collapsible=icon]:!h-6" />}
                                <span className="text-sm group-data-[collapsible=icon]:hidden">{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
