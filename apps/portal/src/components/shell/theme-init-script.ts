import { appearanceStorageKey } from './theme-utils';

/** User identity comes from the server session; never reuse another account's cache. */
export function themeInitializationScript(userId: string | null) {
  const key = JSON.stringify(appearanceStorageKey(userId)).replace(/</g, '\\u003c');
  return `(()=>{let p={mode:'system',accent:'ember',density:'comfortable',reduceMotion:false};try{const v=JSON.parse(localStorage.getItem(${key})||'{}');if(v){if(['system','light','dark'].includes(v.mode))p.mode=v.mode;if(['ember','plum','rosewood','moss','slate','mono'].includes(v.accent))p.accent=v.accent;if(v.density==='compact')p.density='compact';p.reduceMotion=v.reduceMotion===true}}catch(_){}const e=document.documentElement;const d=p.mode==='system'?matchMedia('(prefers-color-scheme: dark)').matches:p.mode==='dark';e.dataset.theme=d?'dark':'light';e.dataset.themePreference=p.mode;e.dataset.accent=p.accent;e.dataset.density=p.density;e.dataset.reduceMotion=String(p.reduceMotion);e.style.colorScheme=d?'dark':'light'})();`;
}
