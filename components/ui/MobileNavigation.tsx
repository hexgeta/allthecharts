'use client'

import { Home, PieChart } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'

// Static nav configuration - could be moved to constants
const NAV_ITEMS = [
  {
    icon: Home,
    label: 'Home',
    href: '/'
  },
  {
    icon: PieChart,
    label: 'Portfolio',
    href: '/portfolio'
  }
]

export default function MobileNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [activeButton, setActiveButton] = useState<string | null>(null)
  const [pressedButton, setPressedButton] = useState<string | null>(null)

  const handlePress = (href: string) => {
    // Immediately clear any previous active button and set new one
    setActiveButton(href)
    router.push(href)
  }

  const handleTouchStart = (identifier: string) => {
    setPressedButton(identifier)
  }

  const handleTouchEnd = () => {
    setPressedButton(null)
  }

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 w-screen bg-black/90 border-t border-white/20 z-[9999] h-[70px]">
      <div className="flex items-center justify-around py-3 px-4 w-full h-full">
        {NAV_ITEMS.map((item, index) => {
          const Icon = item.icon
          const identifier = item.href
          const isCurrentlyActive = activeButton === identifier
          const isPageActive = pathname === item.href
          const isPressed = pressedButton === identifier
          
          return (
            <motion.button
              key={item.href}
              onClick={() => handlePress(item.href)}
              onTouchStart={() => handleTouchStart(identifier)}
              onTouchEnd={handleTouchEnd}
              onMouseDown={() => handleTouchStart(identifier)}
              onMouseUp={handleTouchEnd}
              onMouseLeave={handleTouchEnd}
              className={`flex flex-col items-center justify-center p-4 rounded-lg min-w-[60px] ${
                isCurrentlyActive || isPageActive
                  ? 'text-white' 
                  : 'text-gray-400'
              }`}
              animate={{
                scale: isPressed ? 0.65 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
                duration: 0.15
              }}
            >
              <Icon size={22} />
            </motion.button>
          )
        })}
      </div>
    </div>
  )
} 