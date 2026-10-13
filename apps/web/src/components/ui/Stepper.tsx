'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import styles from './Stepper.module.css';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const subscribeReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};

interface StepperProps {
  count: number;
  active: number;
  onChange: (index: number) => void;
  label: string;
  /** Ids of the panels each step controls, in order. */
  controls?: readonly string[];
  /** Milliseconds per step. Omit to disable autoplay. */
  autoplay?: number;
}

/**
 * Fluid dot stepper: the active step stretches into a pill and, while autoplaying, fills over the step duration.
 * Autoplay pauses via the toggle, while keyboard focus is inside the parent section, or when scrolled off-screen.
 */
export function Stepper({ count, active, onChange, label, controls, autoplay }: StepperProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, () => window.matchMedia(REDUCED_MOTION).matches, () => false);
  // Until the viewer chooses, autoplay follows their reduced-motion preference.
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const paused = userPaused ?? reducedMotion;
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.4 });
    observer.observe(root);

    // Mouse clicks also move focus, so only keyboard focus (:focus-visible) holds the step.
    const scope = root.closest('section') ?? root;
    const onFocusIn = (event: FocusEvent) => setFocused((event.target as Element).matches(':focus-visible'));
    const onFocusOut = (event: FocusEvent) => {
      if (!scope.contains(event.relatedTarget as Node)) setFocused(false);
    };
    scope.addEventListener('focusin', onFocusIn as EventListener);
    scope.addEventListener('focusout', onFocusOut as EventListener);
    return () => {
      observer.disconnect();
      scope.removeEventListener('focusin', onFocusIn as EventListener);
      scope.removeEventListener('focusout', onFocusOut as EventListener);
    };
  }, []);

  const playing = Boolean(autoplay) && !paused && !focused && visible;

  useEffect(() => {
    if (!playing || !autoplay) return;
    const timer = window.setTimeout(() => onChange((active + 1) % count), autoplay);
    return () => window.clearTimeout(timer);
  }, [playing, autoplay, active, count, onChange]);

  const go = useCallback(
    (index: number, focus = false) => {
      onChange(index);
      if (focus) stepRefs.current[index]?.focus();
    },
    [onChange],
  );

  return (
    <div
      ref={rootRef}
      className={`${styles.stepper} ${autoplay ? styles.autoplay : ''} ${!playing ? styles.paused : ''}`}
      style={{ '--fill-duration': `${autoplay ?? 0}ms` } as React.CSSProperties}
    >
      <div className={styles.track} role="tablist" aria-label={label}>
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            ref={(el) => {
              stepRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            className={`${styles.step} ${i === active ? styles.active : ''}`}
            aria-selected={i === active}
            aria-controls={controls?.[i]}
            aria-label={`${i + 1} of ${count}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => go(i)}
            onKeyDown={(event) => {
              const last = count - 1;
              const next = { ArrowRight: i === last ? 0 : i + 1, ArrowLeft: i === 0 ? last : i - 1, Home: 0, End: last }[event.key];
              if (next === undefined) return;
              event.preventDefault();
              go(next, true);
            }}
          >
            <span className={styles.dot} aria-hidden="true">
              {i === active && playing && <span className={styles.fill} />}
            </span>
          </button>
        ))}
      </div>
      {autoplay && (
        <button
          type="button"
          className={styles.toggle}
          aria-pressed={paused}
          aria-label={paused ? 'Play autoplay' : 'Pause autoplay'}
          onClick={() => setUserPaused(!paused)}
        >
          {paused ? (
            <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M3 2v8l7-4z" fill="currentColor" /></svg>
          ) : (
            <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><rect x="2.5" y="2" width="2" height="8" fill="currentColor" /><rect x="7.5" y="2" width="2" height="8" fill="currentColor" /></svg>
          )}
        </button>
      )}
    </div>
  );
}
