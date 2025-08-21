import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Portal({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  
  useEffect(() => {
    setTarget(document.body);
  }, []);
  
  return target ? createPortal(children, target) : null;
}