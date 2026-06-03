import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem, type SharedData } from '@/types';
import { usePage, router } from '@inertiajs/react';
import { 
    LayoutGrid, 
    FolderOpen, 
    Users, 
    Upload, 
    BarChart3, 
    GraduationCap, 
    BookOpen, 
    Compass,
    Settings
} from 'lucide-react';
import AppLogo from '@/components/app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

export function AppSidebar() {
    const { auth, course_id, courses = [] } = usePage<any>().props;
    const role = auth.user?.role;

    const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.post('/course/switch', { course_id: e.target.value });
    };

    let items: NavItem[] = mainNavItems;

    if (role === 'admin') {
        items = [
            {
                title: 'Gestão Acadêmica',
                icon: GraduationCap,
                items: [
                    {
                        title: 'Disciplinas',
                        href: '/admin/subjects',
                        icon: BookOpen,
                    },
                    {
                        title: 'Turmas',
                        href: '/admin/classes',
                        icon: Users,
                    },
                ]
            },
            {
                title: 'Processo de TCC',
                icon: FolderOpen,
                items: [
                    {
                        title: 'Bancas de TCC',
                        href: '/admin/tccs',
                        icon: FolderOpen,
                    },
                    {
                        title: 'Resultados TCC',
                        href: '/admin/results',
                        icon: BarChart3,
                    },
                    {
                        title: 'Professores TCC',
                        href: '/admin/professors',
                        icon: Users,
                    },
                    {
                        title: 'Importar TCCs',
                        href: '/admin/import',
                        icon: Upload,
                    },
                ]
            },
            {
                title: 'Cadastro de Alunos',
                href: '/admin/students',
                icon: Users,
            },
        ];
    } else if (role === 'professor') {
        items = [
            // Scoped Academic Section
            {
                title: 'Minhas Turmas',
                href: '/professor/classes',
                icon: GraduationCap,
            },
            // Standalone specialized TCC Section
            {
                title: 'Bancas de TCC',
                href: '/professor/dashboard',
                icon: FolderOpen,
            },
        ];
    } else if (role === 'student') {
        items = [
            {
                title: 'Meu Boletim',
                href: '/student/dashboard',
                icon: GraduationCap,
            },
        ];
    }

    return (
        <Sidebar collapsible="icon" variant="sidebar" className="border-r border-sidebar-border/50">
            <SidebarContent className="bg-[#2F506C] dark:bg-sidebar text-white dark:text-sidebar-foreground [--sidebar-foreground:oklch(0.985_0_0)] dark:[--sidebar-foreground:var(--sidebar-foreground)] [--sidebar-accent:rgba(255,255,255,0.15)] dark:[--sidebar-accent:var(--sidebar-accent)] [--sidebar-accent-foreground:oklch(0.985_0_0)] dark:[--sidebar-accent-foreground:var(--sidebar-accent-foreground)] [--sidebar-border:rgba(255,255,255,0.1)] dark:[--sidebar-border:var(--sidebar-border)]">
                
                {/* Sidebar Header Logo */}
                <div className="flex items-center h-16 border-b border-[#17a8bb] px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 bg-[#24425a] dark:bg-sidebar-header">
                    <AppLogo />
                </div>

                <NavMain items={items} />
            </SidebarContent>
            {role === 'admin' && (
                <SidebarFooter className="p-0 border-t border-[#17a8bb] bg-[#2F506C]">
                    <SidebarMenu className="gap-0 m-0 p-0">
                        <SidebarMenuItem className="m-0 p-0 hover:bg-[#216f7d] transition-colors">
                            <SidebarMenuButton 
                                asChild 
                                tooltip="Acessar como Professor"
                                className="bg-transparent! hover:bg-transparent! text-white hover:text-white rounded-none! h-14! w-full px-4 group-data-[collapsible=icon]:w-full! group-data-[collapsible=icon]:h-14! group-data-[collapsible=icon]:px-0!"
                            >
                                <a 
                                    href="/professor/login" 
                                    className="flex items-center w-full h-full gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
                                >
                                    <GraduationCap className="w-5 h-5 shrink-0 group-data-[collapsible=icon]:!w-6 group-data-[collapsible=icon]:!h-6" />
                                    <span className="text-sm group-data-[collapsible=icon]:hidden">Acessar como Professor</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            )}
        </Sidebar>
    );
}
