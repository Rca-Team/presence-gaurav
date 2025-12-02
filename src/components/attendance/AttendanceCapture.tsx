import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import Webcam from "@/components/ui/webcam";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Camera } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useMediaPipeFaceDetection } from "@/hooks/useMediaPipeFaceDetection";
import { FaceDetectionOverlay } from "./FaceDetectionOverlay";
import { supabase } from "@/integrations/supabase/client";

export const AttendanceCapture = () => {
  const webcamRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognitionResults, setRecognitionResults] = useState<any[]>([]);
  
  const { 
    isInitialized,
    isDetecting,
    detectedFaces,
    error: detectionError,
    startContinuousDetection,
    stopDetection,
    captureFrame
  } = useMediaPipeFaceDetection();

  // Start continuous detection when webcam is ready
  useEffect(() => {
    if (isInitialized && webcamRef.current && !isDetecting) {
      startContinuousDetection(webcamRef.current);
    }

    return () => {
      stopDetection();
    };
  }, [isInitialized, startContinuousDetection, stopDetection, isDetecting]);

  const handleCapture = async () => {
    if (!webcamRef.current || !isInitialized) {
      toast({
        title: "Not Ready",
        description: "Face detection is still initializing",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Capture frame with detected faces
      const detectionResult = await captureFrame(webcamRef.current);
      
      if (!detectionResult || detectionResult.faces.length === 0) {
        return; // Toast already shown in captureFrame
      }

      toast({
        title: "Processing Faces",
        description: `Detected ${detectionResult.faces.length} face(s), recognizing...`
      });

      // Send to backend for recognition
      const { data, error } = await supabase.functions.invoke('face-recognition-arcface', {
        body: {
          imageData: detectionResult.imageData,
          faces: detectionResult.faces.map(f => ({
            id: f.id,
            boundingBox: f.boundingBox
          }))
        }
      });

      if (error) throw error;

      const results = data.results;
      setRecognitionResults(results);

      // Count recognized vs unrecognized
      const recognized = results.filter((r: any) => r.recognized);
      const unrecognized = results.filter((r: any) => !r.recognized);

      toast({
        title: "Recognition Complete",
        description: `Recognized: ${recognized.length}, Unknown: ${unrecognized.length}`,
      });

      // Record attendance for recognized faces
      for (const result of recognized) {
        if (result.userId) {
          await supabase.from('attendance_records').insert({
            user_id: result.userId,
            status: 'present',
            confidence_score: result.confidence,
            timestamp: new Date().toISOString(),
            face_descriptor: JSON.stringify(result.embedding)
          });
        }
      }

      if (recognized.length > 0) {
        toast({
          title: "Attendance Recorded",
          description: `${recognized.length} student(s) marked present`,
        });
      }

    } catch (err) {
      console.error('Recognition error:', err);
      toast({
        title: "Recognition Failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="relative p-6 backdrop-blur-sm bg-card/50 border-primary/20">
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10 rounded-lg">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <div>
              <p className="text-lg font-semibold">Loading MediaPipe Face Detection</p>
              <p className="text-sm text-muted-foreground">Initializing AI models...</p>
            </div>
          </div>
        </div>
      )}

      {detectionError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Detection Error</AlertTitle>
          <AlertDescription>{detectionError}</AlertDescription>
        </Alert>
      )}

      <div className="relative">
        <Webcam 
          ref={webcamRef}
          className="rounded-lg w-full"
          autoStart={true}
        />
        
        {isInitialized && webcamRef.current && (
          <FaceDetectionOverlay 
            videoRef={webcamRef}
            faces={detectedFaces}
            recognizedFaces={new Set(recognitionResults.filter(r => r.recognized).map(r => r.faceId))}
          />
        )}

        {detectedFaces.length > 0 && (
          <div className="absolute top-4 right-4 bg-primary/90 text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold">
            {detectedFaces.length} face(s) detected
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-center">
        <Button
          onClick={handleCapture}
          disabled={isProcessing || !isInitialized || detectedFaces.length === 0}
          size="lg"
          className="gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Camera className="w-5 h-5" />
              Capture & Recognize ({detectedFaces.length} faces)
            </>
          )}
        </Button>
      </div>

      {recognitionResults.length > 0 && (
        <div className="mt-6 space-y-2">
          <h3 className="font-semibold">Recognition Results:</h3>
          <div className="space-y-2">
            {recognitionResults.map((result: any, idx: number) => (
              <div 
                key={idx}
                className={`p-3 rounded-lg border ${
                  result.recognized 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-yellow-500/10 border-yellow-500/30'
                }`}
              >
                {result.recognized ? (
                  <div>
                    <p className="font-medium text-green-600 dark:text-green-400">
                      ✓ {result.username}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Confidence: {Math.round(result.confidence * 100)}%
                    </p>
                  </div>
                ) : (
                  <p className="text-yellow-600 dark:text-yellow-400">
                    Unknown face - Not registered
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default AttendanceCapture;
