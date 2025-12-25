import { Slider } from '@/components/ui/slider';
import { Paintbrush } from 'lucide-react';

interface BrushSettingsProps {
  color: string;
  size: number;
  onColorChange: (color: string) => void;
  onSizeChange: (size: number) => void;
  disabled?: boolean;
}

const presetColors = [
  '#ffffff', '#000000', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
];

export function BrushSettings({ 
  color, 
  size, 
  onColorChange, 
  onSizeChange,
  disabled 
}: BrushSettingsProps) {
  return (
    <div className="p-4 space-y-5">
      <div className="flex items-center gap-2">
        <Paintbrush className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Brush</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Size</span>
          <span className="text-xs text-muted-foreground font-mono">{size}px</span>
        </div>
        <Slider
          value={[size]}
          onValueChange={([value]) => onSizeChange(value)}
          min={1}
          max={50}
          step={1}
          disabled={disabled}
          className="cursor-pointer"
        />
      </div>
      
      <div className="space-y-3">
        <span className="text-sm text-muted-foreground">Color</span>
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-lg border-2 border-border shadow-inner"
            style={{ backgroundColor: color }}
          />
          <input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            disabled={disabled}
            className="sr-only"
            id="brush-color-input"
          />
          <label
            htmlFor="brush-color-input"
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Custom
          </label>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {presetColors.map((presetColor) => (
            <button
              key={presetColor}
              onClick={() => onColorChange(presetColor)}
              disabled={disabled}
              className={`w-7 h-7 rounded-md border-2 transition-all duration-150 hover:scale-110 ${
                color === presetColor 
                  ? 'border-primary ring-2 ring-primary/30' 
                  : 'border-border hover:border-muted-foreground'
              }`}
              style={{ backgroundColor: presetColor }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
