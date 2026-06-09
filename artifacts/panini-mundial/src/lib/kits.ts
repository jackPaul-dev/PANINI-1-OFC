// Re-exporta de countryConfig para manter compatibilidade com imports existentes.
// Todas as definições de kits vivem em countryConfig.ts.
import countryConfig from "./countryConfig";

export type { Kit } from "./countryConfig";

export const kits = countryConfig.kits;
