import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/auth/Login';
import { Dashboard } from './pages/Dashboard';
import { Agenda } from './pages/Agenda';
import { Pacientes } from './pages/Pacientes';
import { Prontuarios } from './pages/Prontuarios';
import { Financeiro } from './pages/Financeiro';
import { Relatorios } from './pages/Relatorios';
import { Configuracoes } from './pages/Configuracoes';

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Navigate to="/login" replace />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/agenda/*" element={<Agenda />} />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route path="/pacientes/*" element={<Pacientes />} />
          <Route path="/prontuarios" element={<Prontuarios />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/configuracoes/*" element={<Configuracoes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
