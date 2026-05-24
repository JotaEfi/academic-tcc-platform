import logo from '/resources/js/assets/logo-quadrada-unifap.png';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8">
                <img src={logo} alt="Logo Unifap" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    Avalia TCC
                </span>
            </div>
        </>
    );
}
