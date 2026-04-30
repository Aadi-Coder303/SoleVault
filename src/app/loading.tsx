export default function Loading() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-white dark:bg-neutral-950">
      <div className="flex flex-col items-center gap-6">
        {/* Pulsing Minimal Logo */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-16 h-16 rounded-full border border-neutral-200 dark:border-neutral-800 animate-ping opacity-20" />
          <div className="absolute w-12 h-12 rounded-full border border-neutral-300 dark:border-neutral-700 animate-pulse opacity-40" />
          <div className="w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center shadow-lg animate-pulse" />
        </div>
        
        {/* Sleek Text */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400">Loading</p>
          <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-neutral-200 dark:via-neutral-800 to-transparent relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-1/3 bg-black dark:bg-white animate-[shimmer_1.5s_infinite_ease-in-out]" />
          </div>
        </div>
      </div>
    </div>
  );
}
