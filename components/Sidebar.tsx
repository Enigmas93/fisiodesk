'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/agenda', label: 'Agenda' },
    { href: '/pacientes', label: 'Pacientes' },
    { href: '/atendimentos', label: 'Atendimentos' },
    { href: '/financeiro', label: 'Financeiro' },
    { href: '/relatorios', label: 'Relatórios' },
    { href: '/configuracoes', label: 'Configurações' },
  ];

  return (
    <aside className="w-64 bg-gray-100 p-4 border-r">
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block p-2 rounded transition-colors ${
              pathname === item.href
                ? 'bg-blue-500 text-white'
                : 'hover:bg-blue-100'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
