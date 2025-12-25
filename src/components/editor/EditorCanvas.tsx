import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Canvas as FabricCanvas, FabricImage, FabricText, Rect, PencilBrush } from 'fabric';
import { Tool, FilterSettings } from '@/types/editor';

interface EditorCanvasProps {
  activeTool: Tool;
  brushColor: string;
  brushSize: number;
  filters: FilterSettings;
  onObjectSelected: () => void;
  onCanvasReady: () => void;
}

export interface EditorCanvasRef {
  loadImage: (file: File) => Promise<void>;
  loadImageFromBlob: (blob: Blob) => Promise<void>;
  exportImage: () => string | null;
  clearCanvas: () => void;
  rotate: (angle: number) => void;
  addText: () => void;
  getCanvas: () => FabricCanvas | null;
  applyFilters: (filters: FilterSettings) => void;
  startCrop: () => void;
  applyCrop: () => void;
  cancelCrop: () => void;
}

export const EditorCanvas = forwardRef<EditorCanvasRef, EditorCanvasProps>(({
  activeTool,
  brushColor,
  brushSize,
  filters,
  onObjectSelected,
  onCanvasReady
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
  const cropRectRef = useRef<Rect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || fabricRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#1a1a1f',
      selection: true,
      preserveObjectStacking: true,
    });

    // Initialize the brush for Fabric.js v6
    const brush = new PencilBrush(canvas);
    brush.color = brushColor;
    brush.width = brushSize;
    canvas.freeDrawingBrush = brush;

    canvas.on('selection:created', onObjectSelected);
    canvas.on('selection:updated', onObjectSelected);

    fabricRef.current = canvas;
    onCanvasReady();

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []);

  // Update drawing mode based on tool
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = activeTool === 'draw' || activeTool === 'eraser';
    
    if (canvas.freeDrawingBrush) {
      if (activeTool === 'eraser') {
        canvas.freeDrawingBrush.color = '#1a1a1f';
        canvas.freeDrawingBrush.width = brushSize * 2;
      } else {
        canvas.freeDrawingBrush.color = brushColor;
        canvas.freeDrawingBrush.width = brushSize;
      }
    }

    // Enable selection only in select mode
    canvas.selection = activeTool === 'select';
    canvas.forEachObject((obj) => {
      obj.selectable = activeTool === 'select';
      obj.evented = activeTool === 'select';
    });
    canvas.renderAll();
  }, [activeTool, brushColor, brushSize]);

  // Apply filters to images
  const applyFilters = useCallback((filters: FilterSettings) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.forEachObject((obj) => {
      if (obj instanceof FabricImage) {
        // Apply CSS filters for preview
        const filterString = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%)`;
        const element = obj.getElement() as HTMLImageElement;
        if (element) {
          element.style.filter = filterString;
        }
      }
    });
    canvas.renderAll();
  }, []);

  useEffect(() => {
    applyFilters(filters);
  }, [filters, applyFilters]);

  const loadImage = useCallback(async (file: File) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const url = URL.createObjectURL(file);
    
    try {
      const img = await FabricImage.fromURL(url);
      
      // Scale image to fit canvas
      const maxWidth = canvas.width! * 0.9;
      const maxHeight = canvas.height! * 0.9;
      const scale = Math.min(maxWidth / img.width!, maxHeight / img.height!);
      
      img.scale(scale);
      img.set({
        left: (canvas.width! - img.width! * scale) / 2,
        top: (canvas.height! - img.height! * scale) / 2,
        selectable: activeTool === 'select',
        evented: activeTool === 'select',
      });
      
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    } finally {
      URL.revokeObjectURL(url);
    }
  }, [activeTool]);

  const loadImageFromBlob = useCallback(async (blob: Blob) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const url = URL.createObjectURL(blob);
    
    try {
      const img = await FabricImage.fromURL(url);
      
      const maxWidth = canvas.width! * 0.9;
      const maxHeight = canvas.height! * 0.9;
      const scale = Math.min(maxWidth / img.width!, maxHeight / img.height!);
      
      img.scale(scale);
      img.set({
        left: (canvas.width! - img.width! * scale) / 2,
        top: (canvas.height! - img.height! * scale) / 2,
        selectable: activeTool === 'select',
        evented: activeTool === 'select',
      });
      
      canvas.clear();
      canvas.backgroundColor = '#1a1a1f';
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    } finally {
      URL.revokeObjectURL(url);
    }
  }, [activeTool]);

  const exportImage = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return null;
    
    return canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2
    });
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    
    canvas.clear();
    canvas.backgroundColor = '#1a1a1f';
    canvas.renderAll();
  }, []);

  const rotate = useCallback((angle: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.rotate((activeObject.angle || 0) + angle);
      canvas.renderAll();
    }
  }, []);

  const addText = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    
    const text = new FabricText('Double-click to edit', {
      left: canvas.width! / 2 - 100,
      top: canvas.height! / 2,
      fontSize: 24,
      fill: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      selectable: true,
      evented: true,
    });
    
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  }, []);

  const startCrop = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // Create crop rectangle
    const rect = new Rect({
      left: canvas.width! / 4,
      top: canvas.height! / 4,
      width: canvas.width! / 2,
      height: canvas.height! / 2,
      fill: 'rgba(0, 200, 200, 0.2)',
      stroke: '#00c8c8',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      selectable: true,
      evented: true,
      hasControls: true,
      hasBorders: true,
    });

    cropRectRef.current = rect;
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
  }, []);

  const applyCrop = useCallback(() => {
    const canvas = fabricRef.current;
    const cropRect = cropRectRef.current;
    if (!canvas || !cropRect) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject instanceof FabricImage) {
      // Get crop dimensions
      const left = cropRect.left! - activeObject.left!;
      const top = cropRect.top! - activeObject.top!;
      const width = cropRect.width! * cropRect.scaleX!;
      const height = cropRect.height! * cropRect.scaleY!;

      // Apply crop
      activeObject.set({
        cropX: left / activeObject.scaleX!,
        cropY: top / activeObject.scaleY!,
        width: width / activeObject.scaleX!,
        height: height / activeObject.scaleY!,
      });
    }

    canvas.remove(cropRect);
    cropRectRef.current = null;
    canvas.renderAll();
  }, []);

  const cancelCrop = useCallback(() => {
    const canvas = fabricRef.current;
    const cropRect = cropRectRef.current;
    if (!canvas || !cropRect) return;

    canvas.remove(cropRect);
    cropRectRef.current = null;
    canvas.renderAll();
  }, []);

  useImperativeHandle(ref, () => ({
    loadImage,
    loadImageFromBlob,
    exportImage,
    clearCanvas,
    rotate,
    addText,
    getCanvas: () => fabricRef.current,
    applyFilters,
    startCrop,
    applyCrop,
    cancelCrop,
  }));

  return (
    <div 
      ref={containerRef}
      className="flex-1 flex items-center justify-center bg-canvas-bg overflow-hidden p-4"
    >
      <div className="relative shadow-lg rounded-lg overflow-hidden animate-fade-in">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
});

EditorCanvas.displayName = 'EditorCanvas';
