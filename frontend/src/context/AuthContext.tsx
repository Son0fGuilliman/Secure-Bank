import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, AuthContextType } from '../types';
import { setToken, clearToken } from '../api/client';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Restore session saat page refresh
    useEffect(() => {
        const savedToken = sessionStorage.getItem('sb_token');
        const savedUser = sessionStorage.getItem('sb_user');

        if (savedToken && savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser) as User;
                window.__accessToken = savedToken;
                setAccessToken(savedToken);
                setUser(parsedUser);
            } catch {
                sessionStorage.removeItem('sb_token');
                sessionStorage.removeItem('sb_user');
            }
        }
        setLoading(false);
    }, []);

    const login = (token: string, userData: User) => {
        setToken(token);
        setAccessToken(token);
        setUser(userData);
        // Simpan user ke sessionStorage juga
        sessionStorage.setItem('sb_user', JSON.stringify(userData));
    };

    const logout = () => {
        clearToken();
        setAccessToken(null);
        setUser(null);
    };

    // Tampilkan loading dulu sebelum cek session — mencegah flash redirect ke /login
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <p className="text-sm text-gray-400">Memuat sesi...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{
            user,
            accessToken,
            login,
            logout,
            isAuthenticated: !!accessToken,
            isAdmin: user?.role === 'admin',
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
    return ctx;
};