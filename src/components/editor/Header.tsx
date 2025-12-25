import { Sparkles, Loader2 } from 'lucide-react';

interface HeaderProps {
  isProcessing: boolean;
  processingStatus?: string;
}

export function Header({ isProcessing, processingStatus }: HeaderProps) {
  return (
    <header className="h-12 bg-toolbar border-b border-border flex items-center justify-between px-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-glow">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground tracking-tight">PixelForge</span>
        </div>
      </div>
      
      {isProcessing && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>{processingStatus || 'Processing...'}</span>
        </div>
      )}
      
      <div className="text-xs text-muted-foreground">
        Pro Image Editor
      </div>
    </header>
  );
}
