import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { LayoutGrid, FolderOpen, Users, Upload, BarChart3, GraduationCap } from 'lucide-react';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const role = auth.user?.role;

    let items = mainNavItems;

    if (role === 'admin') {
        items = [
            {
                title: 'Dashboard',
                href: '/admin/dashboard',
                icon: LayoutGrid,
            },
            {
                title: 'TCCs',
                href: '/admin/tccs',
                icon: FolderOpen,
            },
            {
                title: 'Professores',
                href: '/admin/professors',
                icon: Users,
            },
            {
                title: 'Importar Dados',
                href: '/admin/import',
                icon: Upload,
            },
            {
                title: 'Ver Resultados',
                href: '/admin/evaluated-tccs',
                icon: BarChart3,
            },
        ];
    } else if (role === 'professor') {
        items = [
            {
                title: 'Painel do Professor',
                href: '/professor/dashboard',
                icon: GraduationCap,
            },
        ];
    }

    return (
        <Sidebar collapsible="icon" variant="sidebar" className="border-r border-sidebar-border/50">
            <SidebarContent className="bg-[#2F506C] dark:bg-sidebar text-white dark:text-sidebar-foreground [--sidebar-foreground:oklch(0.985_0_0)] dark:[--sidebar-foreground:var(--sidebar-foreground)] [--sidebar-accent:rgba(255,255,255,0.15)] dark:[--sidebar-accent:var(--sidebar-accent)] [--sidebar-accent-foreground:oklch(0.985_0_0)] dark:[--sidebar-accent-foreground:var(--sidebar-accent-foreground)] [--sidebar-border:rgba(255,255,255,0.1)] dark:[--sidebar-border:var(--sidebar-border)]">
                <NavMain items={items} />
            </SidebarContent>
        </Sidebar>
    );
}
