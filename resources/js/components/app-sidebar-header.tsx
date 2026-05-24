import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType, type SharedData } from '@/types';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { usePage, Link } from '@inertiajs/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { ChevronDown } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { dashboard } from '@/routes';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();

    return (
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border/50 px-6 md:px-4 bg-white dark:bg-neutral-900">
            <div className="flex items-center gap-10">
                <Link href={dashboard()} prefetch className="flex items-center shrink-0">
                    <AppLogo />
                </Link>
            </div>
            <div className="flex items-center gap-4">
                <AppearanceToggleDropdown />
                
                <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800" />
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity outline-none">
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hidden sm:inline-block">
                                {auth.user.name}
                            </span>
                            <Avatar className="h-8 w-8 overflow-hidden rounded-full border border-neutral-200 dark:border-neutral-800">
                                <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                <AvatarFallback className="rounded-full bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                    {getInitials(auth.user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <ChevronDown className="h-4 w-4 text-neutral-500" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
