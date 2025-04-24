import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "video-player": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        poster?: string;
        autoplay?: string;
        controls?: string;
        muted?: string;
        loop?: string;
      };
    }
  }
}
