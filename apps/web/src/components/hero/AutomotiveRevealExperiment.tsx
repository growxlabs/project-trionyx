import Image from 'next/image';
import styles from './AutomotiveRevealExperiment.module.css';

export function AutomotiveRevealExperiment() {
  return (
    <div className={styles.reveal}>
      <Image
        src="/images/hero/graphene-protected-vehicle.png"
        alt="Glossy black vehicle with hydrophobic water beading after automotive surface protection."
        fill
        sizes="(max-width: 767px) 90vw, (max-width: 1500px) 38vw, 560px"
        className={styles.surface}
        priority
      />
    </div>
  );
}
