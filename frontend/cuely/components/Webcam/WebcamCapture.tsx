"use client";

import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";

interface WebcamCaptureProps {
  onCapture?: (imageSrc: string) => void;
  onStartRecording?: () => void;
  onStopRecording?: (videoBlob: Blob) => void;
  isRecording?: boolean;
  showControls?: boolean;
}

export default function WebcamCapture({
  onCapture,
  onStartRecording,
  onStopRecording,
  isRecording = false,
  showControls = true,
}: WebcamCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Webcam configuration
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };

  // Handle webcam user media
  const handleUserMedia = () => {
    setHasPermission(true);
  };

  const handleUserMediaError = () => {
    setHasPermission(false);
    console.error("Failed to access webcam");
  };

  const chunksRef = useRef<Blob[]>([]);

  // Capture single image
  const captureImage = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc && onCapture) {
        onCapture(imageSrc);
      }
    }
  }, [onCapture]);

  // Start video recording
  const startRecording = useCallback(() => {
    if (webcamRef.current && webcamRef.current.stream) {
      console.log("Starting recording...");
      const stream = webcamRef.current.stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm",
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = []; // Reset chunks
      setRecordedChunks([]);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log(`Video chunk received: ${event.data.size} bytes`);
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      if (onStartRecording) onStartRecording();
    }
  }, [onStartRecording]);

  // Stop video recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      console.log("Stopping recording...");
      mediaRecorderRef.current.stop();

      mediaRecorderRef.current.onstop = () => {
        const totalSize = chunksRef.current.reduce(
          (acc, chunk) => acc + chunk.size,
          0,
        );
        console.log(
          `Recording stopped. Total size: ${totalSize} bytes. Chunks: ${chunksRef.current.length}`,
        );

        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        chunksRef.current = []; // Clear after use
        if (onStopRecording) onStopRecording(blob);
      };
    }
  }, [onStopRecording]);

  return (
    <div className="relative w-full h-full flex flex-col items-center">
      {/* Permission Check */}
      {hasPermission === false && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white rounded-lg">
          <div className="text-center p-6">
            <p className="text-xl mb-4">📹 Camera access denied</p>
            <p className="text-sm text-gray-400">
              Please enable camera permissions in your browser settings
            </p>
          </div>
        </div>
      )}

      {/* Webcam */}
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          onUserMedia={handleUserMedia}
          onUserMediaError={handleUserMediaError}
          className="w-full h-full object-cover"
          mirrored={true}
        />

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="text-sm font-medium">Recording</span>
          </div>
        )}
      </div>

      {/* Controls */}
      {showControls && hasPermission && (
        <div className="mt-4 flex gap-3">
          <button
            onClick={captureImage}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            disabled={isRecording}
          >
            📸 Capture Photo
          </button>

          {!isRecording ? (
            <button
              onClick={startRecording}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              ⏺️ Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              ⏹️ Stop Recording
            </button>
          )}
        </div>
      )}
    </div>
  );
}
