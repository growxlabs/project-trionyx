import config from './apps/portal/eslint.config.mjs';
export default [...config, { rules: { '@next/next/no-html-link-for-pages': 'off' } }];
