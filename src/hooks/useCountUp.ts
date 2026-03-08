import { useEffect, useRef, useState } from 'react';

export function useCountUp(end: number, duration = 800) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    if (typeof end !== 'number' || isNaN(end)) {
      setValue(0);
      return;
    }

    const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      setValue(end * easeOutExpo(progress));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setValue(end);
      }
    };

    startTimeRef.current = undefined;
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [end, duration]);

  return value;
}
