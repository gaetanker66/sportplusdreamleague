import logo from '../../images/logo.avif';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-12 items-center justify-center rounded-md overflow-hidden">
                <img 
                    src={logo} 
                    alt="Sport Plus Dream League" 
                    className="w-full h-full object-contain"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    Sport Plus Dream League
                </span>
            </div>
        </>
    );
}
