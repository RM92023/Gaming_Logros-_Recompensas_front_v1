import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Panel Principal', icon: 'dashboard' },
  { path: '/achievements', label: 'Logros', icon: 'emoji_events' },
  { path: '/rewards', label: 'Recompensas', icon: 'redeem' },
  { path: '/leaderboard', label: 'Clasificación', icon: 'leaderboard' },
  // { path: '/notifications', label: 'Notificaciones', icon: 'notifications' },
];

export default function Sidebar() {
  const user = useAuthStore((state) => state.user);

  return (
    <aside className="w-64 bg-gray-900/50 backdrop-blur-xl border-r border-purple-500/20 flex flex-col">
      {/* Logo / Brand */}
      <div className="p-6 border-b border-purple-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-2xl">sports_esports</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">Gaming Hub</h1>
            <p className="text-purple-300 text-xs">Sistema de Logros</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/50 shadow-lg shadow-purple-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`material-symbols-outlined ${
                    isActive ? 'text-purple-400' : 'text-gray-500 group-hover:text-purple-400'
                  }`}
                >
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile at Bottom */}
      <div className="p-4 border-t border-purple-500/20">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-purple-500/20">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm truncate">{user?.username}</p>
            <p className="text-gray-400 text-xs truncate">{user?.email}</p>
          </div>
          <span className="material-symbols-outlined text-gray-400 text-lg">
            more_vert
          </span>
        </div>
      </div>
    </aside>
  );
}
