# Custom Video Player Web Component with React and TypeScript

This project demonstrates how to create a custom video player as a Web Component and integrate it with a React application using TypeScript. It showcases:

1. Creating a native Web Component (Custom Element) with Shadow DOM
2. Integrating the Web Component with React
3. Passing data from React to the Web Component
4. Handling custom events from the Web Component in React
5. Accessing Web Component methods from React using refs

## Project Structure

- `src/components/video-player.ts` - The native Web Component definition in TypeScript
- `src/components/VideoPlayerComponent.tsx` - React wrapper for the Web Component
- `src/App.tsx` - Main application that uses the Video Player
- `src/App.css` - Styling for the application
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite configuration

## Features

- Custom video controls with play/pause button
- Progress tracking
- Event handling between Web Component and React
- Exposed methods for controlling the video playback from React

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start the development server:
   ```bash
   pnpm run dev
   ```
4. Open your browser and navigate to the URL shown in the terminal (typically http://localhost:5173/)

## Understanding the Code

### Web Component

The `VideoPlayer` custom element provides:

- Shadow DOM encapsulation for styles and DOM
- Custom controls that can be shown/hidden
- Custom events for time updates and playback completion
- Public methods for controlling playback

### React Integration

The React component:

- Handles passing props to the Web Component as attributes
- Sets up event listeners for custom events
- Provides a ref for accessing Web Component methods
- Renders custom React controls that interact with the Web Component

## Why Use Web Components with React?

Web Components provide:

- True encapsulation with Shadow DOM
- Reusable components that work across frameworks
- Browser-native technology that will continue to work even if you switch frameworks

React provides:

- Powerful state management
- Declarative UI updates
- Rich ecosystem of libraries and tools

By combining them, you get the best of both worlds: encapsulated, reusable components that can be used with or without React, while still leveraging React's powerful features when needed.

## Browser Support

This project uses modern Web Component features which are supported in all modern browsers. For legacy browser support, consider using polyfills.
