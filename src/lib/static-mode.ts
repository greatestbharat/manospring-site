/** True when building/serving for GitHub Pages (no Express backend). */
export const isStaticMode = import.meta.env.VITE_STATIC === 'true';
