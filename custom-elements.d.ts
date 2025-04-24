declare namespace JSX {
  interface IntrinsicElements {
    // Note: quotes around the element name is important for kebab-case names
    "video-player": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      src?: string;
      poster?: string;
      autoplay?: string;
      controls?: string;
      muted?: string;
      loop?: string;
      ref?: React.RefObject<HTMLElement>;
    };
  }
}

// Define custom events
interface CustomEventMap {
  'videotimeupdate': CustomEvent<{
    currentTime: number;
    duration: number;
  }>;
  'videoended': CustomEvent<void>;
}

// Declare the VideoPlayer interface
interface VideoPlayerElement extends HTMLElement {
  play(): void;
  pause(): void;
  seekTo(time: number): void;
  
  // Add event listener overloads
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
