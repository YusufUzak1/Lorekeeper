import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TextMorphProps {
  initialText: string;
  morphText: string;
  className?: string;
  delay?: number;
  wordHints?: string[];
}

export function TextMorph({ initialText, morphText, className, delay = 3000, wordHints }: TextMorphProps) {
  const [isMorphed, setIsMorphed] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsMorphed(true);
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay]);

  const variants = {
    initial: { 
      opacity: 0, 
      filter: 'blur(10px)',
      y: 10
    },
    animate: { 
      opacity: 1, 
      filter: 'blur(0px)',
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
    },
    exit: { 
      opacity: 0, 
      filter: 'blur(10px)',
      y: -10,
      transition: { duration: 0.8, ease: [0.7, 0, 0.84, 0] } 
    }
  };

  return (
    <div className={cn("relative flex items-center justify-center w-full min-h-[120px]", className)}>
      <AnimatePresence mode="wait">
        {!isMorphed ? (
          <motion.div
            key="initial"
            {...({ variants, initial: "initial", animate: "animate", exit: "exit", className: "text-center w-full" } as any)}
          >
            {initialText}
          </motion.div>
        ) : (
          <motion.div
            key="morphed"
            {...({ variants, initial: "initial", animate: "animate", exit: "exit", className: "text-center text-mythos-accent font-serif tracking-widest cursor-default group w-full" } as any)}
          >
            <span className="group-hover:text-amber-200 transition-colors duration-500 drop-shadow-[0_0_15px_rgba(212,175,55,0.6)]">
              {morphText.split(' ').map((word, index) => (
                <span
                  key={`${word}-${index}`}
                  className="mx-[0.15em] inline-block"
                  title={wordHints?.[index]}
                >
                  {word}
                </span>
              ))}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
