import Image from 'next/image';
import Link from 'next/link';
import styles from './GrapheneSection.module.css';

const PRODUCTS = [
  {
    id: 'graphene',
    name: 'Graphene Coating',
    imageSrc: '/images/hero/graphene-protected-vehicle.png',
    imageAlt: 'Black car bonnet beaded with water after a graphene coating',
    href: '/products/graphene-coating',
  },
  {
    id: 'ceramic',
    name: 'Ceramic Coating',
    imageSrc: '/images/about/ceramic-coating-surface.jpg',
    imageAlt: 'Hydrophobic ceramic-coated paintwork with dense water beading',
    href: '/products/ceramic-coating',
  },
  {
    id: 'borophene',
    name: 'Borophene Coating',
    imageSrc: '/images/borophene/borophene-surface.jpg',
    imageAlt: 'Dark car body panel with a crystalline borophene finish',
    href: '/products/borophene-coating',
  },
];

/** The three coating lines, as photo tiles with a blurred caption. */
export function GrapheneSection() {
  return (
    <section id="graphene" className={styles.section} aria-labelledby="products-heading">
      <div className="site-container">
        <div className={styles.head}>
          <h2 id="products-heading">Protection, across three matrices.</h2>
          <Link className="text-link" href="/products">
            All products <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className={styles.grid}>
          {PRODUCTS.map((product) => (
            <Link key={product.id} href={product.href} className={styles.tile}>
              <Image src={product.imageSrc} alt={product.imageAlt} fill sizes="(max-width: 48rem) 100vw, 33vw" className={styles.image} />
              <div className={styles.blur} aria-hidden="true" />
              <div className={styles.caption}>
                <h3>{product.name}</h3>
                <span className={styles.arrow} aria-hidden="true">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
