'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Pen, 
  Eraser, 
  Square, 
  Circle, 
  Type, 
  Undo, 
  Redo, 
  Minimize2 
} from 'lucide-react';

interface WhiteboardProps {
  onClose: () => void;
}

export function Whiteboard({ onClose }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser' | 'text'>('pen');

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineWidth = currentTool === 'eraser' ? 20 : 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = currentTool === 'eraser' ? '#000000' : '#ffffff';
      ctx.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over';
      
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="fixed top-20 right-6 w-[600px] h-[400px] bg-black rounded-lg flex flex-col shadow-2xl border border-white/10">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="text-white text-lg font-semibold">Whiteboard</h2>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={currentTool === 'pen' ? 'secondary' : 'ghost'}
            onClick={() => setCurrentTool('pen')}
            className="text-white hover:bg-white/20"
          >
            <Pen className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={currentTool === 'eraser' ? 'secondary' : 'ghost'}
            onClick={() => setCurrentTool('eraser')}
            className="text-white hover:bg-white/20"
          >
            <Eraser className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            <Square className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            <Circle className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            <Type className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-gray-600 mx-2"></div>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            <Redo className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={clearCanvas}
            className="text-white hover:bg-white/20"
          >
            Clear
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          width={600}
          height={320}
          className="w-full h-full cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{ 
            background: '#000000',
            cursor: currentTool === 'eraser' ? 'grab' : 'crosshair'
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-white/30 text-xl font-semibold">
            {currentTool === 'pen' ? 'Draw here...' : currentTool === 'eraser' ? 'Erase mode' : 'Select tool'}
          </span>
        </div>
      </div>
    </div>
  );
}