// Global state: Syncs 2D controls & 3D view
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { TentConfiguration, PriceBreakdown, ProductSection, CustomElement } from '../types/configurator';
import { PricingService } from '../services/pricingservice';

interface ConfigContextProps {
  config: TentConfiguration;
  price: PriceBreakdown;
  activeSection: ProductSection;
  setActiveSection: (section: ProductSection) => void;
  updateSectionColor: (section: ProductSection, color: string) => void;
  addCustomElement: (section: ProductSection, element: Omit<CustomElement, 'id'>) => void;
  setConfig: React.Dispatch<React.SetStateAction<TentConfiguration>>;
  isUpdatingPrice: boolean;
}

const initialConfig: TentConfiguration = {
  productId: '10x10-logo-canopy-tent',
  baseVariantId: 'tent-10x10-standard',
  selectedModel: '/models/Tent_5_5.glb',
  sections: {
    canopyFabric: { color: '#ffffff', elements: [] },
    pyramidCap: { color: '#ef4444', elements: [] } // Default contrasting cap color
  }
};

const ConfiguratorContext = createContext<ConfigContextProps | undefined>(undefined);

export const ConfiguratorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<TentConfiguration>(initialConfig);
  const [activeSection, setActiveSection] = useState<ProductSection>('canopyFabric');
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [price, setPrice] = useState<PriceBreakdown>({ basePrice: 849, customizationCost: 0, totalPrice: 849 });

  useEffect(() => {
    let activeFetch = true;

    const loadPrice = async () => {
      setIsUpdatingPrice(true);

      try {
        const updatedPrice = await PricingService.calculatePrice(config);

        if (activeFetch) {
          setPrice(updatedPrice);
        }
      } finally {
        if (activeFetch) {
          setIsUpdatingPrice(false);
        }
      }
    };

    void loadPrice();

    return () => {
      activeFetch = false;
    };
  }, [config]);

  const updateSectionColor = (section: ProductSection, color: string) => {
    setConfig((prev) => ({
      ...prev,
      sections: { ...prev.sections, [section]: { ...prev.sections[section], color } }
    }));
  };

  const addCustomElement = (section: ProductSection, element: Omit<CustomElement, 'id'>) => {
    const newElement: CustomElement = { ...element, id: crypto.randomUUID() };
    setConfig((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: { ...prev.sections[section], elements: [...prev.sections[section].elements, newElement] }
      }
    }));
  };

  return (
    <ConfiguratorContext.Provider value={{ config, price, activeSection, setActiveSection, updateSectionColor, addCustomElement, setConfig, isUpdatingPrice }}>
      {children}
    </ConfiguratorContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useConfigurator = () => {
  const context = useContext(ConfiguratorContext);
  if (!context) throw new Error('useConfigurator must be used within ConfiguratorProvider');
  return context;
};
