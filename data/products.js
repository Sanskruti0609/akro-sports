// Seed catalogue for Akro Sports. All designs are ORIGINAL placeholders drawn as SVG
// (no club crests or sponsor marks). Replace with real photos/prices when ready:
//   1. Edit this file (or add an `image: '/assets/products/xyz.jpg'` field)
//   2. Run: npm run reseed
//
// design: { body, accent, trim, pattern } -> used by public/js/jersey.js
// pattern: solid | sash | chevron | stripes | pinstripe | hoops | gradient | diagonal | halves

const ADULT = ['S', 'M', 'L', 'XL', 'XXL'];
const KIDS = ['6-7Y', '8-9Y', '10-11Y', '12-13Y'];

module.exports = [
  // ---------- JERSEYS ----------
  { slug: 'kolkata-roar-home', name: 'Kolkata Roar', sub: 'Home 26/27', category: 'jerseys', type: 'jersey', price: 1499, compareAt: 1999, tag: 'Bestseller',
    tagline: 'Red. Loud. Unapologetic.',
    desc: 'Our signature home shirt. A bold black sash cuts across Akro red, built in breathable dri-fit mesh that shrugs off a humid 90 minutes.',
    design: { body: '#d90f1c', accent: '#0b0b0b', trim: '#ffffff', pattern: 'sash' }, sizes: ADULT },
  { slug: 'mumbai-midnight-away', name: 'Mumbai Midnight', sub: 'Away 26/27', category: 'jerseys', type: 'jersey', price: 1499, compareAt: 1999, tag: 'New',
    tagline: 'Built for floodlights.',
    desc: 'Deep navy with gold chevrons that catch the light under the lamps. Lightweight stretch fabric, flat-lock seams, zero chafe.',
    design: { body: '#0c1a4d', accent: '#f4c542', trim: '#f4c542', pattern: 'chevron' }, sizes: ADULT },
  { slug: 'bengal-tiger-stripes', name: 'Bengal Tiger', sub: 'Third 26/27', category: 'jerseys', type: 'jersey', price: 1399, compareAt: 1899, tag: '',
    tagline: 'Hunt in packs.',
    desc: 'Burnt-orange body with tonal tiger stripes. A loud third kit that is impossible to lose track of on a crowded turf.',
    design: { body: '#f08a1c', accent: '#161616', trim: '#161616', pattern: 'stripes' }, sizes: ADULT },
  { slug: 'goa-sunset-third', name: 'Goa Sunset', sub: 'Limited drop', category: 'jerseys', type: 'jersey', price: 1599, compareAt: 2199, tag: 'Limited',
    tagline: 'Golden hour, full time.',
    desc: 'A sunset fade from amber to hot pink. Sublimated print, soft collar, limited run of numbered pieces.',
    design: { body: '#ff9a2e', accent: '#e0245e', trim: '#ffffff', pattern: 'gradient' }, sizes: ADULT },
  { slug: 'delhi-steel-grey', name: 'Delhi Steel', sub: 'Away 26/27', category: 'jerseys', type: 'jersey', price: 1399, compareAt: 1899, tag: '',
    tagline: 'Cold. Calm. Clinical.',
    desc: 'Gunmetal grey with red hoops and a crisp white collar. Breathable body mapping where you run hottest.',
    design: { body: '#3a3f48', accent: '#d90f1c', trim: '#ffffff', pattern: 'hoops' }, sizes: ADULT },
  { slug: 'chennai-gold-pinstripe', name: 'Chennai Gold', sub: 'Home 26/27', category: 'jerseys', type: 'jersey', price: 1399, compareAt: 1899, tag: '',
    tagline: 'Shine every Sunday.',
    desc: 'Sun-yellow with deep blue pinstripes and cuffs. Light enough for noon kick-offs.',
    design: { body: '#f7c600', accent: '#12307f', trim: '#12307f', pattern: 'pinstripe' }, sizes: ADULT },

  // ---------- RETRO ----------
  { slug: 'akro-98-classic', name: "Akro '98 Classic", sub: 'Retro', category: 'retro', type: 'jersey', price: 1699, compareAt: 2299, tag: 'Retro',
    tagline: 'The one your dad wishes he kept.',
    desc: 'Clean white body with a wide red collar and thin black hoops. Cotton-blend, relaxed fit, terrace-ready.',
    design: { body: '#f4f2ec', accent: '#d90f1c', trim: '#0b0b0b', pattern: 'hoops' }, sizes: ADULT },
  { slug: 'akro-04-terrace', name: "Akro '04 Terrace", sub: 'Retro', category: 'retro', type: 'jersey', price: 1699, compareAt: 2299, tag: 'Retro',
    tagline: 'Noise from the cheap seats.',
    desc: 'Royal blue with a diagonal white flash. A nod to early-2000s match shirts, rebuilt in modern mesh.',
    design: { body: '#1c46c9', accent: '#ffffff', trim: '#ffffff', pattern: 'diagonal' }, sizes: ADULT },
  { slug: 'akro-11-heritage', name: "Akro '11 Heritage", sub: 'Retro', category: 'retro', type: 'jersey', price: 1699, compareAt: 2299, tag: 'Retro',
    tagline: 'Old money, new pitch.',
    desc: 'Maroon pinstripe with a gold crest-patch spot. Heavier knit, collared, made to be worn off the pitch too.',
    design: { body: '#6a0f26', accent: '#e8c36a', trim: '#e8c36a', pattern: 'pinstripe' }, sizes: ADULT },

  // ---------- KITS ----------
  { slug: 'kids-match-kit-red', name: 'Kids Match Kit', sub: 'Red', category: 'kits', type: 'kit', price: 1799, compareAt: 2399, tag: 'Bestseller',
    tagline: 'Shirt, shorts, socks. Done.',
    desc: 'Complete three-piece kit for young players. Soft inner mesh, tag-free neck, shorts with a secure drawcord.',
    design: { body: '#d90f1c', accent: '#0b0b0b', trim: '#ffffff', pattern: 'sash' }, sizes: KIDS },
  { slug: 'kids-match-kit-royal', name: 'Kids Match Kit', sub: 'Royal', category: 'kits', type: 'kit', price: 1799, compareAt: 2399, tag: '',
    tagline: 'Team colours, tiny legends.',
    desc: 'Royal blue three-piece kit with contrast hoops. Built to survive school-ground tackles.',
    design: { body: '#1c46c9', accent: '#ffffff', trim: '#ffffff', pattern: 'hoops' }, sizes: KIDS },
  { slug: 'akro-black-edition-kit', name: 'Akro Black Edition', sub: 'Full kit', category: 'kits', type: 'kit', price: 2799, compareAt: 3499, tag: 'New',
    tagline: 'Matte black. Red flash.',
    desc: 'Shirt and shorts in stealth black with a single red sash. Our flagship full kit for clubs and academies. Bulk and team pricing on request.',
    design: { body: '#0e0e10', accent: '#d90f1c', trim: '#d90f1c', pattern: 'sash' }, sizes: ADULT },

  // ---------- TRAINING ----------
  { slug: 'akro-pro-training-tee', name: 'Pro Training Tee', sub: 'Training', category: 'training', type: 'jersey', price: 899, compareAt: 1199, tag: '',
    tagline: 'Sweat it out.',
    desc: 'Ultra-light training tee with laser-cut ventilation and a quick-dry finish. Buy five, look like a squad.',
    design: { body: '#1a1a1d', accent: '#d90f1c', trim: '#d90f1c', pattern: 'diagonal' }, sizes: ADULT },
  { slug: 'akro-warmup-top', name: 'Warm-Up Top', sub: 'Training', category: 'training', type: 'jersey', price: 999, compareAt: 1299, tag: '',
    tagline: 'First one on the pitch.',
    desc: 'Gradient warm-up top for the touchline. Stretchy, breathable, and loud enough to find in a kit bag.',
    design: { body: '#101010', accent: '#d90f1c', trim: '#ffffff', pattern: 'gradient' }, sizes: ADULT },

  // ---------- JACKETS ----------
  { slug: 'akro-windcheater', name: 'Windcheater', sub: 'Jacket', category: 'jackets', type: 'jacket', price: 2199, compareAt: 2999, tag: '',
    tagline: 'Monsoon proof, match day ready.',
    desc: 'Water-resistant shell with full zip, side pockets and a red contrast lining. Packs into its own pocket.',
    design: { body: '#0e0e10', accent: '#d90f1c', trim: '#ffffff', pattern: 'sash' }, sizes: ADULT },
  { slug: 'akro-rain-shell', name: 'Rain Shell', sub: 'Jacket', category: 'jackets', type: 'jacket', price: 2399, compareAt: 3199, tag: 'New',
    tagline: 'Rain? What rain?',
    desc: 'Taped seams and a hooded collar for the wet season. Reflective piping for evening sessions.',
    design: { body: '#d90f1c', accent: '#0b0b0b', trim: '#ffffff', pattern: 'chevron' }, sizes: ADULT },

  // ---------- TRACKSUITS ----------
  { slug: 'akro-club-tracksuit-black', name: 'Club Tracksuit', sub: 'Black', category: 'tracksuits', type: 'jacket', price: 2999, compareAt: 3999, tag: 'Bestseller',
    tagline: 'Arrive like you mean it.',
    desc: 'Matching jacket and pants in brushed poly-knit. Ankle zips, tapered fit, red side-stripe.',
    design: { body: '#121214', accent: '#d90f1c', trim: '#ffffff', pattern: 'stripes' }, sizes: ADULT },
  { slug: 'akro-club-tracksuit-navy', name: 'Club Tracksuit', sub: 'Navy', category: 'tracksuits', type: 'jacket', price: 2999, compareAt: 3999, tag: '',
    tagline: 'Dress for the dugout.',
    desc: 'Navy tracksuit set with white piping. Same fit and fabric as our black edition.',
    design: { body: '#0c1a4d', accent: '#ffffff', trim: '#ffffff', pattern: 'pinstripe' }, sizes: ADULT }
];
