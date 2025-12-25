import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { LucideIcon } from 'lucide-react';

interface ToolButtonProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  disabled?: boolean;
  shortcut?: string;
}

export function ToolButton({ 
  icon: Icon, 
  label, 
  isActive, 
  onClick, 
  disabled,
  shortcut 
}: ToolButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          disabled={disabled}
          className={cn(
            "w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200",
            "hover:bg-toolbar-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            isActive && "bg-primary text-primary-foreground shadow-glow",
            !isActive && "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="w-5 h-5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-popover border-border">
        <div className="flex items-center gap-2">
          <span>{label}</span>
          {shortcut && (
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded text-muted-foreground">
              {shortcut}
            </kbd>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
