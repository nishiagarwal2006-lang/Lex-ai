export function severityToColor(severity) {
  const s = (severity || '').toUpperCase();
  switch (s) {
    case 'HIGH':
      return 'risk-high';
    case 'MEDIUM':
      return 'risk-medium';
    case 'LOW':
      return 'risk-low';
    default:
      return 'risk-medium';
  }
}

export function severityToHex(severity) {
  const s = (severity || '').toUpperCase();
  switch (s) {
    case 'HIGH':
      return '#ff2d55';
    case 'MEDIUM':
      return '#ff9f0a';
    case 'LOW':
      return '#30d158';
    default:
      return '#ff9f0a';
  }
}

export function scoreToColor(score) {
  if (score >= 70) return 'risk-high';
  if (score >= 40) return 'risk-medium';
  return 'risk-low';
}

export function scoreToHex(score) {
  if (score >= 70) return '#ff2d55';
  if (score >= 40) return '#ff9f0a';
  return '#30d158';
}

export function scoreToLabel(score) {
  if (score >= 70) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}
