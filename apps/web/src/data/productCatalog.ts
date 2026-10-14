export interface ProductVariant {
  name: string;
  imageSrc: string;
  imageAlt: string;
  description: string;
  productCode?: string;
  enquireProduct: string;
}

export interface ProductCharacteristic {
  title: string;
  description: string;
}

export interface ProductTechnicalSpec {
  label: string;
  value: string;
}

export interface ProductApplicationStep {
  step: string;
  title: string;
  description: string;
}

export interface CoatingProductData {
  id: string;
  slug: string;
  name: string;
  heroStatement: string;
  heroImage: string;
  heroImageAlt: string;
  introHeading: string;
  introDescription: string;
  characteristics: ProductCharacteristic[];
  variantsTitle?: string;
  variants: ProductVariant[];
  specifications: ProductTechnicalSpec[];
  applicationSteps: ProductApplicationStep[];
}

export const COATING_PRODUCTS: Record<string, CoatingProductData> = {
  'ceramic-coating': {
    id: 'ceramic',
    slug: 'ceramic-coating',
    name: 'Ceramic Coating',
    heroStatement:
      'High-clarity protective clearcoat formulation engineered for molecular surface bonding and deep gloss retention.',
    heroImage: '/images/about/ceramic-coating-surface.jpg',
    heroImageAlt: 'Hydrophobic ceramic-coated paintwork with dense water beading',
    introHeading: 'Molecular surface bond. Uncompromising optical clarity.',
    introDescription:
      'Trionyx Ceramic Coating forms a semi-permanent clear protective shield over automotive clearcoats. Engineered for deep gloss retention, UV stability, and hydrophobic water-beading performance across demanding environmental conditions.',
    characteristics: [
      {
        title: 'Surface Defense',
        description:
          'Molecular bonding creates a resilient hydrophobic barrier that shields clearcoats from environmental fallout and UV degradation.',
      },
      {
        title: 'Hydrophobic Tension',
        description:
          'High water contact angle produces tight, spherical beading that sheets road grime and water away effortlessly.',
      },
      {
        title: 'Deep Gloss Retention',
        description:
          'Enhances paint depth and reflective clarity without altering factory finish nuance or clearcoat transparency.',
      },
      {
        title: 'Environmental Resilience',
        description:
          'Resilient formulation engineered to endure high ambient temperatures, seasonal monsoon cycles, and routine maintenance washes.',
      },
    ],
    variants: [
      {
        name: 'Trionyx Ceramic Coating (10H Formula)',
        imageSrc: '/images/about/ceramic-coating-surface.jpg',
        imageAlt: 'Trionyx Ceramic Coating vehicle panel finish',
        description:
          'High-clarity protective clearcoat formulation engineered for molecular surface bonding and long-lasting paint depth.',
        productCode: 'TRX-CERAMIC-10H',
        enquireProduct: 'Ceramic Coating',
      },
    ],
    specifications: [
      { label: 'Technology', value: 'Nano-Ceramic SiO2 Matrix' },
      { label: 'Hardness', value: '10H Certified (Pencil Scale)' },
      { label: 'Durability', value: '36 to 48 Months' },
      { label: 'Contact Angle', value: '115°' },
      { label: 'Surface Compatibility', value: 'Automotive Clearcoat, Exterior Painted Surfaces' },
      { label: 'Finish', value: 'High-Gloss Optical Clarity' },
    ],
    applicationSteps: [
      {
        step: '01',
        title: 'Surface Decontamination & Correction',
        description:
          'Wash, clay, and compound paintwork to remove swirls, oxidation, and contaminants. Wipe surface with isopropyl alcohol preparation.',
      },
      {
        step: '02',
        title: 'Precision Section Application',
        description:
          'Apply in overlapping cross-hatch sections using a dedicated microfiber applicator block. Observe uniform flash before leveling.',
      },
      {
        step: '03',
        title: 'Controlled Curing Phase',
        description:
          'Initial dry cure occurs within 24 hours in a dry environment. Full molecular bond cross-linking develops over 7 days.',
      },
    ],
  },

  'graphene-coating': {
    id: 'graphene',
    slug: 'graphene-coating',
    name: 'Graphene Coating',
    heroStatement:
      'Reinforced carbon-matrix surface formulation with extreme hydrophobic tension and thermal dissipation.',
    heroImage: '/images/hero/graphene-protected-vehicle.png',
    heroImageAlt: 'Black car bonnet beaded with water after a graphene coating',
    introHeading: 'Advanced carbon matrix. Extreme thermal resilience.',
    introDescription:
      'Trionyx Graphene Coating infuses two-dimensional carbon nanomaterials into the protective matrix. Engineered specifically for extreme climates and high-temperature environments, delivering reduced water spotting, superior chemical resistance, and an ultra-slick finish.',
    characteristics: [
      {
        title: 'Thermal Dissipation',
        description:
          'The two-dimensional carbon honeycomb structure rapidly distributes surface heat, substantially decreasing waterspot etching on dark vehicle paintwork.',
      },
      {
        title: 'Hydrophobic Slickness',
        description:
          'Ultra-low surface friction creates effortless tactile slip, significantly reducing micro-marring during routine maintenance washes.',
      },
      {
        title: 'Chemical Resistance',
        description:
          'Inert carbon lattice withstands airborne alkalis, road salts, bird droppings, and harsh industrial environmental fallout.',
      },
      {
        title: 'Multi-Year Durability',
        description:
          'Extended protective integrity engineered to endure extreme heat, UV radiation, and heavy rainfall cycles.',
      },
    ],
    variantsTitle: 'Formulations & Variants',
    variants: [
      {
        name: 'Graphene Matrix Pro',
        imageSrc: '/images/hero/graphene-protected-vehicle.png',
        imageAlt: 'Graphene Matrix Pro water contact angle on vehicle paint',
        description:
          'Professional-grade graphene formulation engineered for detailing studios requiring maximum water contact angle and slickness.',
        productCode: 'TRX-GRAPHENE-PRO',
        enquireProduct: 'Graphene Matrix Pro',
      },
      {
        name: 'Graphene Diamond Shield',
        imageSrc: '/images/graphene/mountain-bridge-cars.png',
        imageAlt: 'Graphene Diamond Shield vehicle fleet finish',
        description:
          '10H Hardness ceramic-graphene hybrid formula engineered for extreme weather resilience and durability.',
        productCode: 'TRX-GRAPHENE-SHIELD',
        enquireProduct: 'Graphene Diamond Shield',
      },
    ],
    specifications: [
      { label: 'Technology', value: 'Reduced Graphene Oxide (rGO) + Ceramic Composite' },
      { label: 'Hardness', value: '10H Certified' },
      { label: 'Durability', value: 'Up to 5 Years' },
      { label: 'Contact Angle', value: '> 115°' },
      { label: 'Surface Compatibility', value: 'Clearcoats, Painted Panels, Exterior Trim' },
      { label: 'Finish', value: 'Ultra-Slick Deep Wet Gloss' },
    ],
    applicationSteps: [
      {
        step: '01',
        title: 'Surface Preparation',
        description:
          'Complete paint correction to achieve clear optical clarity. Degrease and perform panel wipe to ensure pristine molecular bonding.',
      },
      {
        step: '02',
        title: 'Cross-Hatch Application',
        description:
          'Dispense drops across applicator suede. Spread evenly across panel sections. Allow rainbow flash time before buffing with low-pile microfibers.',
      },
      {
        step: '03',
        title: 'Bonding & Cure',
        description:
          'Keep dry and sheltered for 24 hours. Full matrix cure and hardness stabilization completes within 72 hours.',
      },
    ],
  },

  'borophene-coating': {
    id: 'borophene',
    slug: 'borophene-coating',
    name: 'Borophene Coating',
    heroStatement:
      'Next-generation atomic-grade surface coating engineered for crystalline hardness and extreme resilience.',
    heroImage: '/images/borophene/borophene-surface.jpg',
    heroImageAlt: 'Dark car body panel with a crystalline borophene finish',
    introHeading: 'Atomic-grade shield. Next-generation surface science.',
    introDescription:
      'Trionyx Borophene Coating harnesses advanced two-dimensional boron allotropes to construct an exceptionally dense atomic lattice. Delivering unprecedented mechanical strength, chemical inertness, and crystalline gloss for prestige and performance vehicles.',
    characteristics: [
      {
        title: 'Atomic Hardness',
        description:
          'Hexagonal boron atomic lattice delivers exceptional abrasion resistance against road debris, wash swirls, and surface abrasion.',
      },
      {
        title: 'Inert Chemical Barrier',
        description:
          'Dense molecular structure creates an impenetrable barrier against acidic rainfall, chemical washes, and severe atmospheric fallout.',
      },
      {
        title: 'Crystalline Depth',
        description:
          'Imparts an unmistakable crystalline mirror reflection that heightens paint color depth and optical sharpness.',
      },
      {
        title: 'Hydrophobic Shedding',
        description:
          'Immediate water displacement prevents standing water accumulation and reduces water spot mineral formation.',
      },
    ],
    variants: [
      {
        name: 'Trionyx Borophene Coating',
        imageSrc: '/images/borophene/borophene-surface.jpg',
        imageAlt: 'Trionyx Borophene Coating crystalline vehicle body panel',
        description:
          'Next-generation atomic-grade surface coating engineered for extreme resilience, crystalline hardness, and lasting environmental protection.',
        productCode: 'TRX-BOROPHENE-SHIELD',
        enquireProduct: 'Borophene Coating',
      },
    ],
    specifications: [
      { label: 'Technology', value: '2D Boron Atomic Allotrope + Silane Matrix' },
      { label: 'Hardness', value: '10H Certified' },
      { label: 'Durability', value: 'Up to 5 Years' },
      { label: 'Contact Angle', value: '118°' },
      { label: 'Surface Compatibility', value: 'Automotive Paintwork, Clearcoat, Carbon Fiber' },
      { label: 'Finish', value: 'Crystalline Mirror Reflection' },
    ],
    applicationSteps: [
      {
        step: '01',
        title: 'Precision Correction',
        description:
          'Surface must be fully corrected and free of oils, silicone, and residue. Complete final degreasing with specialist prep solution.',
      },
      {
        step: '02',
        title: 'Controlled Application',
        description:
          'Apply in climate-controlled conditions onto 40x40cm sections. Level immediately with clean, edge-free microfibers.',
      },
      {
        step: '03',
        title: 'Matrix Crystallization',
        description:
          'Allow 24-hour dry curing before exposure to weather elements. Avoid chemical detergents during the initial 7-day curing phase.',
      },
    ],
  },
};
