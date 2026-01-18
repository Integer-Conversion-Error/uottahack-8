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
      <div className="relative w-full flex-1 min-h-0 bg-black rounded-lg overflow-hidden">
        <Webcam
          ref={webcamRef}
          audio={true}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          onUserMedia={handleUserMedia}
          onUserMediaError={handleUserMediaError}
          className="w-full h-full object-cover"
          mirrored={true}
        />

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full z-10">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="text-sm font-medium"></span>
          </div>
        )}

        {/* Controls Overlay */}
        {showControls && hasPermission && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition shadow-lg flex items-center gap-2 font-semibold"
              >
                <div className="w-4 h-4 bg-white rounded-full" />
                Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="px-6 py-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition shadow-lg flex items-center gap-2 font-semibold"
              >
                <div className="w-4 h-4 bg-red-500 rounded-sm" />
                Stop Recording
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
