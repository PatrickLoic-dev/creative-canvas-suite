import { useState, useRef, useCallback, useEffect } from 'react';
import { Toolbar } from './Toolbar';
import { EditorCanvas, EditorCanvasRef } from './EditorCanvas';
import { SidePanel } from './SidePanel';
import { Header } from './Header';
import { Tool, FilterSettings, Layer } from '@/types/editor';
import { removeBackground, loadImage } from '@/lib/backgroundRemoval';
import { toast } from 'sonner';

export function ImageEditor() {
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [brushColor, setBrushColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [hasImage, setHasImage] = useState(false);
  const [filters, setFilters] = useState<FilterSettings>({
    brightness: 100,
    contrast: 100,
    saturation: 100
  });
  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  
  const canvasRef = useRef<EditorCanvasRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      const shortcuts: Record<string, Tool> = {
        'v': 'select',
        'b': 'draw',
        'e': 'eraser',
        'c': 'crop',
        'r': 'rotate',
        't': 'text'
      };
      
      const tool = shortcuts[e.key.toLowerCase()];
      if (tool) {
        setActiveTool(tool);
      }
      
      // Rotate with R when object selected
      if (e.key.toLowerCase() === 'r' && activeTool === 'rotate') {
        canvasRef.current?.rotate(90);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTool]);

  const handleToolChange = useCallback((tool: Tool) => {
    setActiveTool(tool);
    
    if (tool === 'text') {
      canvasRef.current?.addText();
      setActiveTool('select');
    }
    
    if (tool === 'rotate') {
      canvasRef.current?.rotate(90);
      toast.success('Rotated 90°');
    }
    
    if (tool === 'crop') {
      canvasRef.current?.startCrop();
      toast.info('Adjust the crop area, then press Enter to apply');
    }
  }, []);

  const handleUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    try {
      await canvasRef.current?.loadImage(file);
      setHasImage(true);
      
      // Add layer
      const newLayer: Layer = {
        id: `layer-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        visible: true,
        locked: false,
        type: 'image'
      };
      setLayers(prev => [...prev, newLayer]);
      setActiveLayerId(newLayer.id);
      
      toast.success('Image loaded successfully');
    } catch (error) {
      toast.error('Failed to load image');
      console.error(error);
    }
    
    // Reset input
    e.target.value = '';
  }, []);

  const handleDownload = useCallback(() => {
    const dataUrl = canvasRef.current?.exportImage();
    if (!dataUrl) {
      toast.error('Nothing to export');
      return;
    }
    
    const link = document.createElement('a');
    link.download = 'pixelforge-export.png';
    link.href = dataUrl;
    link.click();
    
    toast.success('Image exported!');
  }, []);

  const handleRemoveBackground = useCallback(async () => {
    const canvas = canvasRef.current?.getCanvas();
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (!activeObject) {
      toast.error('Please select an image first');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Get image data from canvas
      const dataUrl = canvasRef.current?.exportImage();
      if (!dataUrl) throw new Error('Failed to get image');
      
      // Convert to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // Load as image element
      const imgElement = await loadImage(blob);
      
      // Remove background
      const resultBlob = await removeBackground(imgElement, setProcessingStatus);
      
      // Load result back to canvas
      await canvasRef.current?.loadImageFromBlob(resultBlob);
      
      toast.success('Background removed successfully!');
    } catch (error) {
      console.error('Background removal failed:', error);
      toast.error('Background removal failed. Try a different image.');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  }, []);

  const handleClear = useCallback(() => {
    canvasRef.current?.clearCanvas();
    setHasImage(false);
    setLayers([]);
    setActiveLayerId(null);
    setFilters({ brightness: 100, contrast: 100, saturation: 100 });
    toast.success('Canvas cleared');
  }, []);

  const handleLayerSelect = useCallback((id: string) => {
    setActiveLayerId(id);
  }, []);

  const handleLayerToggleVisibility = useCallback((id: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === id ? { ...layer, visible: !layer.visible } : layer
    ));
  }, []);

  const handleLayerToggleLock = useCallback((id: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === id ? { ...layer, locked: !layer.locked } : layer
    ));
  }, []);

  const handleLayerDelete = useCallback((id: string) => {
    setLayers(prev => prev.filter(layer => layer.id !== id));
    if (activeLayerId === id) {
      setActiveLayerId(layers[0]?.id || null);
    }
  }, [activeLayerId, layers]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header isProcessing={isProcessing} processingStatus={processingStatus} />
      
      <div className="flex-1 flex overflow-hidden">
        <Toolbar
          activeTool={activeTool}
          onToolChange={handleToolChange}
          onUpload={handleUpload}
          onDownload={handleDownload}
          onRemoveBackground={handleRemoveBackground}
          onClear={handleClear}
          isProcessing={isProcessing}
          hasImage={hasImage}
        />
        
        <EditorCanvas
          ref={canvasRef}
          activeTool={activeTool}
          brushColor={brushColor}
          brushSize={brushSize}
          filters={filters}
          onObjectSelected={() => {}}
          onCanvasReady={() => {}}
        />
        
        <SidePanel
          activeTool={activeTool}
          filters={filters}
          onFilterChange={setFilters}
          brushColor={brushColor}
          brushSize={brushSize}
          onBrushColorChange={setBrushColor}
          onBrushSizeChange={setBrushSize}
          layers={layers}
          activeLayerId={activeLayerId}
          onLayerSelect={handleLayerSelect}
          onLayerToggleVisibility={handleLayerToggleVisibility}
          onLayerToggleLock={handleLayerToggleLock}
          onLayerDelete={handleLayerDelete}
          disabled={isProcessing}
        />
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
