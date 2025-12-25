import { Layer } from '@/types/editor';
import { Eye, EyeOff, Lock, Unlock, Trash2, Image, Pencil, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayersPanelProps {
  layers: Layer[];
  activeLayerId: string | null;
  onLayerSelect: (id: string) => void;
  onLayerToggleVisibility: (id: string) => void;
  onLayerToggleLock: (id: string) => void;
  onLayerDelete: (id: string) => void;
  disabled?: boolean;
}

const layerIcons = {
  image: Image,
  drawing: Pencil,
  text: Type
};

export function LayersPanel({
  layers,
  activeLayerId,
  onLayerSelect,
  onLayerToggleVisibility,
  onLayerToggleLock,
  onLayerDelete,
  disabled
}: LayersPanelProps) {
  return (
    <div className="p-4 space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Layers</h3>
      
      {layers.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          No layers yet. Upload an image to start.
        </p>
      ) : (
        <div className="space-y-1">
          {layers.map((layer) => {
            const Icon = layerIcons[layer.type];
            const isActive = activeLayerId === layer.id;
            
            return (
              <div
                key={layer.id}
                onClick={() => !disabled && onLayerSelect(layer.id)}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-150",
                  "hover:bg-toolbar-hover group",
                  isActive && "bg-toolbar-hover border border-layer-selected/30",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                
                <span className={cn(
                  "flex-1 text-sm truncate",
                  !layer.visible && "opacity-50",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}>
                  {layer.name}
                </span>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerToggleVisibility(layer.id);
                    }}
                    disabled={disabled}
                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                  >
                    {layer.visible ? (
                      <Eye className="w-3.5 h-3.5" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5" />
                    )}
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerToggleLock(layer.id);
                    }}
                    disabled={disabled}
                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                  >
                    {layer.locked ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5" />
                    )}
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerDelete(layer.id);
                    }}
                    disabled={disabled || layers.length <= 1}
                    className="p-1 hover:bg-destructive/20 rounded text-muted-foreground hover:text-destructive disabled:opacity-30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
