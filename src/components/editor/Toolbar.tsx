import { 
  MousePointer2, 
  Pencil, 
  Crop, 
  RotateCw, 
  Type,
  Eraser,
  Wand2,
  Download,
  Upload,
  Trash2
} from 'lucide-react';
import { ToolButton } from './ToolButton';
import { Tool } from '@/types/editor';
import { Separator } from '@/components/ui/separator';

interface ToolbarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  onUpload: () => void;
  onDownload: () => void;
  onRemoveBackground: () => void;
  onClear: () => void;
  isProcessing: boolean;
  hasImage: boolean;
}

export function Toolbar({
  activeTool,
  onToolChange,
  onUpload,
  onDownload,
  onRemoveBackground,
  onClear,
  isProcessing,
  hasImage
}: ToolbarProps) {
  const tools: { tool: Tool; icon: typeof MousePointer2; label: string; shortcut: string }[] = [
    { tool: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
    { tool: 'draw', icon: Pencil, label: 'Draw', shortcut: 'B' },
    { tool: 'eraser', icon: Eraser, label: 'Eraser', shortcut: 'E' },
    { tool: 'crop', icon: Crop, label: 'Crop', shortcut: 'C' },
    { tool: 'rotate', icon: RotateCw, label: 'Rotate', shortcut: 'R' },
    { tool: 'text', icon: Type, label: 'Text', shortcut: 'T' },
  ];

  return (
    <div className="w-14 bg-toolbar flex flex-col items-center py-3 gap-1 border-r border-border shadow-md">
      <ToolButton
        icon={Upload}
        label="Upload Image"
        onClick={onUpload}
        disabled={isProcessing}
      />
      
      <Separator className="w-8 my-2 bg-border" />
      
      {tools.map(({ tool, icon, label, shortcut }) => (
        <ToolButton
          key={tool}
          icon={icon}
          label={label}
          shortcut={shortcut}
          isActive={activeTool === tool}
          onClick={() => onToolChange(tool)}
          disabled={isProcessing}
        />
      ))}
      
      <Separator className="w-8 my-2 bg-border" />
      
      <ToolButton
        icon={Wand2}
        label="Remove Background (AI)"
        onClick={onRemoveBackground}
        disabled={isProcessing || !hasImage}
      />
      
      <div className="flex-1" />
      
      <ToolButton
        icon={Trash2}
        label="Clear Canvas"
        onClick={onClear}
        disabled={isProcessing || !hasImage}
      />
      
      <ToolButton
        icon={Download}
        label="Export"
        onClick={onDownload}
        disabled={isProcessing || !hasImage}
      />
    </div>
  );
}
