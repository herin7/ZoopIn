import { LayoutDashboard, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardHeader = ({ roleLabel, onLogout }) => {
  return (
    <div className="border-[4px] border-black bg-white p-6 md:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-black p-1.5 rounded-lg shadow-[3px_3px_0px_0px_rgba(244,255,0,1)]">
            <LayoutDashboard className="text-zoop-yellow" size={20} />
          </div>
          <span className="text-sm font-black uppercase tracking-widest text-black/40">{roleLabel} Control Center</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none mb-4">
          Dashing <br className="md:hidden" /> <span className="bg-zoop-yellow px-2">Performance.</span>
        </h1>
        <p className="max-w-2xl text-lg font-bold text-black/60 leading-tight">
          Create drops, blast the feed, and own the live marketplace.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <motion.a
          whileHover={{ scale: 1.1, rotate: -5 }}
          whileTap={{ scale: 0.9 }}
          href="https://github.com/herin7/ZoopIn"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white border-2 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-zoop-yellow transition-all text-black"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
        </motion.a>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onLogout}
          className="flex items-center gap-2 border-2 border-black bg-black px-6 py-3 text-sm font-black uppercase italic text-white shadow-[6px_6px_0px_0px_rgba(244,255,0,1)]"
        >
          <LogOut size={16} /> Exit
        </motion.button>
      </div>
    </div>
  );
};

export default DashboardHeader;
