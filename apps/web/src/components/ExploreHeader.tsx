export function ExploreHeader({ active, description }: { active: 'Blog' | 'Gallery'; description: string }) {
  return (
    <header className="site-container pt-12 pb-8 sm:pt-16 sm:pb-10">
      <h1 className="text-4xl font-normal tracking-tight sm:text-5xl">{active}</h1>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-[var(--color-text-muted)]">{description}</p>
    </header>
  );
}
