import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <AppShell variant="sidebar">
            <div className="flex min-h-screen w-full overflow-hidden bg-neutral-50 dark:bg-neutral-950">
                <AppSidebar />
                <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                    <AppContent variant="sidebar" className="overflow-x-hidden flex-1">
                        {children}
                    </AppContent>
                </div>
            </div>
        </AppShell>
    );
}
