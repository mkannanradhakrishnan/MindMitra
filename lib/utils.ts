export function cn(...classes:(string|false|null|undefined)[]){return classes.filter(Boolean).join(' ')}
export function riskLabel(score:number){if(score>=70)return 'High';if(score>=40)return 'Moderate';return 'Low'}
export function riskTone(score:number){if(score>=70)return 'text-coral';if(score>=40)return 'text-amber-600';return 'text-emerald-600'}
