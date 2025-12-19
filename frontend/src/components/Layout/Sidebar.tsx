import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiDollarSign,
  FiPieChart,
  FiTarget,
  FiCreditCard,
  FiUsers,
  FiTrendingUp,
  FiFileText,
  FiSettings,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiBook,
} from 'react-icons/fi';
import clsx from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { path: '/app/dashboard', icon: FiHome, label: 'Dashboard' },
  { path: '/app/transactions', icon: FiDollarSign, label: 'Transactions' },
  { path: '/app/contacts', icon: FiBook, label: 'Contacts' },
  { path: '/app/savings', icon: FiTarget, label: 'Savings Goals' },
  { path: '/app/loans', icon: FiCreditCard, label: 'Loans' },
  { path: '/app/groups', icon: FiUsers, label: 'Bill Sharing' },
  { path: '/app/campaigns', icon: FiTrendingUp, label: 'Campaigns' },
  { path: '/app/analytics', icon: FiPieChart, label: 'Analytics' },
  { path: '/app/reports', icon: FiFileText, label: 'Reports' },
  { path: '/app/settings', icon: FiSettings, label: 'Settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose}></div>
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          isCollapsed ? 'lg:w-20' : 'w-64'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 lg:hidden">
          <span className="text-xl font-bold text-indigo-600">FinLedger</span>
          <button onClick={onClose} className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Desktop collapse toggle */}
        <div className="hidden lg:flex items-center justify-end h-16 px-4 border-b border-gray-200">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <FiChevronRight className="h-5 w-5" /> : <FiChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onClose()}
              className={({ isActive }) =>
                clsx(
                  'flex items-center px-4 py-3 rounded-lg transition-colors',
                  isCollapsed ? 'justify-center' : 'space-x-3',
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                )
              }
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
