/**
 * A type representing a Pseudorandom Number Generator, similar to Math.random()
 */
export type PRNG = () => number;

/**
 * Computes a numeric hash from a given string
 * @param {string} str A value to hash
 * @returns {number} A numeric hash computed from the given value
 */
function xfnv1a(str: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => h >>> 0;
}

/**
 * Initialize a new PRNG using a given seed
 * @param {number} seed The seed used to initialize the PRNG
 * @returns {PRNG} A random number generator
 */
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generates a PRNG using a given seed. When not provided, the seed is randomly generated
 * @param {string} str A string to derive the seed from
 * @returns {PRNG} A random number generator correctly seeded
 */
export function seededRandom(str?: string): PRNG {
  const seed = str ? xfnv1a(str)() : Math.floor(Math.random() * 10_000_000_000);
  return mulberry32(seed);
}
