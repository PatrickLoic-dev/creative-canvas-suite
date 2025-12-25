import { Slider } from '@/components/ui/slider';
import { FilterSettings } from '@/types/editor';
import { Sun, Contrast, Palette, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilterPanelProps {
  filters: FilterSettings;
  onFilterChange: (filters: FilterSettings) => void;
  disabled?: boolean;
}

export function FilterPanel({ filters, onFilterChange, disabled }: FilterPanelProps) {
  const handleReset = () => {
    onFilterChange({
      brightness: 100,
      contrast: 100,
      saturation: 100
    });
  };

  const filterControls = [
    { 
      key: 'brightness' as const, 
      icon: Sun, 
      label: 'Brightness',
      min: 0,
      max: 200
    },
    { 
      key: 'contrast' as const, 
      icon: Contrast, 
      label: 'Contrast',
      min: 0,
      max: 200
    },
    { 
      key: 'saturation' as const, 
      icon: Palette, 
      label: 'Saturation',
      min: 0,
      max: 200
    },
  ];

  return (
    <div className="p-4 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Adjustments</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          disabled={disabled}
          className="h-7 px-2 text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          Reset
        </Button>
      </div>
      
      {filterControls.map(({ key, icon: Icon, label, min, max }) => (
        <div key={key} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </div>
            <span className="text-xs text-muted-foreground font-mono w-10 text-right">
              {filters[key]}%
            </span>
          </div>
          <Slider
            value={[filters[key]]}
            onValueChange={([value]) => onFilterChange({ ...filters, [key]: value })}
            min={min}
            max={max}
            step={1}
            disabled={disabled}
            className="cursor-pointer"
          />
        </div>
      ))}
    </div>
  );
}
