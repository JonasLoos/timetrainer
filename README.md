# Time Trainer

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
