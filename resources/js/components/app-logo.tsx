import logoHorizontal from '@/assets/logo-unifap.png';
import logoSquare from '@/assets/logo-quadrada-unifap.png';

export default function AppLogo() {
    return (
        <div className="flex h-12 items-center justify-center">
            {/* Logo horizontal para sidebar aberta ou header do mobile */}
            <img
                src={logoHorizontal}
                alt="Logo Unifap"
                className="h-10 object-contain block group-data-[state=collapsed]:hidden"
            />
            {/* Logo quadrada para sidebar fechada */}
            <img
                src={logoSquare}
                alt="Logo Unifap"
                className="w-8 h-8 object-contain hidden group-data-[state=collapsed]:block"
            />
        </div>
    );
}
