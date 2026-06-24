import { useEffect, useRef, useState } from 'react';

/**
 * useScrollReveal
 * Custom hook for scroll-triggered reveal animations using IntersectionObserver.
 *
 * @param {object} options
 * @param {number} [options.threshold=0.15] - How much of the element must be visible to trigger (0–1)
 * @param {boolean} [options.once=true] - If true, only triggers once and disconnects observer
 * @returns {{ ref: React.RefObject, isVisible: boolean }}
 */
const useScrollReveal = ({ threshold = 0.15, once = true } = {}) => {
  const ref = useRef(null);
  // 
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, once]);

  return { ref, isVisible };
};

export default useScrollReveal;
