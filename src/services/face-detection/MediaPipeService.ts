import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';

export interface DetectedFace {
  id: string;
  boundingBox: {
    originX: number;
    originY: number;
    width: number;
    height: number;
  };
  keypoints: Array<{ x: number; y: number }>;
  confidence: number;
}

export interface DetectionResult {
  faces: DetectedFace[];
  imageData: string; // base64 image
  timestamp: number;
}

class MediaPipeFaceDetectionService {
  private faceDetector: FaceDetector | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        console.log('Initializing MediaPipe Face Detector...');
        
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        this.faceDetector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          minDetectionConfidence: 0.5,
          minSuppressionThreshold: 0.3
        });

        this.isInitialized = true;
        console.log('MediaPipe Face Detector initialized successfully');
      } catch (error) {
        console.error('Failed to initialize MediaPipe:', error);
        this.initPromise = null;
        throw error;
      }
    })();

    return this.initPromise;
  }

  async detectFaces(
    videoElement: HTMLVideoElement,
    maxFaces: number = 50
  ): Promise<DetectionResult> {
    if (!this.isInitialized || !this.faceDetector) {
      await this.initialize();
    }

    const startTime = performance.now();
    const detections = this.faceDetector!.detectForVideo(videoElement, startTime);

    const faces: DetectedFace[] = detections.detections
      .slice(0, maxFaces)
      .map((detection, index) => ({
        id: `face_${Date.now()}_${index}`,
        boundingBox: {
          originX: detection.boundingBox?.originX || 0,
          originY: detection.boundingBox?.originY || 0,
          width: detection.boundingBox?.width || 0,
          height: detection.boundingBox?.height || 0,
        },
        keypoints: detection.keypoints?.map(kp => ({ x: kp.x, y: kp.y })) || [],
        confidence: detection.categories?.[0]?.score || 0
      }));

    // Capture frame as base64
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoElement, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.95);

    return {
      faces,
      imageData,
      timestamp: Date.now()
    };
  }

  isReady(): boolean {
    return this.isInitialized && this.faceDetector !== null;
  }

  async cleanup(): Promise<void> {
    if (this.faceDetector) {
      this.faceDetector.close();
      this.faceDetector = null;
      this.isInitialized = false;
      this.initPromise = null;
    }
  }
}

export const mediaPipeService = new MediaPipeFaceDetectionService();
