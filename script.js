// Time Trainer PWA - Main JavaScript File

class TimeTrainer {
    constructor() {
        this.currentMode = 'estimation';
        this.audioContext = null;
        this.statistics = this.loadStatistics();
        this.currentGame = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeAudio();
        this.updateStatisticsDisplay();
    }

    setupEventListeners() {
        // Mode switching
        document.getElementById('estimation-mode').addEventListener('click', () => this.switchMode('estimation'));
        document.getElementById('production-mode').addEventListener('click', () => this.switchMode('production'));

        // Estimation mode
        document.getElementById('start-estimation').addEventListener('click', () => this.startEstimationGame());
        document.getElementById('submit-guess').addEventListener('click', () => this.submitGuess());
        document.getElementById('next-estimation').addEventListener('click', () => this.nextEstimationRound());

        // Production mode  
        document.getElementById('start-production').addEventListener('click', () => this.startProductionGame());
        document.getElementById('tap-button').addEventListener('click', () => this.handleTap());
        document.getElementById('next-production').addEventListener('click', () => this.nextProductionRound());

        // Statistics
        document.getElementById('reset-stats').addEventListener('click', () => this.resetStatistics());

        // Enter key support for guess input
        document.getElementById('guess-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitGuess();
        });
    }

    async initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Audio context not available:', error);
        }
    }

    playBeep(frequency = 800, duration = 200) {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
    }

    switchMode(mode) {
        this.currentMode = mode;
        
        // Update mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${mode}-mode`).classList.add('active');
        
        // Update game displays
        document.querySelectorAll('.game-mode').forEach(gameMode => gameMode.classList.remove('active'));
        document.getElementById(`${mode}-game`).classList.add('active');
        
        // Reset current game
        this.currentGame = null;
        this.resetGameUI();
    }

    resetGameUI() {
        // Estimation mode reset
        document.getElementById('estimation-status').textContent = 'Click "Start" to begin';
        document.getElementById('start-estimation').style.display = 'inline-block';
        document.getElementById('estimation-input').style.display = 'none';
        document.getElementById('estimation-result').style.display = 'none';
        document.getElementById('guess-input').value = '';

        // Production mode reset
        document.getElementById('production-status').textContent = 'Click "Start" to begin';
        document.getElementById('start-production').style.display = 'inline-block';
        document.getElementById('target-time').style.display = 'none';
        document.getElementById('tap-button').style.display = 'none';
        document.getElementById('production-result').style.display = 'none';
    }

    // ESTIMATION MODE METHODS
    startEstimationGame() {
        const targetTime = this.generateRandomTime(1, 15);
        
        this.currentGame = {
            mode: 'estimation',
            targetTime: targetTime,
            startTime: null
        };

        document.getElementById('start-estimation').style.display = 'none';
        document.getElementById('estimation-status').textContent = 'Listen carefully... First beep coming!';

        // First beep after 1 second
        setTimeout(() => {
            this.playBeep();
            document.getElementById('estimation-status').textContent = 'Timing interval...';
            this.currentGame.startTime = Date.now();

            // Second beep after target time
            setTimeout(() => {
                this.playBeep();
                document.getElementById('estimation-status').textContent = 'How many seconds passed between the beeps?';
                document.getElementById('estimation-input').style.display = 'block';
                document.getElementById('guess-input').focus();
            }, targetTime * 1000);
        }, 1000);
    }

    submitGuess() {
        const guess = parseFloat(document.getElementById('guess-input').value);
        
        if (!guess || guess <= 0) {
            alert('Please enter a valid positive number');
            return;
        }

        const actualTime = this.currentGame.targetTime;
        const error = Math.abs(guess - actualTime);
        const accuracy = Math.max(0, 100 - (error / actualTime) * 100);

        this.updateEstimationStatistics(error, accuracy);
        this.displayEstimationResult(guess, actualTime, error, accuracy);
    }

    displayEstimationResult(guess, actual, error, accuracy) {
        const resultDiv = document.getElementById('estimation-result');
        const resultContent = resultDiv.querySelector('.result-content');
        
        let resultClass = 'poor';
        let message = '';
        
        if (error <= 0.5) {
            resultClass = 'success';
            message = '🎯 Excellent!';
        } else if (error <= 1.5) {
            resultClass = 'good'; 
            message = '👍 Good!';
        } else {
            message = '📈 Keep practicing!';
        }

        resultContent.innerHTML = `
            <div class="result-summary">
                <strong>${message}</strong>
            </div>
            <div class="result-details">
                <p>Your guess: <strong>${guess.toFixed(1)}s</strong></p>
                <p>Actual time: <strong>${actual.toFixed(1)}s</strong></p>
                <p>Error: <strong>${error.toFixed(1)}s</strong></p>
                <p>Accuracy: <strong>${accuracy.toFixed(1)}%</strong></p>
            </div>
        `;

        resultDiv.className = `result ${resultClass}`;
        resultDiv.style.display = 'block';
        document.getElementById('estimation-input').style.display = 'none';
    }

    nextEstimationRound() {
        document.getElementById('estimation-result').style.display = 'none';
        document.getElementById('start-estimation').style.display = 'inline-block';
        document.getElementById('estimation-status').textContent = 'Ready for next round!';
        document.getElementById('guess-input').value = '';
    }

    // PRODUCTION MODE METHODS
    startProductionGame() {
        const targetTime = this.generateRandomTime(3, 20);
        
        this.currentGame = {
            mode: 'production',
            targetTime: targetTime,
            startTime: Date.now()
        };

        document.getElementById('start-production').style.display = 'none';
        document.getElementById('target-seconds').textContent = targetTime;
        document.getElementById('target-time').style.display = 'block';
        document.getElementById('production-status').textContent = 'Timer started! Tap when you think the time has passed.';
        document.getElementById('tap-button').style.display = 'block';
    }

    handleTap() {
        const actualElapsed = (Date.now() - this.currentGame.startTime) / 1000;
        const targetTime = this.currentGame.targetTime;
        const error = Math.abs(actualElapsed - targetTime);
        const accuracy = Math.max(0, 100 - (error / targetTime) * 100);

        this.updateProductionStatistics(error, accuracy);
        this.displayProductionResult(actualElapsed, targetTime, error, accuracy);
    }

    displayProductionResult(elapsed, target, error, accuracy) {
        const resultDiv = document.getElementById('production-result');
        const resultContent = resultDiv.querySelector('.result-content');
        
        let resultClass = 'poor';
        let message = '';
        
        if (error <= 0.5) {
            resultClass = 'success';
            message = '🎯 Perfect timing!';
        } else if (error <= 1.5) {
            resultClass = 'good';
            message = '👍 Well done!';
        } else {
            message = '📈 Keep practicing!';
        }

        resultContent.innerHTML = `
            <div class="result-summary">
                <strong>${message}</strong>
            </div>
            <div class="result-details">
                <p>Target time: <strong>${target.toFixed(1)}s</strong></p>
                <p>Your timing: <strong>${elapsed.toFixed(1)}s</strong></p>
                <p>Error: <strong>${error.toFixed(1)}s</strong></p>
                <p>Accuracy: <strong>${accuracy.toFixed(1)}%</strong></p>
            </div>
        `;

        resultDiv.className = `result ${resultClass}`;
        resultDiv.style.display = 'block';
        document.getElementById('tap-button').style.display = 'none';
        document.getElementById('target-time').style.display = 'none';
    }

    nextProductionRound() {
        document.getElementById('production-result').style.display = 'none';
        document.getElementById('start-production').style.display = 'inline-block';
        document.getElementById('production-status').textContent = 'Ready for next round!';
    }

    // UTILITY METHODS
    generateRandomTime(min, max) {
        return Math.round((Math.random() * (max - min) + min) * 10) / 10;
    }

    // STATISTICS METHODS
    updateEstimationStatistics(error, accuracy) {
        this.statistics.estimation.games++;
        this.statistics.estimation.totalError += error;
        this.statistics.estimation.avgError = this.statistics.estimation.totalError / this.statistics.estimation.games;
        
        if (!this.statistics.estimation.bestScore || error < this.statistics.estimation.bestScore) {
            this.statistics.estimation.bestScore = error;
        }

        this.saveStatistics();
        this.updateStatisticsDisplay();
    }

    updateProductionStatistics(error, accuracy) {
        this.statistics.production.games++;
        this.statistics.production.totalError += error;
        this.statistics.production.avgError = this.statistics.production.totalError / this.statistics.production.games;
        
        if (!this.statistics.production.bestScore || error < this.statistics.production.bestScore) {
            this.statistics.production.bestScore = error;
        }

        this.saveStatistics();
        this.updateStatisticsDisplay();
    }

    updateStatisticsDisplay() {
        // Estimation stats
        document.getElementById('estimation-games').textContent = this.statistics.estimation.games;
        document.getElementById('estimation-error').textContent = 
            this.statistics.estimation.games > 0 ? `${this.statistics.estimation.avgError.toFixed(1)}s` : '0.0s';
        document.getElementById('estimation-best').textContent = 
            this.statistics.estimation.bestScore ? `${this.statistics.estimation.bestScore.toFixed(1)}s` : '-';

        // Production stats  
        document.getElementById('production-games').textContent = this.statistics.production.games;
        document.getElementById('production-error').textContent = 
            this.statistics.production.games > 0 ? `${this.statistics.production.avgError.toFixed(1)}s` : '0.0s';
        document.getElementById('production-best').textContent = 
            this.statistics.production.bestScore ? `${this.statistics.production.bestScore.toFixed(1)}s` : '-';
    }

    loadStatistics() {
        const defaultStats = {
            estimation: {
                games: 0,
                totalError: 0,
                avgError: 0,
                bestScore: null
            },
            production: {
                games: 0,
                totalError: 0,
                avgError: 0,
                bestScore: null
            }
        };

        try {
            const saved = localStorage.getItem('timetrainer-stats');
            return saved ? JSON.parse(saved) : defaultStats;
        } catch (error) {
            console.warn('Failed to load statistics:', error);
            return defaultStats;
        }
    }

    saveStatistics() {
        try {
            localStorage.setItem('timetrainer-stats', JSON.stringify(this.statistics));
        } catch (error) {
            console.warn('Failed to save statistics:', error);
        }
    }

    resetStatistics() {
        if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
            this.statistics = {
                estimation: { games: 0, totalError: 0, avgError: 0, bestScore: null },
                production: { games: 0, totalError: 0, avgError: 0, bestScore: null }
            };
            this.saveStatistics();
            this.updateStatisticsDisplay();
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TimeTrainer();
});

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
