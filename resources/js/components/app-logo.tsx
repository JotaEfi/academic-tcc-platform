import logoHorizontal from '@/assets/logo-unifap.png';
import logoSquare from '@/assets/logo-quadrada-unifap.png';
import { useSidebar } from '@/components/ui/sidebar';

export default function AppLogo() {
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    return (
        <div className="flex h-12 items-center justify-center transition-all duration-200">
            {isCollapsed ? (
                <img
                    src={logoSquare}
                    alt="Logo Unifap"
                    className="w-8 h-8 object-contain animate-fade-in"
                />
            ) : (
                <img
                    src={logoHorizontal}
                    alt="Logo Unifap"
                    className="h-10 object-contain animate-fade-in"
                />
            )}
        </div>
    );
}
