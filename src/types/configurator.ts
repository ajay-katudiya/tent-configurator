// Define your clear physical canopy parts
export type ProductSection = 'canopyFabric' | 'pyramidCap' ;

export interface CustomElement {
  id: string;
  type: 'text' | 'image';
  content: string;
  position: { x: number; y: number };
  scale: number;
  rotate?: number; // Optional rotation property
}

export interface SectionConfig {
  color: string;
  elements: CustomElement[];
}

export interface TentConfiguration {
  productId: string;
  baseVariantId: string;
  selectedModel: string; // file tracking
  sections: Record<ProductSection, SectionConfig>;
}

export interface PriceBreakdown {
  basePrice: number;
  customizationCost: number;
  totalPrice: number;
}
