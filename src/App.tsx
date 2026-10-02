import React from 'react';
import { ConfiguratorProvider, useConfigurator } from './context/ConfiguratorContext';
import { ConfiguratorLayout } from './components/Preview3D/CanvasContainer';
import { CustomAssetInput } from './components/Editor2D/CustomAssetInput';
import { DownloadPDFButton } from './components/SummaryPDF/DownloadPDFButton';

const ConfiguratorDashboard: React.FC = () => {
  const { activeSection, setActiveSection, updateSectionColor, config } = useConfigurator();

  // Clear visual naming layouts for user settings dashboard panels
  const sections: { id: typeof activeSection; label: string }[] = [
    { id: 'canopyFabric', label: 'Canopy Cover Fabric' },
    { id: 'pyramidCap', label: 'Peak Fence Post Cap' },
  ];

  const presetColors = ['#ffffff', '#000000', '#ef4444', '#1d4ed8', '#16a34a', '#eab308', '#premium-gold'];

  return (
    <ConfiguratorLayout
      children2DPanel={
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
            <h1 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>10x10 Custom Tent</h1>
            <span style={{ fontSize: '12px', color: '#64748b', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontWeight: 500 }}>Shopify Sandbox Configurator</span>
          </div>

          {/* Upgraded Context Tabs selection wrapper */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
            {sections.map((tab) => (
              <button key={tab.id} onClick={() => setActiveSection(tab.id)} style={{ flex: 1, padding: '14px 6px', fontSize: '12px', fontWeight: activeSection === tab.id ? 600 : 400, color: activeSection === tab.id ? '#2563eb' : '#475569', border: 'none', borderBottom: activeSection === tab.id ? '2px solid #2563eb' : '2px solid transparent', backgroundColor: 'transparent', cursor: 'pointer' }}>
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9' }}>
            <label htmlFor='selectingColor' style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Surface Element Color</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {presetColors.map((color) => (
                <button id='selectingColor' key={color} onClick={() => updateSectionColor(activeSection, color)} style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: color === '#premium-gold' ? '#d97706' : color, border: config.sections[activeSection].color === color ? '3px solid #2563eb' : '1px solid #cbd5e1', cursor: 'pointer' }} title={color === '#premium-gold' ? 'Premium Fabric Addon' : color} />
              ))}
            </div>
          </div>

          <CustomAssetInput />
          <DownloadPDFButton />
        </div>
      }
    />
  );
};

export default function App() {
  return (
    <ConfiguratorProvider>
      <ConfiguratorDashboard />
    </ConfiguratorProvider>
  );
}
