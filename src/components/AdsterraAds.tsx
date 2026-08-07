import React from 'react';

/**
 * Adsterra 728x90 Leaderboard Banner Ad Component
 * Key: cfd635040e7d09a7be971b64f689659a
 */
export const AdsterraBanner728x90: React.FC<{ className?: string }> = ({ className = '' }) => {
  const srcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }
        </style>
      </head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key': 'cfd635040e7d09a7be971b64f689659a',
            'format': 'iframe',
            'height': 90,
            'width': 728,
            'params': {}
          };
        </script>
        <script type="text/javascript" src="https://www.highperformanceformat.com/cfd635040e7d09a7be971b64f689659a/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div className={`w-full max-w-4xl mx-auto overflow-hidden flex justify-center items-center my-2 sm:my-3 px-2 ${className}`}>
      <div className="w-full max-w-[728px] overflow-x-auto no-scrollbar flex justify-center items-center py-1 bg-white/40 rounded-xl border border-slate-100/60 shadow-2xs">
        <iframe
          title="Adsterra 728x90 Banner"
          srcDoc={srcDoc}
          width="728"
          height="90"
          className="border-0 overflow-hidden shrink-0 max-w-full"
          style={{ width: '728px', height: '90px', maxWidth: '100%' }}
          scrolling="no"
        />
      </div>
    </div>
  );
};

/**
 * Adsterra 300x250 Medium Rectangle Banner Ad Component
 * Key: ec2989e328396f402894fa94a7ab9487
 */
export const AdsterraBanner300x250: React.FC<{ className?: string }> = ({ className = '' }) => {
  const srcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }
        </style>
      </head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key': 'ec2989e328396f402894fa94a7ab9487',
            'format': 'iframe',
            'height': 250,
            'width': 300,
            'params': {}
          };
        </script>
        <script type="text/javascript" src="https://www.highperformanceformat.com/ec2989e328396f402894fa94a7ab9487/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div 
      className={`w-full max-w-[300px] mx-auto my-4 sm:my-5 flex justify-center items-center ${className}`}
      style={{ maxWidth: '300px', width: '100%', margin: '18px auto' }}
    >
      <iframe
        title="Adsterra 300x250 Banner"
        srcDoc={srcDoc}
        width="300"
        height="250"
        className="border-0 overflow-hidden shrink-0 max-w-full rounded-2xl shadow-xs"
        style={{ width: '300px', height: '250px', maxWidth: '100%' }}
        scrolling="no"
      />
    </div>
  );
};

/**
 * Adsterra Native Banner Ad Component
 * Container ID: container-50b2a36ba5457b83eb6264c1baedb91a
 */
export const AdsterraNativeAd: React.FC<{ className?: string }> = ({ className = '' }) => {
  const srcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; padding: 4px; font-family: system-ui, -apple-system, sans-serif; background: transparent; display: flex; flex-direction: column; align-items: center; }
          #container-50b2a36ba5457b83eb6264c1baedb91a { width: 100%; max-width: 100%; }
        </style>
      </head>
      <body>
        <div id="container-50b2a36ba5457b83eb6264c1baedb91a"></div>
        <script async="async" data-cfasync="false" src="https://pl30664532.effectivecpmnetwork.com/50b2a36ba5457b83eb6264c1baedb91a/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div className={`w-full max-w-2xl mx-auto overflow-hidden my-3 sm:my-4 p-2 bg-slate-50/80 rounded-2xl border border-slate-200/60 shadow-2xs text-center ${className}`}>
      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
        Sponsored Content
      </span>
      <iframe
        title="Adsterra Native Ad"
        srcDoc={srcDoc}
        className="w-full border-0 min-h-[140px] overflow-hidden rounded-xl"
        style={{ minHeight: '140px', width: '100%' }}
        scrolling="no"
      />
    </div>
  );
};

