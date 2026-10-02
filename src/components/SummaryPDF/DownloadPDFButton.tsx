// Download PDF button for generating and downloading the configuration summary
import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { useConfigurator } from '../../context/ConfiguratorContext';

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
  header: { borderBottomWidth: 2, borderBottomColor: '#2563eb', paddingBottom: 15, marginBottom: 25 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  metaText: { fontSize: 10, color: '#64748b', marginTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1e293b', backgroundColor: '#f1f5f9', padding: 6, marginTop: 15, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  label: { fontSize: 11, color: '#475569' },
  value: { fontSize: 11, fontWeight: 'bold', color: '#0f172a' },
  priceBox: { marginTop: 30, padding: 15, backgroundColor: '#eff6ff', borderRadius: 6, borderWidth: 1, borderColor: '#bfdbfe' },
  totalPrice: { fontSize: 16, fontWeight: 'bold', color: '#1e40af', textAlign: 'right' }
});

interface PDFDocumentProps {
  config: {
    productId: string;
    baseVariantId: string;
    sections: Record<string, {
      color: string;
      elements: Array<{
        id?: string;
        type: string;
        position: { x: number; y: number };
        scale: number;
      }>;
    }>;
  };
  price: {
    basePrice: number;
    customizationCost: number;
    totalPrice: number;
  };
}

const TentOrderPDF: React.FC<PDFDocumentProps> = ({ config, price }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Production Specification Sheet</Text>
        <Text style={styles.metaText}>Product ID: {config.productId}</Text>
        <Text style={styles.metaText}>Base Variant SKU: {config.baseVariantId}</Text>
        <Text style={styles.metaText}>Generated: {new Date().toLocaleDateString()}</Text>
      </View>

      <Text style={styles.sectionTitle}>Surface Customization Map</Text>
      {Object.entries(config.sections).map(([name, data]) => (
        <View key={name} style={styles.row}>
          <Text style={styles.label}>{name.replace(/([A-Z])/g, '$1').toUpperCase()}</Text>
          <Text style={styles.value}>Color: {data.color} | Layers: {data.elements.length}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Applied Assets Placement Coordinates</Text>
      {Object.entries(config.sections).map(([name, data]) => 
        data.elements.map((el, idx) => (
          <View key={el.id || idx} style={styles.row}>
            <Text style={styles.label}>[{name.toUpperCase()}] Layer {idx + 1} ({el.type})</Text>
            <Text style={styles.value}>X: {el.position.x}% | Y: {el.position.y}% | Scale: {el.scale}%</Text>
          </View>
        ))
      )}

      <View style={styles.priceBox}>
        <div style={styles.row}>
          <Text style={styles.label}>Base Hardware Cost:</Text>
          <Text style={styles.value}>\${price.basePrice.toFixed(2)}</Text>
        </div>
        <div style={styles.row}>
          <Text style={styles.label}>Custom Printing Surcharge:</Text>
          <Text style={styles.value}>\${price.customizationCost.toFixed(2)}</Text>
        </div>
        <View style={{ marginTop: 10 }}>
          <Text style={styles.totalPrice}>Final Verified Price: \${price.totalPrice.toFixed(2)}</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export const DownloadPDFButton: React.FC = () => {
  const { config, price } = useConfigurator();
  return (
    <div style={{ padding: '0 20px 20px 20px' }}>
      <PDFDownloadLink document={<TentOrderPDF config={config} price={price} />} fileName={`tent-spec-${config.baseVariantId}.pdf`} style={{ display: 'block', width: '100%', textAlign: 'center', padding: '12px 14px', backgroundColor: '#0f172a', color: '#ffffff', textDecoration: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
        {({ loading }) => (loading ? 'Compiling Production PDF...' : 'Download Order Summary PDF')}
      </PDFDownloadLink>
    </div>
  );
};
