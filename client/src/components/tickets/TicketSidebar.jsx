import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import CreateTicketModal from './CreateTicketModal';

const TicketSidebar = ({ userRole = 4 }) => {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navLinks = [
    { label: 'My Tickets', path: '/tickets/my-tickets', icon: 'fa-solid fa-ticket', roles: [2, 3, 4, 5, 6] },
        { label: 'Escalated Tickets', path: '/tickets/escalated', icon: 'fa-solid fa-fire', roles: [1, 2, 3] },

    
    // Super Admin Links
    { label: 'All Tenant Tickets', path: '/tickets/all', icon: 'fa-solid fa-globe', roles: [1] }

    
    
  ];

  const visibleLinks = navLinks.filter(link => link.roles.includes(userRole));

  return (
    <aside className="w-56 bg-slate-100 text-slate-600 flex flex-col justify-between shrink-0 border-r border-slate-200">
      <div>
        {/* Logo */}
        <div className="h-14 flex items-center px-4 text-slate-900 font-bold text-lg border-b border-slate-200 bg-slate-100">
          Teamo Ticket System
        </div>

        <div className="px-4 py-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-[#ff0066] hover:bg-[#e0005a] text-white font-medium px-4 py-2.5 rounded-md shadow-sm text-sm transition-colors"
          >
            <i className="fa-solid fa-plus"></i> Raise Ticket
          </button>
        </div>

        {/* Nav Links */}
        <nav className="mt-3 space-y-0.5">
          {![4, 5, 6].includes(userRole) && (
            <Link to="/tickets" className={`flex items-center px-6 py-2.5 transition-colors ${location.pathname === '/tickets' ? 'bg-slate-200 text-slate-900 font-semibold border-l-4 border-[#ff0066]' : 'hover:bg-slate-200/70 hover:text-slate-900'}`}>
              <i className={`fa-solid fa-gauge w-6 ${location.pathname === '/tickets' ? 'text-[#ff0066]' : 'text-slate-400'}`}></i> Dashboard
            </Link>
          )}
          
          {visibleLinks.map((link, index) => {
             const isActive = location.pathname.includes(link.path);
             return (
              <Link key={index} to={link.path} className={`flex items-center px-6 py-2.5 transition-colors ${isActive ? 'bg-slate-200 text-slate-900 font-semibold border-l-4 border-[#ff0066]' : 'hover:bg-slate-200/70 hover:text-slate-900'}`}>
                <i className={`${link.icon} w-6 ${isActive ? 'text-[#ff0066]' : 'text-slate-400'}`}></i> {link.label}
              </Link>
             )
          })}
        </nav>
      </div>

      <div className="w-full text-center pb-6 pt-2 text-[10px] text-gray-500 font-medium tracking-wide">
        A <span className="font-bold">TEAMO</span> product
      </div>

      <CreateTicketModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          setIsModalOpen(false);
          window.dispatchEvent(new Event('ticketCreated'));
        }}
      />
    </aside>
  );
};

export default TicketSidebar;
