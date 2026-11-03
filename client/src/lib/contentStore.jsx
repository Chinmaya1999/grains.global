import { Fragment, useEffect, useState } from 'react';
import { REGISTRY } from './content.js';

// Content blocks are shared module-level objects, so an admin edit is applied by replacing the
// block's contents in place; the tree then remounts once so every page re-reads it.
export function replaceInPlace(key, src) {
  const target = REGISTRY[key];
  if (!target || src === null || typeof src !== 'object') return false;
  if (Array.isArray(target) !== Array.isArray(src)) return false;
  if (Array.isArray(target)) target.splice(0, target.length, ...src);
  else { Object.keys(target).forEach((k) => delete target[k]); Object.assign(target, src); }
  return true;
}

export function ContentProvider({ children }) {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    fetch('/api/content').then((r) => (r.ok ? r.json() : {})).then((map) => {
      let changed = 0;
      Object.entries(map || {}).forEach(([k, v]) => { if (replaceInPlace(k, v)) changed++; });
      if (changed) setVersion(1); // only remount when an admin has actually overridden something
    }).catch(() => {});
  }, []);
  return <Fragment key={version}>{children}</Fragment>;
}
