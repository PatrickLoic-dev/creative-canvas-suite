import { Separator } from '@/components/ui/separator';
import { FilterPanel } from './FilterPanel';
import { BrushSettings } from './BrushSettings';
import { LayersPanel } from './LayersPanel';
import { FilterSettings, Layer, Tool } from '@/types/editor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sliders, Layers, Palette } from 'lucide-react';

interface SidePanelProps {
  activeTool: Tool;
  filters: FilterSettings;
  onFilterChange: (filters: FilterSettings) => void;
  brushColor: string;
  brushSize: number;
  onBrushColorChange: (color: string) => void;
  onBrushSizeChange: (size: number) => void;
  layers: Layer[];
  activeLayerId: string | null;
  onLayerSelect: (id: string) => void;
  onLayerToggleVisibility: (id: string) => void;
  onLayerToggleLock: (id: string) => void;
  onLayerDelete: (id: string) => void;
  disabled?: boolean;
}

export function SidePanel({
  activeTool,
  filters,
  onFilterChange,
  brushColor,
  brushSize,
  onBrushColorChange,
  onBrushSizeChange,
  layers,
  activeLayerId,
  onLayerSelect,
  onLayerToggleVisibility,
  onLayerToggleLock,
  onLayerDelete,
  disabled
}: SidePanelProps) {
  return (
    <div className="w-64 bg-panel border-l border-border shadow-md flex flex-col">
      <Tabs defaultValue="adjustments" className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-3 bg-toolbar rounded-none border-b border-border h-12">
          <TabsTrigger 
            value="adjustments" 
            className="data-[state=active]:bg-toolbar-hover data-[state=active]:text-primary rounded-none"
          >
            <Sliders className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger 
            value="brush"
            className="data-[state=active]:bg-toolbar-hover data-[state=active]:text-primary rounded-none"
          >
            <Palette className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger 
            value="layers"
            className="data-[state=active]:bg-toolbar-hover data-[state=active]:text-primary rounded-none"
          >
            <Layers className="w-4 h-4" />
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="adjustments" className="flex-1 m-0 overflow-y-auto scrollbar-thin">
          <FilterPanel 
            filters={filters} 
            onFilterChange={onFilterChange}
            disabled={disabled}
          />
        </TabsContent>
        
        <TabsContent value="brush" className="flex-1 m-0 overflow-y-auto scrollbar-thin">
          <BrushSettings
            color={brushColor}
            size={brushSize}
            onColorChange={onBrushColorChange}
            onSizeChange={onBrushSizeChange}
            disabled={disabled || (activeTool !== 'draw' && activeTool !== 'eraser')}
          />
          {activeTool !== 'draw' && activeTool !== 'eraser' && (
            <p className="px-4 text-xs text-muted-foreground">
              Select the brush or eraser tool to adjust settings.
            </p>
          )}
        </TabsContent>
        
        <TabsContent value="layers" className="flex-1 m-0 overflow-y-auto scrollbar-thin">
          <LayersPanel
            layers={layers}
            activeLayerId={activeLayerId}
            onLayerSelect={onLayerSelect}
            onLayerToggleVisibility={onLayerToggleVisibility}
            onLayerToggleLock={onLayerToggleLock}
            onLayerDelete={onLayerDelete}
            disabled={disabled}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
