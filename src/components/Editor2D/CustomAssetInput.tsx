// Text input And Image upload for custom assets handlers(logos, graphics, etc.)
import React, { useState, useRef, type MouseEvent as ReactMouseEvent } from 'react';
import { useConfigurator } from '../../context/ConfiguratorContext';
import type { CustomElement } from '../../types/configurator';

export const CustomAssetInput: React.FC = () => {
  // Pull core state controls from our global context boundary hook
  const { config, activeSection, addCustomElement, setConfig } = useConfigurator();
  const [textInput, setTextInput] = useState('');
  const currentSectionData = config.sections[activeSection];

  // Tracking interaction mouse states natively inside the browser window context
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [activeRotateId, setActiveRotateId] = useState<string | null>(null);
  const [activeResizeId, setActiveResizeId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; initialX: number; initialY: number }>({ x: 0, y: 0, initialX: 0, initialY: 0 });
  const rotateStartRef = useRef<{ x: number; y: number; initialRotate: number }>({ x: 0, y: 0, initialRotate: 0 });
  const resizeStartRef = useRef<{ x: number; initialScale: number }>({ x: 0, initialScale: 100 });

  const CANVAS_BOX_SIZE = 260; // 260px boundaries canvas box

  const handleAddText = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    addCustomElement(activeSection, {
      type: 'text',
      content: textInput,
      position: { x: 35, y: 40 },
      scale: 30, // Occupies 30% width of standard surface layout grid area
    });
    setTextInput('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        addCustomElement(activeSection, {
          type: 'image',
          content: reader.result,
          position: { x: 30, y: 30 },
          scale: 40,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Mouse down click initialization triggers for drag, resize, and rotate events
  const startDragging = (e: ReactMouseEvent, id: string, posX: number, posY: number) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveDragId(id);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialX: (posX / 100) * CANVAS_BOX_SIZE,
      initialY: (posY / 100) * CANVAS_BOX_SIZE,
    };
  };
  const startResizing = (e: ReactMouseEvent, id: string, currentScale: number) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveResizeId(id);
    resizeStartRef.current = {
      x: e.clientX,
      initialScale: currentScale,
    };
  };
  const startRotate = (e: ReactMouseEvent, id: string, currentRotate: number | undefined) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveRotateId(id);
    rotateStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialRotate: currentRotate || 0,
    };
  };

  // 2. Runtime active mouse coordinate processing updates loops
  const handleGlobalMouseMove = (e: ReactMouseEvent) => {
    if (!canvasRef.current) return;

    // Handle layer position dragging logic
    if (activeDragId) {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      let newPixelX = dragStartRef.current.initialX + deltaX;
      let newPixelY = dragStartRef.current.initialY + deltaY;

      const activeElement = currentSectionData.elements.find(el => el.id === activeDragId);
      const elementSize = activeElement ? (activeElement.scale / 100) * CANVAS_BOX_SIZE : 0;

      // Lock position so custom items don't float off the visual workspace borders
      newPixelX = Math.max(0, Math.min(newPixelX, CANVAS_BOX_SIZE - elementSize));
      newPixelY = Math.max(0, Math.min(newPixelY, CANVAS_BOX_SIZE - elementSize));

      const percentageX = (newPixelX / CANVAS_BOX_SIZE) * 100;
      const percentageY = (newPixelY / CANVAS_BOX_SIZE) * 100;

      updateState(activeDragId, percentageX, percentageY, null, null);
    }

    // Handle layer resizing stretch logic
    if (activeResizeId) {
      const deltaX = e.clientX - resizeStartRef.current.x;
      const scalingFactor = (deltaX / CANVAS_BOX_SIZE) * 100;

      const targetScale = Math.max(10, Math.min(resizeStartRef.current.initialScale + scalingFactor, 100));
      updateState(activeResizeId, null, null, targetScale, null);
    }

    // Handle layer rotation logic
    if (activeRotateId) {
      const deltaX = e.clientX - rotateStartRef.current.x;
      const deltaY = e.clientY - rotateStartRef.current.y;
      const rotationFactor = deltaX * 0.7 + deltaY * 0.35;
      const targetRotate = rotateStartRef.current.initialRotate + rotationFactor;
      updateState(activeRotateId, null, null, null, targetRotate);
    }
  };

  const handleGlobalMouseUp = () => {
    setActiveDragId(null);
    setActiveResizeId(null);
    setActiveRotateId(null);
  };

  // Modern React 19 State update mapping: Safe deep functional structural merges
  const updateState = (id: string, x: number | null, y: number | null, scale: number | null, rotate: number | null) => {
    setConfig((prev) => {
      const section = prev.sections[activeSection];
      const updatedElements = section.elements.map((el: CustomElement) => {
        if (el.id !== id) return el;
        return {
          ...el,
          position: {
            x: x !== null ? x : el.position.x,
            y: y !== null ? y : el.position.y,
          },
          scale: scale !== null ? scale : el.scale,
          rotate: rotate !== null ? rotate : el.rotate,
        };
      });

      return {
        ...prev,
        sections: {
          ...prev.sections,
          [activeSection]: {
            ...section,
            elements: updatedElements
          }
        }
      };
    });

  };

  return (
    <div
      onMouseMove={handleGlobalMouseMove}
      onMouseUp={handleGlobalMouseUp}
      onMouseLeave={handleGlobalMouseUp}
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        overflowY: 'auto',
        flex: 1,
        userSelect: (activeDragId || activeResizeId) ? 'none' : 'auto'
      }}
    >
      <div>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#1e293b' }}>
          Configuring: {activeSection === 'canopyFabric' ? 'Canopy Fabric Cover' : 'Peak Post Cap (Mesh003)'}
        </h3>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Design your layouts using raw browser controls.</p>
      </div>

      {/* Input controls form container fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label htmlFor="brand-logo" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Upload Brand Logo</label>
          <input id="brand-logo" type="file" accept="image/*" onChange={handleImageUpload} style={{ width: '100%', padding: '6px', border: '1px dashed #cbd5e1', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }} />
        </div>

        <form onSubmit={handleAddText}>
          <label htmlFor="custom-lettering" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Add Custom Lettering Layer</label>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input id="custom-lettering" type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder="Type slogan text..." style={{ flex: 1, padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }} />
            <button type="submit" style={{ padding: '6px 12px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 500, fontSize: '13px', cursor: 'pointer' }}>Add</button>
          </div>
        </form>
      </div>

      {/* Vanilla drag canvas workspace area rendering grid block */}
      <div>
        <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Interactive Surface Canvas</label>

        <div
          ref={canvasRef}
          style={{
            width: `${CANVAS_BOX_SIZE}px`,
            height: `${CANVAS_BOX_SIZE}px`,
            backgroundColor: config.sections[activeSection].color === '#premium-gold' ? '#d97706' : config.sections[activeSection].color,
            border: '2px dashed #94a3b8',
            borderRadius: '8px',
            position: 'relative',
            overflow: 'hidden',
            margin: '0 auto',
            boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.08)'
          }}
        >
          {currentSectionData?.elements?.map((element) => {
            const posX = (element.position.x / 100) * CANVAS_BOX_SIZE;
            const posY = (element.position.y / 100) * CANVAS_BOX_SIZE;
            const sizeW = (element.scale / 100) * CANVAS_BOX_SIZE;
            const rotate = element.rotate ?? 0;

            return (
              <div
                key={element.id}
                onDoubleClick={() => {
                  updateState(element.id, null, null, 100, 0);
                }}
                onMouseDown={(e) => startDragging(e, element.id, element.position.x, element.position.y)}
                style={{
                  position: 'absolute',
                  left: `${posX}px`,
                  top: `${posY}px`,
                  width: `${sizeW}px`,
                  height: `${sizeW}px`,
                  transform: `rotate(${rotate}deg)`,
                  transformOrigin: 'center center',
                  border: activeDragId === element.id ? '1.5px solid #2563eb' : '1px dashed #475569',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderRadius: '4px',
                  cursor: 'move',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box'
                }}
              >
                {element.type === 'text' ? (
                  <div style={{ fontSize: `${sizeW * 0.18}px`, fontWeight: 'bold', color: '#000000', textAlign: 'center', wordBreak: 'break-word', userSelect: 'none', padding: '2px' }}>
                    {element.content}
                  </div>
                ) : (
                  <img src={element.content} alt="Overlay graphic" style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
                )}

                {/* Resizing anchor target dot mouse anchor grip button point */}
                <span
                  onMouseDown={(e) => startResizing(e, element.id, element.scale)}
                  style={{
                    position: 'absolute',
                    transform: 'translate(50%, 50%)',
                    right: '0',
                    bottom: '0',
                    width: '15px',
                    height: '15px',
                    backgroundColor: '#2563eb',
                    border: '1.5px solid #ffffff',
                    borderRadius: '50%',
                    cursor: 'se-resize',
                    zIndex: 30
                  }} />
                {/* Rotation anchor target dot mouse anchor grip button point */}
                {element.type === 'image' ? (
                  <span
                    onMouseDown={(e) => { startRotate(e, element.id, element.rotate) }}
                    style={{
                      position: 'absolute',
                      transform: 'translate(-50%, 50%)',
                      left: '0',
                      bottom: '0',
                      width: '15px',
                      height: '15px',
                      backgroundColor: '#facc15',
                      border: '1.5px solid #ffffff',
                      borderRadius: '50%',
                      cursor: 'grab',
                      zIndex: 30
                    }}
                  />
                ) : ''}

              </div>

            );
          })}

          <p style={{ textAlign: 'center', margin: '8px 0 0 0', fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}></p>
        </div>
      </div>
    </div>
  );
}