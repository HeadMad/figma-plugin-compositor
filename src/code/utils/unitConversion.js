const MM_TO_PX = 3.7795275591; // 96 DPI

export function mmToPx(mm) {
  return Math.round(mm * MM_TO_PX);
}

export function pxToMm(px) {
  return Math.round(px / MM_TO_PX);
}

export function toPixels(value, unit) {
  return unit === 'mm' ? mmToPx(value) : value;
}

export default { mmToPx, pxToMm, toPixels };
