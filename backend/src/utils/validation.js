export function isValidEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function pick(source, fields) {
  return Object.fromEntries(fields
    .filter((field) => source[field] !== undefined)
    .map((field) => [field, source[field]]));
}