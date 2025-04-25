// Define VideoPlayer element for React JSX
declare namespace JSX {
  interface IntrinsicElements {
    'video-player': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      src?: string;
      poster?: string;
      autoplay?: string;
      controls?: string;
      muted?: string;
      loop?: string;
      type?: string;
    };
  }
}

// Define custom events for the VideoPlayer element
interface VideoTimeUpdateDetail {
  currentTime: number;
  duration: number;
}

interface VideoPlayerErrorDetail {
  error: MediaError | null;
}

interface CustomEventMap {
  'videotimeupdate': CustomEvent<VideoTimeUpdateDetail>;
  'videoended': CustomEvent<void>;
  'videoerror': CustomEvent<VideoPlayerErrorDetail>;
}

// Define methods and properties for the VideoPlayer element
interface VideoPlayerElement extends HTMLElement {
  // Methods
  play(): void;
  pause(): void;
  seekTo(time: number): void;
  setVolume(volume: number): void;
  toggleMuteVideo(): void;
  
  // Event listener overloads for custom events
  addEventListener<K extends keyof CustomEventMap>(
    type: K,
    listener: (this: VideoPlayerElement, ev: CustomEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  
  // Remove event listener overloads
  removeEventListener<K extends keyof CustomEventMap>(
    type: K,
    listener: (this: VideoPlayerElement, ev: CustomEventMap[K]) => void,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}
