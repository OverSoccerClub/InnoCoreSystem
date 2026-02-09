import { Outlet } from 'react-router-dom';
import { Building2 } from 'lucide-react';

const AuthLayout = () => {
    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2 h-screen overflow-hidden font-sans">
            {/* Left Side - Professional Branding */}
            <div className="hidden lg:flex relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex-col justify-between p-12 text-white">
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/50">
                        <Building2 size={20} className="text-white" />
                    </div>
                    <span className="text-xl font-semibold tracking-tight text-white">
                        InnoCore
                    </span>
                </div>

                <div className="relative z-10 max-w-lg mb-20">
                    <h1 className="text-4xl font-bold leading-tight mb-6 tracking-tight text-white">
                        Gestão Empresarial de Alta Performance
                    </h1>
                    <p className="text-lg text-slate-400 leading-relaxed">
                        Controle total sobre suas operações financeiras, estoque e vendas.
                        A ferramenta definitiva para escalabilidade e previsão.
                    </p>

                    <div className="mt-8 flex items-center gap-4">
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className={`w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-[10px] text-slate-300 font-medium`}>
                                    {i === 4 ? '+' : ''}
                                </div>
                            ))}
                        </div>
                        <span className="text-sm text-slate-500 font-medium">Confiança de +500 empresas</span>
                    </div>
                </div>

                <div className="relative z-10 flex justify-between items-center text-xs text-slate-500 font-medium w-full border-t border-slate-800 pt-6">
                    <span>© 2026 InnoCore Systems</span>
                    <div className="flex gap-6">
                        <span className="hover:text-slate-300 transition-colors cursor-pointer">Suporte</span>
                        <span className="hover:text-slate-300 transition-colors cursor-pointer">Documentação</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Form Container */}
            <div className="flex items-center justify-center bg-white p-6 relative">
                {/* Mobile Header (Visible only on small screens) */}
                <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
                        <Building2 size={16} className="text-white" />
                    </div>
                    <span className="font-bold text-slate-900">InnoCore</span>
                </div>

                <div className="w-full max-w-[400px] z-10">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
