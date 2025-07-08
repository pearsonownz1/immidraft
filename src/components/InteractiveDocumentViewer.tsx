import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, ZoomOut, RotateCw, Download, Eye, EyeOff } from 'lucide-react';
import { OCRResult } from '../services/ocrService';

interface InteractiveDocumentViewerProps {
  documentUrl?: string;
  ocrResults: OCRResult[];
  onBoundingBoxClick?: (result: OCRResult) => void;
  onTextEdit?: (index: number, newText: string) => void;
}

const InteractiveDocumentViewer: React.FC<InteractiveDocumentViewerProps> = ({
  documentUrl,
  ocrResults,
  onBoundingBoxClick,
  onTextEdit
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [selectedBox, setSelectedBox] = useState<number | null>(null);
  const [hoveredBox, setHoveredBox] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<{ index: number; text: string } | null>(null);
  const [documentImage, setDocumentImage] = useState<HTMLImageElement | null>(null);

  // Load document image
  useEffect(() => {
    if (documentUrl) {
      const img = new Image();
      img.onload = () => {
        setDocumentImage(img);
      };
      img.src = documentUrl;
    }
  }, [documentUrl]);

  // Draw document and bounding boxes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !documentImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = documentImage.width * zoom;
    canvas.height = documentImage.height * zoom;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw document image
    ctx.drawImage(documentImage, 0, 0, canvas.width, canvas.height);

    // Draw bounding boxes if enabled
    if (showBoundingBoxes) {
      ocrResults.forEach((result, index) => {
        const [x1, y1, x2, y2] = result.bbox;
        const x = x1 * zoom;
        const y = y1 * zoom;
        const width = (x2 - x1) * zoom;
        const height = (y2 - y1) * zoom;

        // Set box style based on type and state
        let strokeColor = '#10B981'; // Green for default
        let fillColor = 'rgba(16, 185, 129, 0.1)';
        let lineWidth = 2;

        if (result.type === 'table' || result.type === 'cell') {
          strokeColor = '#3B82F6'; // Blue for tables
          fillColor = 'rgba(59, 130, 246, 0.1)';
        } else if (result.type === 'header') {
          strokeColor = '#8B5CF6'; // Purple for headers
          fillColor = 'rgba(139, 92, 246, 0.1)';
        }

        if (index === selectedBox) {
          strokeColor = '#EF4444'; // Red for selected
          fillColor = 'rgba(239, 68, 68, 0.2)';
          lineWidth = 3;
        } else if (index === hoveredBox) {
          lineWidth = 3;
          fillColor = fillColor.replace('0.1', '0.2');
        }

        // Draw bounding box
        ctx.strokeStyle = strokeColor;
        ctx.fillStyle = fillColor;
        ctx.lineWidth = lineWidth;
        
        ctx.fillRect(x, y, width, height);
        ctx.strokeRect(x, y, width, height);

        // Draw confidence score
        if (result.confidence < 0.9) {
          ctx.fillStyle = '#EF4444';
          ctx.font = '12px Arial';
          ctx.fillText(`${Math.round(result.confidence * 100)}%`, x, y - 5);
        }
      });
    }
  }, [documentImage, ocrResults, zoom, showBoundingBoxes, selectedBox, hoveredBox]);

  // Handle canvas click
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoom;
    const y = (event.clientY - rect.top) / zoom;

    // Find clicked bounding box
    for (let i = ocrResults.length - 1; i >= 0; i--) {
      const result = ocrResults[i];
      const [x1, y1, x2, y2] = result.bbox;
      
      if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
        setSelectedBox(i);
        onBoundingBoxClick?.(result);
        return;
      }
    }

    setSelectedBox(null);
  };

  // Handle canvas mouse move for hover effects
  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoom;
    const y = (event.clientY - rect.top) / zoom;

    // Find hovered bounding box
    let foundHover = null;
    for (let i = ocrResults.length - 1; i >= 0; i--) {
      const result = ocrResults[i];
      const [x1, y1, x2, y2] = result.bbox;
      
      if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
        foundHover = i;
        break;
      }
    }

    setHoveredBox(foundHover);
    canvas.style.cursor = foundHover !== null ? 'pointer' : 'default';
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.5));
  const toggleBoundingBoxes = () => setShowBoundingBoxes(prev => !prev);

  const handleTextEdit = (index: number, currentText: string) => {
    setEditingText({ index, text: currentText });
  };

  const saveTextEdit = () => {
    if (editingText) {
      onTextEdit?.(editingText.index, editingText.text);
      setEditingText(null);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800';
    if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <span>Document Viewer</span>
              {ocrResults.length > 0 && (
                <Badge variant="outline">
                  {ocrResults.length} elements detected
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleBoundingBoxes}
                className="flex items-center space-x-1"
              >
                {showBoundingBoxes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>{showBoundingBoxes ? 'Hide' : 'Show'} Boxes</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-auto max-h-96">
            {documentImage ? (
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                onMouseMove={handleCanvasMouseMove}
                onMouseLeave={() => setHoveredBox(null)}
                className="max-w-full"
              />
            ) : (
              <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p>Loading document...</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* OCR Results Panel */}
      {selectedBox !== null && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Element</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Text:</span>
                <Badge className={getConfidenceColor(ocrResults[selectedBox].confidence)}>
                  {Math.round(ocrResults[selectedBox].confidence * 100)}% confidence
                </Badge>
              </div>
              
              {editingText?.index === selectedBox ? (
                <div className="space-y-2">
                  <textarea
                    value={editingText.text}
                    onChange={(e) => setEditingText({ ...editingText, text: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    rows={3}
                  />
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={saveTextEdit}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingText(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="p-2 bg-gray-50 rounded-md">{ocrResults[selectedBox].text}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTextEdit(selectedBox, ocrResults[selectedBox].text)}
                  >
                    Edit Text
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Type:</span>
                  <Badge variant="outline" className="ml-2">
                    {ocrResults[selectedBox].type || 'text'}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Position:</span>
                  <span className="ml-2 text-gray-600">
                    ({ocrResults[selectedBox].bbox[0]}, {ocrResults[selectedBox].bbox[1]})
                  </span>
                </div>
              </div>

              {ocrResults[selectedBox].tableInfo && (
                <div className="p-3 bg-blue-50 rounded-md">
                  <h4 className="font-medium text-blue-800 mb-2">Table Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                    <div>Row: {ocrResults[selectedBox].tableInfo!.rowIndex + 1}</div>
                    <div>Column: {ocrResults[selectedBox].tableInfo!.colIndex + 1}</div>
                    <div>Row Span: {ocrResults[selectedBox].tableInfo!.rowSpan}</div>
                    <div>Col Span: {ocrResults[selectedBox].tableInfo!.colSpan}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-green-500 bg-green-100"></div>
              <span className="text-sm">Text</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-500 bg-blue-100"></div>
              <span className="text-sm">Table/Cell</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-purple-500 bg-purple-100"></div>
              <span className="text-sm">Header</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-red-500 bg-red-100"></div>
              <span className="text-sm">Selected</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveDocumentViewer;
