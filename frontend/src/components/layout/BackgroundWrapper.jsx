import React from 'react';

function BackgroundWrapper() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[var(--c-deep)]">
   
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(139,92,246,0.08),transparent_70%)]" />

      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[140px] animate-[pulse_10s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-fuchsia-600/0.07 blur-[140px] animate-[pulse_15s_ease-in-out_infinite_reverse]" />
      
   
      <div className="absolute top-[20%] left-[30%] w-[500px] h-[500px] bg-purple-500/0.04 rounded-full blur-[180px]" />
      <div 
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), 
                            linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse at 50% 50%, black, transparent 80%)'
        }}
      />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,var(--c-deep)_100%)]" />
    </div>
  );
}

export default BackgroundWrapper;