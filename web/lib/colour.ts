export function integerToColour(value: number): string {
  return '#' + value.toString(16).padStart(6, '0')
}

export function colourToInteger(value: string): number {
  return parseInt(value.slice(1), 16)
}
