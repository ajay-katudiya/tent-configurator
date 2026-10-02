// Three.js  canvas setup and rendering logic for 3D preview of the tent model
import React, { type ReactNode, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useConfigurator } from '../../context/ConfiguratorContext';
import type { SectionConfig } from '../../types/configurator';

// 1. Dynamic Canvas Texture Engine: Projects 2D asset uploads onto the 3D meshes
const createDynamicTexture = (sectionData: SectionConfig): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;  // Sharp 2K resolution texture grid
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Fill the background surface fabric color overlay
    ctx.fillStyle = sectionData.color === '#premium-gold' ? '#d97706' : sectionData.color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Loop through and paint all text/image layers onto the texture surface grid
    sectionData.elements.forEach((element) => {
      ctx.save();

      // Map percentage sliders (0-100) directly to texture pixel locations
      const targetX = (element.position.x / 100) * canvas.width;
      const targetY = (element.position.y / 100) * canvas.height;
      const pixelSize = (element.scale / 100) * 300; // Scaled for higher contrast
      const rotation = element.rotate || 0;

      if (element.type === 'text') {
        ctx.save();
        ctx.translate(targetX, targetY);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(1, -1);
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${pixelSize * 0.4}px Helvetica, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(element.content, 0, 0);
        // ctx.restore();
      } else if (element.type === 'image') {
        const img = new Image();
        img.src = element.content;
        ctx.save();
        ctx.translate(targetX, targetY);
        ctx.rotate((rotation * Math.PI) / 180);
        if (img.complete) {
          ctx.scale(1, -1);
          ctx.drawImage(img, -pixelSize / 2, -pixelSize / 2, pixelSize, pixelSize);
        } else {
          img.onload = () => {
            canvasTexture.needsUpdate = true;
          };
        }
        // ctx.restore();
      }
      // ctx.restore();
    });
  }

  const canvasTexture = new THREE.CanvasTexture(canvas);
  canvasTexture.needsUpdate = true;
  return canvasTexture;
};

// 2. The Model Parser: Loads your file and targets the exact internal meshes
const LoadedTentModel: React.FC = () => {
  const { scene } = useGLTF('/models/Tent_5_5.glb');
  const { config } = useConfigurator();

  useEffect(() => {
    // Generate dynamic canvas textures whenever the configuration state mutates
    const fabricTexture = createDynamicTexture(config.sections.canopyFabric);
    const capTexture = createDynamicTexture(config.sections.pyramidCap);

    scene.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        child.material.needsUpdate = true;

        // Map textures to your primary lower canopy canvas fabric assembly mesh
        if (child.name === 'Mesh003') {
          child.material.map = fabricTexture;
          child.material.color.set('#ffffff'); // Clears color overrides
        }

        // Map textures to your primary pyramid fence post caps meshes
        if (child.name === 'Mesh003_1') {
          child.material.map = capTexture;
          child.material.color.set('#ffffff');
        }

        // Apply a clean, industrial hardware appearance to support rods and pillars
        if (child.name === 'leg5' || child.name === 'mechanism3') {
          child.material.color.set('#cbd5e1');
          child.material.metalness = 0.7;
          child.material.roughness = 0.2;
        }
      }
    });
  }, [scene, config]);

  // FIXED: Primitive component tag is completely closed and safely passed with scale parameters
  return <primitive object={scene} scale={[1, 1, 1]} />;
};

interface ConfiguratorLayoutProps {
  children2DPanel: ReactNode;
}

// 3. Layout Coordinator Shell Wrapper
export const ConfiguratorLayout: React.FC<ConfiguratorLayoutProps> = ({ children2DPanel }) => {
  const { price, isUpdatingPrice } = useConfigurator();

  return (
    <div style={{ display: 'flex', flexDirection: 'row', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#f8fafc' }}>

      {/* SIDEBAR DASHBOARD DISPLAY */}
      <div style={{ flex: '0 0 420px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', zIndex: 10, boxShadow: '2px 0 10px rgba(0,0,0,0.05)' }}>
        {children2DPanel}
        <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Final Total</span>
              <strong style={{ fontSize: '24px', color: '#0f172a' }}>\${price.totalPrice.toFixed(2)}</strong>
            </div>
            {isUpdatingPrice && <span style={{ fontSize: '12px', color: '#3b82f6' }}>Updating...</span>}
          </div>
        </div>
      </div>

      {/* THREE.JS INTERACTIVE VIEWPORT ENGINE */}
      <div style={{ flex: 1, height: '100%', position: 'relative' }}>
        <Canvas camera={{ fov: 45 }} style={{ width: '100%', height: '100%' }}>
          <ambientLight intensity={0.9} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <directionalLight position={[-5, 8, -5]} intensity={0.6} />

          <Suspense fallback={null}>
            <Center>
              <LoadedTentModel />
            </Center>
          </Suspense>

          <OrbitControls enableDamping maxPolarAngle={Math.PI} minDistance={3} maxDistance={15} />
        </Canvas>
      </div>
    </div>
  );
};
