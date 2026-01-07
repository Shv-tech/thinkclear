'use client';

import { useEffect, useState } from 'react';

export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => entry.isIntersecting && setActive(id),
        { threshold: 0.55 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach(o => o.disconnect());
  }, [ids]);

  return active;
}
