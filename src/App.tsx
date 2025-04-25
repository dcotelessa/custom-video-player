// src/App.tsx
import { useState, useRef } from 'react';
import VideoPlayerComponent from './components/VideoPlayerComponent';
import './App.css';

// Make sure VideoPlayerElement type is recognized
declare global {
  interface VideoPlayerElement extends HTMLElement {
    play(): void;
    pause(): void;
    seekTo(time: number): void;
    setVolume(volume: number): void;
    toggleMuteVideo(): void;
  }
}

interface VideoInfo {
  currentTime: number;
  duration: number;
  hasError: boolean;
  errorMessage: string;
}

function App() {
  const [videoInfo, setVideoInfo] = useState<VideoInfo>({ 
    currentTime: 0, 
    duration: 0,
    hasError: false,
    errorMessage: ''
  });
  
  // Reference to the video component for direct method access
  const videoRef = useRef<HTMLElement>(null);
  
  const handleTimeUpdate = ({ currentTime, duration }: { currentTime: number; duration: number }) => {
    setVideoInfo(prev => ({ ...prev, currentTime, duration }));
  };
  
  const handleVideoEnded = () => {
    console.log('Video playback completed');
  };

  const handleVideoError = ({ error }: { error: MediaError | null }) => {
    let errorMessage = 'Unknown video error';
    
    if (error) {
      switch (error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          errorMessage = 'Video playback was aborted';
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          errorMessage = 'Network error while loading video';
          break;
        case MediaError.MEDIA_ERR_DECODE:
          errorMessage = 'Video could not be decoded';
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = 'Video format not supported by your browser';
          break;
      }
    }
    
    setVideoInfo(prev => ({ 
      ...prev, 
      hasError: true, 
      errorMessage 
    }));
  };

  // Sample video from a reliable source - Big Buck Bunny (open source movie)
  const sampleVideoSrc = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  const samplePosterSrc = "https://peach.blender.org/wp-content/uploads/bbb-splash.png";
  
  // Example function to demonstrate controlling the video through the ref
  const seekToMiddle = () => {
    if (videoRef.current && videoInfo.duration > 0) {
      // Access custom element methods through the ref
      (videoRef.current as VideoPlayerElement).seekTo(videoInfo.duration / 2);
    }
  };
  
  return (
    <div className="app">
      <h1>Custom Video Player Example</h1>
      
      <div className="video-container">
        <VideoPlayerComponent
          ref={videoRef}
          src={sampleVideoSrc}
          poster={samplePosterSrc}
          muted
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnded}
          onError={handleVideoError}
        />
      </div>
      
      <div className="video-info">
        {videoInfo.hasError ? (
          <p className="error">Error: {videoInfo.errorMessage}</p>
        ) : (
          <p>Current time: {Math.round(videoInfo.currentTime)}s / Total duration: {Math.round(videoInfo.duration || 0)}s</p>
        )}
      </div>
      
      <div className="video-controls">
        <button onClick={seekToMiddle}>Skip to Middle</button>
      </div>
    </div>
  );
}

export default App;
