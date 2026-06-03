import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

function NavCollapsibleItem({ 
    item, 
    page, 
    isIconMode, 
    toggleSidebar 
}: { 
    item: NavItem; 
    page: any; 
    isIconMode: boolean; 
    toggleSidebar: () => void; 
}) {
    const hasActiveChild = item.items?.some(
        (sub) => page.url === resolveUrl(sub.href)
    ) || false;
    
    const [isOpen, setIsOpen] = useState(hasActiveChild);

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="w-full border-b border-[#17a8bb]/60 last:border-b-0"
        >
            <SidebarMenuItem className="m-0 p-0">
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                        tooltip={{ children: item.title }}
                        onClick={() => {
                            if (isIconMode) {
                                toggleSidebar();
                                setIsOpen(true);
                            }
                        }}
                        className="w-full text-white hover:bg-[#216f7d] transition-colors rounded-none! h-14! px-4 flex items-center justify-between group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 cursor-pointer"
                    >
                        <div className="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
                            {item.icon && (
                                <item.icon className="w-5 h-5 shrink-0 text-cyan-300 group-data-[collapsible=icon]:!w-6 group-data-[collapsible=icon]:!h-6" />
                            )}
                            <span className="text-sm font-semibold group-data-[collapsible=icon]:hidden text-left flex-1">
                                {item.title}
                            </span>
                            <ChevronDown 
                                className={`w-4 h-4 text-cyan-200/80 transition-transform duration-300 group-data-[collapsible=icon]:hidden shrink-0 ${
                                    isOpen ? 'rotate-180' : ''
                                }`}
                            />
                        </div>
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="bg-[#24425a] group-data-[collapsible=icon]:hidden">
                    <div className="flex flex-col border-l-2 border-[#17a8bb]/50 ml-6 my-1">
                        {item.items?.map((subItem) => {
                            const isSubActive = page.url === resolveUrl(subItem.href);
                            return (
                                <Link
                                    key={subItem.title}
                                    href={subItem.href || '#'}
                                    prefetch
                                    className={`flex items-center gap-3 px-4 py-2.5 text-xs font-medium transition-colors ${
                                        isSubActive
                                            ? 'text-cyan-300 font-bold bg-[#216f7d]/50'
                                            : 'text-white/80 hover:text-white hover:bg-[#216f7d]/20'
                                    }`}
                                >
                                    {subItem.icon && <subItem.icon className="w-3.5 h-3.5 text-cyan-400/80 shrink-0" />}
                                    <span>{subItem.title}</span>
                                </Link>
                            );
                        })}
                    </div>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    );
}

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const { toggleSidebar, state } = useSidebar();
    const isIconMode = state === 'collapsed';

    return (
        <SidebarGroup className="p-0">
            <SidebarMenu className="gap-0 m-0 p-0">
                {items.map((item) => {
                    const hasChildren = item.items && item.items.length > 0;
                    
                    if (hasChildren) {
                        return (
                            <NavCollapsibleItem
                                key={item.title}
                                item={item}
                                page={page}
                                isIconMode={isIconMode}
                                toggleSidebar={toggleSidebar}
                            />
                        );
                    }

                    // Flat item (no children)
                    const isActive = page.url === resolveUrl(item.href);
                    return (
                        <SidebarMenuItem 
                            key={item.title} 
                            className={`border-b border-[#17a8bb]/60 last:border-b-0 m-0 p-0 ${
                                isActive ? 'bg-[#216f7d]' : 'hover:bg-[#216f7d] transition-colors'
                            }`}
                        >
                            <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                tooltip={{ children: item.title }}
                                className={isActive
                                    ? 'bg-transparent! text-white! font-bold rounded-none! h-14! w-full px-4 group-data-[collapsible=icon]:w-full! group-data-[collapsible=icon]:h-14! group-data-[collapsible=icon]:px-0! group-data-[collapsible=icon]:justify-center hover:bg-transparent!'
                                    : 'bg-transparent! hover:bg-transparent! text-white hover:text-white rounded-none! h-14! w-full px-4 group-data-[collapsible=icon]:w-full! group-data-[collapsible=icon]:h-14! group-data-[collapsible=icon]:px-0! group-data-[collapsible=icon]:justify-center'
                                }
                            >
                                <Link
                                    href={item.href || '#'}
                                    prefetch
                                    className="flex items-center w-full h-full gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
                                >
                                    {item.icon && (
                                        <item.icon className="w-5 h-5 shrink-0 text-cyan-300 group-data-[collapsible=icon]:!w-6 group-data-[collapsible=icon]:!h-6" />
                                    )}
                                    <span className="text-sm font-semibold group-data-[collapsible=icon]:hidden">{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
