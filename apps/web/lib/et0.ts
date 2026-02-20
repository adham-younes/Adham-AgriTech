export function estimateEt0(t2m: number, ws2m: number, rh2m: number): number {
  const humidityPenalty = (100 - rh2m) * 0.02;
  const windBonus = ws2m * 0.08;
  const tempBonus = Math.max(0, t2m - 20) * 0.12;
  return Number((2.5 + humidityPenalty + windBonus + tempBonus).toFixed(2));
}
