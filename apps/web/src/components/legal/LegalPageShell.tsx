import React from 'react';
import Link from 'next/link';
import { PageFrame } from '@/components/frame';
import { HeaderShell } from '@/components/header/HeaderShell';
import { SiteFooter } from '@/components/footer/SiteFooter';
import { PageIntro } from '@/components/ui/PageIntro';
import styles from './LegalPageShell.module.css';

export interface LegalSection {
  id: string;
  number: string;
  title: string;
  content: React.ReactNode;
}

interface LegalPageShellProps {
  title: string;
  /** Kept for the page data; no longer rendered. */
  supportingLine?: string;
  lastUpdated: string;
  sections: LegalSection[];
  currentPath: '/privacy' | '/terms' | '/cookies';
}

const POLICIES = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms & Conditions' },
  { href: '/cookies', label: 'Cookie Policy' },
] as const;

export function LegalPageShell({
  title,
  lastUpdated,
  sections,
  currentPath,
}: LegalPageShellProps) {
  return (
    <PageFrame>
      <HeaderShell />
      <main className="flex flex-1 flex-col">
        <div className="site-container">
          <PageIntro title={title}>
            <p className={styles.updated}>Last updated {lastUpdated}</p>
          </PageIntro>

          <div className={styles.layout}>
            <nav className={styles.toc} aria-label="On this page">
              <ol>
                {sections.map((sec) => (
                  <li key={sec.id}>
                    <a href={`#${sec.id}`}>{sec.title}</a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className={styles.document}>
              {sections.map((sec) => (
                <section key={sec.id} id={sec.id} className={styles.section}>
                  <span className={styles.number}>{sec.number}</span>
                  <h2>{sec.title}</h2>
                  <div className={styles.content}>{sec.content}</div>
                </section>
              ))}

              <nav className={styles.related} aria-label="Related policies">
                <div>
                  {POLICIES.map((policy) =>
                    policy.href === currentPath ? (
                      <span key={policy.href} aria-current="page">
                        {policy.label}
                      </span>
                    ) : (
                      <Link key={policy.href} href={policy.href}>
                        {policy.label}
                      </Link>
                    ),
                  )}
                  <Link href="/warranty">Warranty verification →</Link>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </PageFrame>
  );
}
