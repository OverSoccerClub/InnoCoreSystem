import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input } from '../components/ui';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useDialog } from '../contexts/DialogContext';
import { usePageTitle } from '../hooks/usePageTitle';

const LoginPage = () => {
    usePageTitle('Login');
    const dialog = useDialog();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/app';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login({ email, password });
            dialog.success({
                title: 'Bem-vindo!',
                message: 'Login realizado com sucesso.'
            });
            setTimeout(() => {
                navigate(from, { replace: true });
            }, 1000);
        } catch (err: any) {
            dialog.error({
                title: 'Erro de Login',
                message: err.message || 'Credenciais inválidas. Verifique seu email e senha.'
            });
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Acesse sua conta</h2>
                <p className="text-sm text-muted-foreground mt-2">
                    Digite suas credenciais corporativas para continuar.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                    label="Email"
                    type="email"
                    placeholder="nome@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={<Mail size={18} />}
                    fullWidth
                    required
                />

                <div>
                    <Input
                        label="Senha"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        leftIcon={<Lock size={18} />}
                        rightIcon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        onRightIconClick={() => setShowPassword(!showPassword)}
                        fullWidth
                        required
                    />
                    <div className="flex justify-end mt-2">
                        <a href="#" className="text-xs font-medium text-primary hover:text-primary/80 hover:underline">
                            Esqueceu a senha?
                        </a>
                    </div>
                </div>

                <div className="pt-2">
                    <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        isLoading={isLoading}
                        rightIcon={!isLoading && <ArrowRight size={18} />}
                        className="h-11 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
                    >
                        Entrar na Plataforma
                    </Button>
                </div>
            </form>

            <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                    Ainda não tem acesso? <a href="#" className="font-semibold text-primary hover:underline">Solicite aqui</a>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
