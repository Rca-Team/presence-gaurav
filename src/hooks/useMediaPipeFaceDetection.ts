import { useState, useEffect, useCallback, useRef } from 'react';
import { mediaPipeService, DetectedFace, DetectionResult } from '@/services/face-detection/MediaPipeService';
import { useToast } from '@/hooks/use-toast';

export const useMediaPipeFaceDetection = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedFaces, setDetectedFaces] = useState<DetectedFace[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const detectionFrameRef = useRef<number>();

  useEffect(() => {
    const init = async () => {
      try {
        await mediaPipeService.initialize();
        setIsInitialized(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to initialize face detection';
        setError(message);
        toast({
          title: "Detection Error",
          description: message,
          variant: "destructive"
        });
      }
    };

    init();

    return () => {
      stopDetection();
      mediaPipeService.cleanup();
    };
  }, [toast]);

  const startContinuousDetection = useCallback((
    videoElement: HTMLVideoElement,
    onDetection?: (result: DetectionResult) => void
  ) => {
    if (!isInitialized || !videoElement) return;

    setIsDetecting(true);
    
    const detect = async () => {
      try {
        const result = await mediaPipeService.detectFaces(videoElement, 50);
        setDetectedFaces(result.faces);
        
        if (onDetection) {
          onDetection(result);
        }

        if (isDetecting) {
          detectionFrameRef.current = requestAnimationFrame(detect);
        }
      } catch (err) {
        console.error('Detection error:', err);
      }
    };

    detect();
  }, [isInitialized, isDetecting]);

  const stopDetection = useCallback(() => {
    setIsDetecting(false);
    if (detectionFrameRef.current) {
      cancelAnimationFrame(detectionFrameRef.current);
    }
    setDetectedFaces([]);
  }, []);

  const captureFrame = useCallback(async (
    videoElement: HTMLVideoElement
  ): Promise<DetectionResult | null> => {
    if (!isInitialized) {
      toast({
        title: "Not Ready",
        description: "Face detection is still initializing",
        variant: "destructive"
      });
      return null;
    }

    try {
      const result = await mediaPipeService.detectFaces(videoElement, 50);
      
      if (result.faces.length === 0) {
        toast({
          title: "No Faces Detected",
          description: "Please position faces in the frame",
          variant: "destructive"
        });
        return null;
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to detect faces';
      toast({
        title: "Detection Failed",
        description: message,
        variant: "destructive"
      });
      return null;
    }
  }, [isInitialized, toast]);

  return {
    isInitialized,
    isDetecting,
    detectedFaces,
    error,
    startContinuousDetection,
    stopDetection,
    captureFrame
  };
};
