import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AddTransaction from './pages/AddTransaction';
import Transactions from './pages/Transactions';
import Stats from './pages/Stats';
import Budget from './pages/Budget';
import Categories from './pages/Categories';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen pb-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<AddTransaction />} />
          <Route path="/edit/:id" element={<AddTransaction />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-pink-100 shadow-lg">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          <NavItem href="/" icon="🏠" label="首页" />
          <NavItem href="/add" icon="➕" label="记账" />
          <NavItem href="/transactions" icon="📋" label="账单" />
          <NavItem href="/stats" icon="📊" label="统计" />
          <NavItem href="/budget" icon="💴" label="预算" />
        </div>
      </nav>
    </BrowserRouter>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <a
      href={href}
      className="flex flex-col items-center justify-center w-16 h-full text-pink-500 hover:text-pink-600 transition-colors"
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs mt-0.5">{label}</span>
    </a>
  );
}

export default App;