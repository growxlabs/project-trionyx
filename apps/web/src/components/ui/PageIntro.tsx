import type { ReactNode } from 'react';
import styles from './PageIntro.module.css';

interface PageIntroProps {
  title: string;
  id?: string;
  children?: ReactNode;
}

/** Page header shared by the inner pages: one large heading. */
export function PageIntro({ title, id = 'page-title', children }: PageIntroProps) {
  return (
    <header className={styles.intro}>
      <h1 id={id} className={styles.title}>
        {title}
      </h1>
      {children}
    </header>
  );
}
