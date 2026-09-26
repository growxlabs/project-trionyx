import Image from 'next/image';
import { SectionFrame } from '../frame';
import styles from './GrapheneSection.module.css';

export function GrapheneSection() {
  return (
    <SectionFrame id="graphene" className={styles.section} aria-labelledby="graphene-heading">
      <Image
        src="/images/graphene/mountain-bridge-cars.png"
        alt="Two cars crossing a mountain bridge at golden hour"
        fill
        sizes="100vw"
        className={styles.image}
      />
      <div className={styles.shade} aria-hidden="true" />
      <div className={styles.copy}>
        <h2 id="graphene-heading" className={styles.title}>Graphene</h2>
        <p className={styles.subtitle}>
          A considered approach to car care, made for the roads ahead.
        </p>
      </div>
    </SectionFrame>
  );
}
