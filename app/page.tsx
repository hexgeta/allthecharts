'use client';

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="bg-black h-screen" />;
  }

  return (
    <div className="min-h-screen py-8 flex flex-col items-center justify-center bg-black relative overflow-hidden">
      <AnimatePresence mode="wait">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              AllTheCharts
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
              Bringing real-world problems to life through clear interactive charts and statistics.
            </p>
            <p className="text-lg text-gray-400 mt-4">
              Built by <a href="https://x.com/hexgeta" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">@hexgeta</a>
            </p>
          </motion.div>
        </div>
      </AnimatePresence>
    </div>
  )
} 