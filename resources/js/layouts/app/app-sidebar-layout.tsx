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
            <div className="flex flex-col min-h-screen w-full">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div className="flex flex-1 w-full overflow-hidden">
                    <AppSidebar />
                    <AppContent variant="sidebar" className="overflow-x-hidden">
                        {children}
                    </AppContent>
                </div>
            </div>
        </AppShell>
    );
}
