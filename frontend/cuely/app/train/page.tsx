'use client';

import { useState, useEffect } from 'react';
import WebcamCapture from '@/components/Webcam/WebcamCapture';

interface Scenario {
  _id: string;
  title: string;
  description: string;
  audio: {
    audioUrl: string;
    transcript: string;
    durationSeconds: number;
  };
}

export default function TrainingPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [phase, setPhase] = useState<'select' | 'listen' | 'respond' | 'results'>('select');

  // Fetch scenarios on mount
  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    try {
      const response = await fetch('/api/scenarios');
      const data = await response.json();
      if (data.success) {
        setScenarios(data.data);
      }
    } catch (error) {
      console.error('Error fetching scenarios:', error);
    }
  };

  const startSession = async (scenario: Scenario) => {
    try {
      const response = await fetch('/api/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // userId: 'USER_ID_HERE', // Optional now
          scenarioId: scenario._id
        })
      });

      const data = await response.json();
      if (data.success) {
        setSessionId(data.data.sessionId);
        setSelectedScenario(scenario);
        setPhase('listen');
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const handleCapture = (imageSrc: string) => {
    setCapturedImage(imageSrc);
    console.log('Image captured:', imageSrc.substring(0, 50) + '...');
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setPhase('respond');
  };

  const handleStopRecording = async (videoBlob: Blob) => {
    setIsRecording(false);
    
    // Send to backend for analysis directly with the blob
    await handleSessionCompletion(videoBlob);
  };


  
  // Revised completion handler that accepts Blob directly
  const handleSessionCompletion = async (videoBlob: Blob) => {
    if (!sessionId) return;
    
    try {
      const formData = new FormData();
      formData.append('video', videoBlob, 'session-recording.webm');
      formData.append('transcript', 'User response transcript here'); // Placeholder for now
      // Presage data would go here if available
      // formData.append('presageData', JSON.stringify({
      //    baselineHeartRate: 70,
      //    avgHeartRateDuringResponse: 75,
      //    stressLevel: 'low',
      //    engagementScore: 80
      // }));

      const response = await fetch(`/api/sessions/${sessionId}/complete`, {
        method: 'PUT',
        body: formData, // No Content-Type header needed, browser sets it for FormData
      });

      const data = await response.json();
      if (data.success) {
        console.log('Analysis:', data.data.analysis);
        setPhase('results');
      } else {
        console.error('Session completion failed:', data.message);
      }
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">EmPath Training</h1>

        {/* Scenario Selection */}
        {phase === 'select' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Choose a Scenario</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scenarios.map((scenario) => (
                <div
                  key={scenario._id}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                  onClick={() => startSession(scenario)}
                >
                  <h3 className="text-xl font-semibold mb-2">{scenario.title}</h3>
                  <p className="text-gray-600">{scenario.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Listening Phase */}
        {phase === 'listen' && selectedScenario && (
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">{selectedScenario.title}</h2>
            <p className="text-gray-600 mb-6">{selectedScenario.description}</p>
            
            <div className="mb-6">
              <audio controls className="w-full">
                <source src={selectedScenario.audio.audioUrl} type="audio/mpeg" />
              </audio>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-700">{selectedScenario.audio.transcript}</p>
            </div>

            <button
              onClick={() => setPhase('respond')}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Ready to Respond →
            </button>
          </div>
        )}

        {/* Response Phase */}
        {phase === 'respond' && (
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-6">Your Response</h2>
            
            <div className="mb-6">
              <WebcamCapture
                onCapture={handleCapture}
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecording}
                isRecording={isRecording}
                showControls={true}
              />
            </div>

            {capturedImage && (
              <div className="mt-4">
                <p className="text-sm text-green-600">✓ Snapshot captured</p>
              </div>
            )}
          </div>
        )}

        {/* Results Phase */}
        {phase === 'results' && (
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-6">Your Results</h2>
            <p className="text-gray-600">Analysis complete! Check console for details.</p>
            
            <button
              onClick={() => {
                setPhase('select');
                setSessionId(null);
                setSelectedScenario(null);
                setCapturedImage(null);
              }}
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Try Another Scenario
            </button>
          </div>
        )}
      </div>
    </div>
  );
}