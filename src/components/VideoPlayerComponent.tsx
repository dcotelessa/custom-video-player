import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import './video-player'; // Import the custom element definition

// Import the VideoTimeUpdateDetail interface from our types
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
  type?: string;
  onTimeUpdate?: (detail: VideoTimeUpdateDetail) => void;
  onEnded?: () => void;
  onError?: (detail: { error: MediaError | null }) => void;
}

// Use the global VideoPlayerElement interface defined in custom-elements.d.ts
const VideoPlayerComponent = forwardRef<HTMLElement, VideoPlayerComponentProps>(({ 
  src, 
  poster, 
  autoplay = false, 
  controls = false, 
  muted = false,
  loop = false,
  type,
  onTimeUpdate,
  onEnded,
  onError
}, ref) => {
  // Use the VideoPlayerElement interface for proper typing
  const playerRef = useRef<VideoPlayerElement | null>(null);
  
  // Forward the ref to the parent component
  useImperativeHandle(ref, () => playerRef.current as HTMLElement);
  
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
      if (onError) {
        const customEvent = e as CustomEvent<{error: MediaError | null}>;
        onError(customEvent.detail);
      } else {
        console.error('Video error event received in React:', (e as CustomEvent).detail);
      }
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
  }, [onTimeUpdate, onEnded, onError]);
  
  // Create props object for the custom element
  const videoProps: Record<string, string> = {};
  if (src) videoProps.src = src;
  if (poster) videoProps.poster = poster;
  if (autoplay) videoProps.autoplay = '';
  if (controls) videoProps.controls = '';
  if (muted) videoProps.muted = '';
  if (loop) videoProps.loop = '';
  if (type) videoProps.type = type;
  
  return (
    <div className="video-player-wrapper">
      {React.createElement('video-player', {
        ref: playerRef,
        ...videoProps,
        className: "accessible-video-player",
      })}
    </div>
  );
});

export default VideoPlayerComponent;
