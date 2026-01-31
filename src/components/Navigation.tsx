'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: '🏠' },
    { href: '/record', label: 'Record', icon: '🎤' },
    { href: '/history', label: 'History', icon: '📜' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <nav className="border-b bg-white dark:bg-neutral-900 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-900 dark:text-neutral-100">
                Voice Intelligence
              </span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-blue-500 text-gray-900 dark:text-neutral-100'
                        : 'border-transparent text-gray-500 dark:text-neutral-400 hover:border-gray-300 dark:hover:border-neutral-600 hover:text-gray-700 dark:hover:text-neutral-300'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="text-xs text-gray-500 dark:text-neutral-400">
              Ctrl+Shift+R to record
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
