'use client';

import Link from 'next/link';

// Cache the current year to avoid recalculating it on every render
const CURRENT_YEAR = new Date().getFullYear();

const Footer = () => {
  return (
    <footer className="w-full bg-black/60 px-4 py-8 border-t border-[rgba(255,255,255,0.2)] relative z-[100] mb-[90px] sm:mb-0">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
        <div className="col-span-1">
          <h3 className="text-s font-semibold mb-2">
            AllTheCharts {CURRENT_YEAR}
          </h3>
          <p className="text-sm text-[rgb(153,153,153)]">
            Donate:<span 
              className="break-all cursor-pointer hover:text-gray-300" 
              onClick={() => {
                navigator.clipboard.writeText('0x1F12DAE5450522b445Fe1882C4F8D2Cf67B38a43');
                const popup = document.createElement('div');
                popup.textContent = '✓ Copied!';
                popup.className = 'fixed bottom-4 left-4 bg-white text-black px-4 py-2 rounded-md text-sm z-[10000]';
                document.body.appendChild(popup);
                setTimeout(() => popup.remove(), 2000);
              }}
            >0x1F12DAE5450522b445Fe1882C4F8D2Cf67B38a43</span>
          </p>
        </div>
        <div className="col-span-1">
          <h3 className="text-s font-semibold mb-2">Links</h3>
          <ul className="text-sm space-y-1">
          <li><a href="https://x.com/all_the_charts" target="_blank" rel="noopener noreferrer" className="text-[rgb(153,153,153)] hover:text-gray-300">Twitter</a></li>

          </ul>
        </div>
        <div className="col-span-1">
          <h3 className="text-s font-semibold mb-2">Links2</h3>
          <ul className="text-sm space-y-1">

          </ul>
        </div>
        <div className="col-span-1">
          <h3 className="text-s font-semibold mb-2">Legal</h3>
          <ul className="text-sm space-y-1">

          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
