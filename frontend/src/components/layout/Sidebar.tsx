import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, ArrowLeftRight, History,
    User, Shield, LogOut
} from 'lucide-react';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/transfer', icon: ArrowLeftRight, label: 'Transfer' },
    { to: '/history', icon: History, label: 'Riwayat' },
    { to: '/profile', icon: User, label: 'Profil' },
];

export const Sidebar = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0">
            {/* Logo */}
            <div className="px-6 py-5 border-b border-slate-700">
                <h1 className="text-xl font-bold text-white">SecureBank</h1>
                <p className="text-xs text-slate-400 mt-0.5">Perbankan + Blockchain</p>
            </div>

            {/* User info */}
            <div className="px-6 py-4 border-b border-slate-700">
                <p className="text-sm font-medium text-white">{user?.nama}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
                <span className={`
          inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium
          ${isAdmin ? 'bg-orange-900 text-orange-300' : 'bg-blue-900 text-blue-300'}
        `}>
                    {isAdmin ? 'Admin' : 'Nasabah'}
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
              ${isActive
                                ? 'bg-blue-600 text-white font-medium'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }
            `}
                    >
                        <Icon className="h-4 w-4 shrink-0" />
                        {label}
                    </NavLink>
                ))}

                {isAdmin && (
                    <NavLink
                        to="/admin"
                        className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
              ${isActive
                                ? 'bg-orange-600 text-white font-medium'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }
            `}
                    >
                        <Shield className="h-4 w-4 shrink-0" />
                        Admin Panel
                    </NavLink>
                )}
            </nav>

            {/* Logout */}
            <div className="px-3 py-4 border-t border-slate-700">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    Keluar
                </button>
            </div>
        </aside>
    );
};