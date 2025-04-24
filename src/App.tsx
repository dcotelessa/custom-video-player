// src/App.tsx
import { useState } from 'react';
import VideoPlayerComponent from './components/VideoPlayerComponent';
import './App.css';

interface VideoInfo {
  currentTime: number;
  duration: number;
}

function App() {
  const [videoInfo, setVideoInfo] = useState<VideoInfo>({ currentTime: 0, duration: 0 });
  
  const handleTimeUpdate = ({ currentTime, duration }: VideoInfo) => {
    setVideoInfo({ currentTime, duration });
  };
  
  const handleVideoEnded = () => {
    console.log('Video playback completed');
  };

  // Sample video from a reliable source - Big Buck Bunny (open source movie)
  const sampleVideoSrc = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  const samplePosterSrc = "https://peach.blender.org/wp-content/uploads/bbb-splash.png";
  
  return (
    <div className="app">
      <h1>Custom Video Player Example</h1>
      
      <div className="video-container">
        <VideoPlayerComponent
          src={sampleVideoSrc}
          poster={samplePosterSrc}
          muted
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnded}
        />
      </div>
      
      <div className="video-info">
        <p>Current time: {Math.round(videoInfo.currentTime)}s / Total duration: {Math.round(videoInfo.duration || 0)}s</p>
      </div>
    </div>
  );
}

export default App;
