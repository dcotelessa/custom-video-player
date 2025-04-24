import React, { useRef, useEffect } from 'react';
import './video-player'; // Import the custom element definition

// Declare the video player element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'video-player': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        poster?: string;
        autoplay?: string;
        controls?: string;
        muted?: string;
        loop?: string;
        ref?: React.Ref<HTMLElement>;
      };
    }
  }
}

interface VideoTimeUpdateDetail {
  currentTime: number;
  duration: number;
}

interface VideoPlayerComponentProps {
  src?: string;
  poster?: string;
  autoplay?: boolean;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
  onTimeUpdate?: (detail: VideoTimeUpdateDetail) => void;
  onEnded?: () => void;
}

// Interface for the custom element methods we want to access
interface VideoPlayerElement extends HTMLElement {
  play: () => void;
  pause: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMuteVideo: () => void;
}

const VideoPlayerComponent: React.FC<VideoPlayerComponentProps> = ({ 
  src, 
  poster, 
  autoplay = false, 
  controls = false, 
  muted = false,
  loop = false,
  onTimeUpdate,
  onEnded
}) => {
  // Use properly typed ref
  const playerRef = useRef<VideoPlayerElement | null>(null);
  
  useEffect(() => {
    // Get reference to custom element
    const videoPlayerElement = playerRef.current;
    
    // Set up event listeners for custom events
    const handleTimeUpdate = (e: Event) => {
      if (onTimeUpdate) {
        // Cast to CustomEvent with our expected detail structure
        const customEvent = e as CustomEvent<VideoTimeUpdateDetail>;
        onTimeUpdate(customEvent.detail);
      }
    };
    
    const handleEnded = () => {
      if (onEnded) {
        onEnded();
      }
    };
    
    const handleError = (e: Event) => {
      console.error('Video error event received in React:', (e as CustomEvent).detail);
    };
    
    if (videoPlayerElement) {
      videoPlayerElement.addEventListener('videotimeupdate', handleTimeUpdate);
      videoPlayerElement.addEventListener('videoended', handleEnded);
      videoPlayerElement.addEventListener('videoerror', handleError);
    }
    
    // Clean up
    return () => {
      if (videoPlayerElement) {
        videoPlayerElement.removeEventListener('videotimeupdate', handleTimeUpdate);
        videoPlayerElement.removeEventListener('videoended', handleEnded);
        videoPlayerElement.removeEventListener('videoerror', handleError);
      }
    };
  }, [onTimeUpdate, onEnded]);
  
  // Create props object for the custom element
  const videoProps: Record<string, string> = {};
  if (src) videoProps.src = src;
  if (poster) videoProps.poster = poster;
  if (autoplay) videoProps.autoplay = '';
  if (controls) videoProps.controls = '';
  if (muted) videoProps.muted = '';
  if (loop) videoProps.loop = '';
  
  return (
    <div className="video-player-wrapper">
      {React.createElement('video-player', {
        ref: playerRef,
        ...videoProps,
        className: "accessible-video-player",
      })}
    </div>
  );
};

export default VideoPlayerComponent;
