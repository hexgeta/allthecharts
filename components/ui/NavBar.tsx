'use client'

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

// Static component with revalidation
export const revalidate = 2592000; // 30 days in seconds

// Navigation links configuration
const NAV_LINKS = [
  { 
    href: '/crime/london', 
    label: 'Crime', 
    mobileLabel: 'Crime',
    hasDropdown: true,
    dropdownItems: [
      { href: '/crime/london', label: 'London' }
    ]
  },
];

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Helper function to determine if a link is active
  const isActive = (href: string) => pathname === href;

  // Helper function to get link classes
  const getLinkClasses = (href: string, isMobile = false) => {
    const baseClasses = "transition-colors";
    const desktopPadding = "px-3 py-3 rounded-md flex items-center gap-1";
    const mobilePadding = "block py-2";
    const activeClasses = isMobile 
      ? 'text-white cursor-default' 
      : 'text-white cursor-default';
    const inactiveClasses = isMobile 
      ? 'text-white/80 hover:text-white' 
      : 'text-[rgb(153,153,153)] hover:text-white';
    
    const padding = isMobile ? mobilePadding : desktopPadding;
    
    return cn(baseClasses, padding, isActive(href) ? activeClasses : inactiveClasses);
  };

  const handleDropdownEnter = (label: string) => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    setActiveDropdown(label);
  };

  const handleDropdownLeave = () => {
    const timeout = setTimeout(() => {
      setActiveDropdown(null);
    }, 150); // 150ms delay before closing
    setDropdownTimeout(timeout);
  };

  const handleDropdownToggle = (label: string) => {
    if (activeDropdown === label) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(label);
    }
  };

  useEffect(() => {
    const handleBannerVisibility = (event: CustomEvent) => {
      setIsBannerVisible(event.detail.isVisible);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('bannerVisibilityChange', handleBannerVisibility as EventListener);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('bannerVisibilityChange', handleBannerVisibility as EventListener);
      document.removeEventListener('mousedown', handleClickOutside);
      if (dropdownTimeout) {
        clearTimeout(dropdownTimeout);
      }
    };
  }, [dropdownTimeout]);

  return (
    <nav className={`w-full bg-black px-0 pt-0 pb-0 border-b-1 border-b border-[rgba(255,255,255,0.2)] relative z-[100] ${isBannerVisible ? 'md:mt-[52px]' : ''}`}>
      <div className="max-w-[1200px] mx-auto flex items-center justify-between relative">
        <Link 
          href="/" 
          className={cn(
            "font-bold text-xl relative z-[100] transition-colors px-4 py-4 rounded-md",
            isActive('/') 
              ? 'text-white cursor-default' 
              : 'text-[rgb(153,153,153)] hover:text-white'
          )}
        >
          AllTheCharts
        </Link>
        
        <div className="hidden sm:flex items-center justify-between flex-grow ml-6 relative z-[100]">
          <div className="flex items-center space-x-6 py-0">
            {NAV_LINKS.map((link) => (
              <div key={link.href} className="relative" ref={dropdownRef}>
                {link.hasDropdown ? (
                  <div>
                    <button
                      className={getLinkClasses(link.href)}
                      onClick={() => handleDropdownToggle(link.label)}
                      onMouseEnter={() => handleDropdownEnter(link.label)}
                      onMouseLeave={handleDropdownLeave}
                    >
                      {link.label}
                      <motion.div
                        animate={{ rotate: activeDropdown === link.label ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence>
                      {activeDropdown === link.label && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-3 w-64 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg shadow-xl overflow-hidden"
                          onMouseEnter={() => handleDropdownEnter(link.label)}
                          onMouseLeave={handleDropdownLeave}
                        >
                          <div className="p-2">
                            {link.dropdownItems?.map((item, itemIndex) => (
                              <Link
                                key={itemIndex}
                                href={item.href}
                                className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200"
                                onClick={() => setActiveDropdown(null)}
                              >
                                <div className="font-medium">{item.label}</div>
                                <div className="text-sm text-gray-500">Metropolitan Police Crime Data</div>
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link 
                    href={link.href} 
                    className={getLinkClasses(link.href)}
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* MOBILE VIEW */}
        <button
          className="sm:hidden flex flex-col justify-center items-center w-16 h-12 relative z-[100] bg-transparent border-0 p-0 touch-manipulation"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <div className="flex flex-col justify-center items-center space-y-1.5">
            <div className="w-6 h-0.5 bg-[rgb(153,153,153)] transition-all duration-200"></div>
            <div className="w-6 h-0.5 bg-[rgb(153,153,153)] transition-all duration-200"></div>
            <div className="w-6 h-0.5 bg-[rgb(153,153,153)] transition-all duration-200"></div>
          </div>
        </button>
      </div>
      
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-[150]"
          >
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="absolute right-2 top-2 h-auto w-64 bg-black bg-opacity-85 p-4 shadow-lg z-[160] border border-white/20 rounded-[10px]"
            >
              {NAV_LINKS.map((link) => (
                <div key={link.href}>
                  <Link 
                    href={link.href} 
                    className={getLinkClasses(link.href, true)}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.mobileLabel}
                  </Link>
                  {link.hasDropdown && link.dropdownItems && (
                    <div className="ml-4 mt-1 space-y-1">
                      {link.dropdownItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block py-2 text-white/60 hover:text-white text-sm transition-colors ml-4"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs text-white/40">Metropolitan Police Crime Data</div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default NavBar; 
