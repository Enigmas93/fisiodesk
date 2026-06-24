'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { signOut, user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <nav className="bg-blue-600 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">FisioDesk</h1>
        <div className="flex items-center space-x-4">
          <span>Olá, {user?.email}</span>
          <button 
            onClick={handleSignOut}
            className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}
