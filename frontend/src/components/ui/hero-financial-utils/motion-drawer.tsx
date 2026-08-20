import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

interface MotionDrawerProps {
  direction?: 'left' | 'right';
  width?: number;
  backgroundColor?: string;
  clsBtnClassName?: string;
  contentClassName?: string;
  btnClassName?: string;
  children: React.ReactNode;
}

export default function MotionDrawer({
  direction = 'left',
  width = 300,
  backgroundColor = '#ffffff',
  clsBtnClassName,
  contentClassName,
  btnClassName,
  children,
}: MotionDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={btnClassName || "p-2 rounded-lg border"}
      >
        <Menu size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Slide-out content panel */}
            <motion.div
              initial={{ x: direction === 'left' ? -width : width }}
              animate={{ x: 0 }}
              exit={{ x: direction === 'left' ? -width : width }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              style={{ width, backgroundColor }}
              className={`fixed top-0 bottom-0 ${
                direction === 'left' ? 'left-0' : 'right-0'
              } z-50 shadow-2xl p-6 flex flex-col gap-6 ${contentClassName || ''}`}
            >
              <div className="flex justify-end">
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-1.5 rounded-lg border ${clsBtnClassName || ''}`}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
