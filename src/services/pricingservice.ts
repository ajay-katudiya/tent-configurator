// Mock API for dynamic pricing
import type { TentConfiguration, PriceBreakdown } from '../types/configurator';

const BASE_VARIANT_PRICES: Record<string, number> = {
  'tent-10x10-standard': 849.00,
  'tent-10x10-premium': 1149.00
};

export class PricingService {
  static async calculatePrice(config: TentConfiguration): Promise<PriceBreakdown> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const basePrice = BASE_VARIANT_PRICES[config.baseVariantId] || 849.00;
        let customizationCost = 0;

        Object.values(config.sections).forEach((section) => {
          customizationCost += section.elements.length * 45.00; // $45 per logo/text print
          if (section.color === '#premium-gold') {
            customizationCost += 75.00;
          }
        });

        resolve({
          basePrice,
          customizationCost,
          totalPrice: basePrice + customizationCost,
        });
      }, 300);
    });
  }
}

