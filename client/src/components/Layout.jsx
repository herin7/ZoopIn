import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import ToastContainer from './ToastContainer';

const Layout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-black selection:text-white">
      <ToastContainer />

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
};

export default Layout;
