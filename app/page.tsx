import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="text-2xl font-bold text-blue-600">FisioDesk</div>
            <div className="space-x-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Entrar
              </Link>
              <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Começar Grátis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Sistema completo para gestão de clínicas
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Agenda organizada, prontuário eletrônico, financeiro controlado e muito mais.
            Tudo o que você precisa para aumentar a produtividade do seu negócio.
          </p>
          <div className="space-x-4">
            <Link href="/register" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700">
              Testar Grátis
            </Link>
            <Link href="#features" className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold border border-blue-600 hover:bg-blue-50">
              Ver Funcionalidades
            </Link>
          </div>
        </div>

        <div id="features" className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Funcionalidades Completas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-3xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-2">Agenda Inteligente</h3>
              <p className="text-gray-600">
                Gerencie seus atendimentos de forma prática e organizada.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-3xl mb-4">👤</div>
              <h3 className="text-xl font-semibold mb-2">Gestão de Pacientes</h3>
              <p className="text-gray-600">
                Prontuário eletrônico completo e histórico detalhado.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2">Financeiro</h3>
              <p className="text-gray-600">
                Controle total de receitas, despesas e relatórios.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Relatórios</h3>
              <p className="text-gray-600">
                Análises detalhadas para tomar decisões melhores.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-3xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">Aplicativo</h3>
              <p className="text-gray-600">
                Acesse de qualquer lugar, a qualquer hora.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Segurança</h3>
              <p className="text-gray-600">
                Dados protegidos com criptografia de ponta.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
          <p>© 2024 FisioDesk. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
