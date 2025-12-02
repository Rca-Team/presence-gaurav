import { useEffect, useRef } from 'react';
import { DetectedFace } from '@/services/face-detection/MediaPipeService';

interface FaceDetectionOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  faces: DetectedFace[];
  recognizedFaces?: Set<string>;
}

export const FaceDetectionOverlay = ({ 
  videoRef, 
  faces, 
  recognizedFaces = new Set() 
}: FaceDetectionOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Match canvas size to video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw bounding boxes for each face
    faces.forEach((face) => {
      const { originX, originY, width, height } = face.boundingBox;
      const isRecognized = recognizedFaces.has(face.id);

      // Set color based on recognition status
      ctx.strokeStyle = isRecognized ? '#10b981' : '#3b82f6';
      ctx.lineWidth = 3;
      ctx.strokeRect(originX, originY, width, height);

      // Draw confidence score
      ctx.fillStyle = isRecognized ? '#10b981' : '#3b82f6';
      ctx.font = '16px sans-serif';
      ctx.fillText(
        `${isRecognized ? '✓ ' : ''}${Math.round(face.confidence * 100)}%`,
        originX,
        originY - 8
      );

      // Draw keypoints
      if (face.keypoints && face.keypoints.length > 0) {
        ctx.fillStyle = isRecognized ? '#10b981' : '#3b82f6';
        face.keypoints.forEach((kp) => {
          ctx.beginPath();
          ctx.arc(kp.x * canvas.width, kp.y * canvas.height, 3, 0, 2 * Math.PI);
          ctx.fill();
        });
      }
    });
  }, [faces, videoRef, recognizedFaces]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ 
        transform: 'scaleX(-1)', // Mirror to match video
        zIndex: 10 
      }}
    />
  );
};
