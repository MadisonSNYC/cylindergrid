import { useEffect, useRef } from 'react';
import Portal from './Portal';
import type { LabProject } from '../../data/labProjects';
import useReducedMotionPref from '../../hooks/useReducedMotionPref';

interface LightboxProps {
  open: boolean;
  onClose: () => void;
  project: LabProject | null;
}

export default function Lightbox({ open, onClose, project }: LightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<Element | null>(null);
  const prefersReducedMotion = useReducedMotionPref();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (open) {
      // Save current focus
      lastFocused.current = document.activeElement;
      // Add ESC handler
      document.addEventListener('keydown', onKey);
      // Focus close button after a tick
      setTimeout(() => {
        dialogRef.current?.querySelector<HTMLButtonElement>('[data-testid="lightbox-close"]')?.focus();
      }, 0);
      // Lock body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Cleanup
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      // Restore focus
      if (lastFocused.current instanceof HTMLElement) {
        lastFocused.current.focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  // Focus trap implementation
  useEffect(() => {
    if (!open || !dialogRef.current) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = dialogRef.current!.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [open]);

  if (!open || !project) return null;

  const onBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <Portal>
      <div
        data-testid="lightbox"
        onClick={onBackdropClick}
        className={`lightbox-backdrop ${prefersReducedMotion ? 'no-motion' : ''}`}
        aria-hidden={false}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-title"
          aria-describedby="lightbox-desc"
          className={`lightbox-dialog ${prefersReducedMotion ? 'no-motion' : ''}`}
        >
          <button
            data-testid="lightbox-close"
            onClick={onClose}
            className="lightbox-close"
            aria-label="Close dialog (Escape key)"
          >
            ✕
          </button>
          <h2 id="lightbox-title" className="sr-only">
            {project.title}
          </h2>
          <div id="lightbox-desc" className="sr-only">
            Project preview image for {project.title}
          </div>
          <img
            src={project.thumbSrc}
            alt={project.alt ?? project.title}
            className="lightbox-image"
            loading="eager"
          />
          <div className="lightbox-caption">
            <h3>{project.title}</h3>
            <a href={project.href} className="lightbox-link" rel="noopener noreferrer">
              View Project →
            </a>
          </div>
        </div>
      </div>
    </Portal>
  );
}