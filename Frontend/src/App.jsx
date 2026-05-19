import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Mail, Activity, Settings, Bell, Search, Sun, Moon, ClipboardList, Plus, Menu, X } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import LeadAnalyzer from './pages/LeadAnalyzer';
import LeadForm from './pages/LeadForm';
import Activities from './pages/Activities';
import HotelOfferConfiguration from './pages/HotelOfferConfiguration';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Lead Analyzer', icon: <Users size={20} />, path: '/leads' },
    { name: 'Hotel Offers', icon: <Plus size={20} />, path: '/configuration' },
    { name: 'Activities', icon: <Activity size={20} />, path: '/activities' },
  ];

  const handleNavClick = () => {
    // Close sidebar on mobile when a nav item is clicked
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-[256px] bg-[#040183] border-none rounded-none h-screen fixed left-0 top-0 flex flex-col p-4 z-20 shadow-xl transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:relative md:translate-x-0`}>
        <div className="flex items-center justify-between mb-10 px-2 mt-4 md:mt-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-white flex items-center justify-center text-[#040183] font-bold text-xl">
              LN
            </div>
            <h1 className="text-xl font-bold text-white tracking-widest">
              Nurturing
            </h1>
          </div>
          <button
            className="md:hidden text-white hover:bg-white/10 p-2 rounded-md transition-all"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-300 ${isActive
                  ? 'bg-white/10 text-white font-semibold shadow-sm'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-white/10">
          <button className="flex items-center gap-3 px-4 py-3 rounded-md text-white/70 hover:text-white hover:bg-white/5 w-full transition-all">
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </button>
        </div>
      </aside>
    </>
  );
};

const Header = ({ isDark, setIsDark, isOpen, setIsOpen }) => {
  return (
    <header className="h-16 bg-white dark:bg-dark-900 border-b border-slate-200 dark:border-dark-700 fixed top-0 right-0 left-0 md:right-0 md:left-auto w-full md:w-[calc(100%-256px)] flex items-center justify-between px-4 md:px-8 z-10 shadow-sm">
      <div className="flex items-center gap-4 md:gap-0 md:w-96">
        <button
          className="md:hidden text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-700 p-2 rounded-md transition-all"
          onClick={() => setIsOpen(true)}
        >
          <Menu size={24} />
        </button>
        {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
        <input
          type="text"
          placeholder="Search leads, activities, emails..."
          className="input-field pl-10"
        /> */}
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        {/* <button
          onClick={() => setIsDark(!isDark)}
          className="relative text-slate-400 hover:text-primary-600 dark:hover:text-slate-200 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-dark-700"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button> */}

        {/* <button className="relative text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
          <Bell size={22} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary-500 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.8)]"></span>
        </button> */}
        <div className="hidden md:flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-dark-700/50">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Alex Jensen</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Sales Director</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-dark-700 border border-slate-300 dark:border-dark-600 flex items-center justify-center overflow-hidden">
            <img src="https://ui-avatars.com/api/?name=Alex+Jensen&background=4f46e5&color=fff" alt="User" />
          </div>
        </div>
        <div className="md:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-dark-700 border border-slate-300 dark:border-dark-600 flex items-center justify-center overflow-hidden">
            <img src="https://ui-avatars.com/api/?name=Alex+Jensen&background=4f46e5&color=fff" alt="User" />
          </div>
        </div>
      </div>
    </header>
  );
};

function App() {
  const [isDark, setIsDark] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <Router>
      <div className="relative w-full min-h-screen overflow-x-hidden bg-[#f4f7fa] dark:bg-dark-900 text-slate-800 dark:text-slate-200 flex">

        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <Header isDark={isDark} setIsDark={setIsDark} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        <main className="w-full md:w-[calc(100%-256px)] md:ml-auto pt-[80px] p-4 md:p-8 min-h-screen relative">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leads" element={<LeadAnalyzer />} />
            <Route path="/leads/new" element={<LeadForm />} />
            <Route path="/leads/new/:id" element={<LeadForm />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/configuration" element={<HotelOfferConfiguration />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
