# Time Trainer PWA

A Progressive Web App for training your time perception skills with two interactive game modes.

## Features

- **Time Estimation Mode**: Listen to two beeps and guess the duration between them
- **Time Production Mode**: Wait for a target duration and tap when you think it has passed
- **Statistics Tracking**: Keep track of your performance over time
- **PWA Support**: Install on mobile devices and use offline
- **Audio Feedback**: Clear beep sounds to mark timing intervals

## Game Modes

### 1. Time Estimation 🎧
- Listen to two beeps
- Guess how many seconds passed between them
- Get immediate feedback on your accuracy

### 2. Time Production 👆
- See a target time (e.g., 5 seconds)
- Wait and tap the button when you think the time has passed
- See how close you were to the target

## Statistics
The app tracks your performance including:
- Number of games played
- Average error in seconds
- Best score for each mode

All statistics are stored locally in your browser.

## Deployment with CapRover

This app is ready to deploy with CapRover. Simply:

1. Create a new app in your CapRover dashboard
2. Upload this directory or connect to your git repository
3. CapRover will automatically build and deploy using the included `captain-definition` and `Dockerfile`

The app will be served using nginx with PWA-optimized headers and caching.

## Local Development

To run locally:
```bash
# Start a simple HTTP server
python3 -m http.server 8000
# or
npx serve .
```

Then open `http://localhost:8000` in your browser.

## PWA Installation

When accessed via HTTPS, users can install this app on their devices:
- **Mobile**: Use "Add to Home Screen" option
- **Desktop**: Look for the install icon in the address bar

## Browser Compatibility

- Modern browsers with Web Audio API support
- Service Worker support for offline functionality
- Local Storage for statistics persistence

## Files Structure

- `index.html` - Main application HTML
- `styles.css` - Styling and responsive design
- `script.js` - Game logic and PWA functionality
- `manifest.json` - PWA manifest file
- `sw.js` - Service worker for offline support
- `captain-definition` - CapRover deployment configuration
- `Dockerfile` - Docker container setup with nginx
