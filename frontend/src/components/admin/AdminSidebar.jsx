import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Users,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

const AdminSidebar = () => {
  const links = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: ShoppingBag },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Users', path: '/admin/users', icon: Users },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-50 dark:bg-dark-900 border-r border-slate-200 dark:border-dark-800 md:min-h-[calc(100vh-4rem)] flex flex-col p-4 shrink-0 transition-colors duration-300">
      <div className="flex items-center gap-2 px-3 py-4 border-b border-slate-200 dark:border-dark-800 mb-6 transition-colors duration-300">
        <Sparkles size={18} className="text-primary-600 dark:text-primary-400" />
        <span className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Management Portal
        </span>
      </div>

      <nav className="space-y-1 flex-grow">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-primary-600/10 border border-primary-500/20 text-primary-600 dark:text-primary-400'
                    : 'border border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {link.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-slate-200 dark:border-dark-800 mt-6 transition-colors duration-300">
        <Link
          to="/shop"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800 hover:text-slate-900 dark:hover:text-white transition-all border border-transparent"
        >
          <ArrowLeft size={16} />
          Back to Store
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
