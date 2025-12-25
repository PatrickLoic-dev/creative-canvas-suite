export type Tool = 
  | 'select' 
  | 'draw' 
  | 'crop' 
  | 'rotate' 
  | 'text'
  | 'eraser';

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  type: 'image' | 'drawing' | 'text';
}

export interface FilterSettings {
  brightness: number;
  contrast: number;
  saturation: number;
}

export interface EditorState {
  activeTool: Tool;
  brushColor: string;
  brushSize: number;
  filters: FilterSettings;
  layers: Layer[];
  activeLayerId: string | null;
  isProcessing: boolean;
}
