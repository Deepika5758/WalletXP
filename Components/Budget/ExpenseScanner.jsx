import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ExpenseScanner({ isOpen, onClose, onExpenseDetected }) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      setCameraStream(stream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please check permissions or use file upload.');
    }
  };

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  }, [cameraStream]);

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob(async (blob) => {
      if (blob) {
        await processImage(blob);
      }
    }, 'image/jpeg', 0.9);
    
    stopCamera();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await processImage(file);
    }
  };

  const processImage = async (imageBlob) => {
    setScanning(true);
    setError(null);
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: imageBlob });
      
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            total_amount: { type: "number", description: "Total bill amount in INR" },
            category: { 
              type: "string",
              enum: ["food", "transport", "shopping", "entertainment", "utilities", "healthcare", "education", "groceries", "other"]
            },
            description: { type: "string", description: "Brief description of the expense" },
            vendor_name: { type: "string", description: "Name of the shop or vendor" },
            date: { type: "string", description: "Date on the receipt if visible" }
          }
        }
      });
      
      if (result.status === 'success' && result.output) {
        onExpenseDetected({
          amount: result.output.total_amount || 0,
          category: result.output.category || 'other',
          description: result.output.description || result.output.vendor_name || 'Scanned expense'
        });
        onClose();
      } else {
        setError('Could not extract data from receipt. Please try again or enter manually.');
      }
    } catch (err) {
      console.error('Scan error:', err);
      setError('Failed to scan receipt. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Scan Receipt
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {showCamera ? (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg bg-black"
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-2 mt-4">
                <Button onClick={stopCamera} variant="outline" className="flex-1">
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
                <Button onClick={capturePhoto} className="flex-1 bg-green-600 hover:bg-green-700">
                  <Camera className="w-4 h-4 mr-2" /> Capture
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                onClick={startCamera}
                className="w-full h-24 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                disabled={scanning}
              >
                <Camera className="w-6 h-6 mr-2" />
                Open Camera
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full h-16"
                disabled={scanning}
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload from Gallery
              </Button>
            </div>
          )}
          
          {scanning && (
            <div className="flex items-center justify-center gap-2 text-blue-600 py-4">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing receipt...</span>
            </div>
          )}
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
