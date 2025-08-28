// Advanced Mode Time Trainer - JavaScript File

class AdvancedTimeTrainer {
    constructor() {
        this.games = {};
        this.statistics = this.loadStatistics();
        this.gameButtons = ['game-1', 'game-2', 'game-3', 'game-4'];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeGames();
        this.updateStatisticsDisplay();
    }

    setupEventListeners() {
        this.gameButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            button.addEventListener('click', () => this.handleGameClick(buttonId));
        });
    }

    initializeGames() {
        this.gameButtons.forEach(buttonId => {
            this.games[buttonId] = {
                state: 'inactive',
                targetTime: null,
                startTime: null,
                timeout: null,
                buttonElement: document.getElementById(buttonId)
            };
            
            // Start each game with a random delay
            this.scheduleNextGame(buttonId);
        });
    }

    scheduleNextGame(gameId) {
        const game = this.games[gameId];
        
        // Clear any existing timeout
        if (game.timeout) {
            clearTimeout(game.timeout);
        }
        
        // Set to inactive state with spinner
        this.setState(gameId, 'inactive', '<div class="spinner"></div>');
        
        // Random delay between 2-6 seconds before showing number
        const delay = Math.random() * 4000 + 2000;
        
        game.timeout = setTimeout(() => {
            this.startGame(gameId);
        }, delay);
    }

    startGame(gameId) {
        const game = this.games[gameId];
        
        // Generate random target time between 1-10 seconds
        const targetTime = Math.round((Math.random() * 9 + 1) * 10) / 10;
        game.targetTime = targetTime;
        
        // Show the number for 1 second
        this.setState(gameId, 'showing-number', `${targetTime}s`);
        
        game.timeout = setTimeout(() => {
            // Switch to waiting state (user can click) with spinner
            this.setState(gameId, 'waiting', '<div class="spinner"></div>');
            game.startTime = Date.now();
        }, 1000);
    }

    handleGameClick(gameId) {
        const game = this.games[gameId];
        
        // Only handle clicks in waiting state
        if (game.state !== 'waiting') {
            return;
        }
        
        // Calculate elapsed time and error
        const elapsedTime = (Date.now() - game.startTime) / 1000;
        const targetTime = game.targetTime;
        const error = Math.abs(elapsedTime - targetTime);
        
        // Update statistics
        this.updateStatistics(error);
        
        // Show result
        this.showResult(gameId, elapsedTime, targetTime, error);
        
        // Schedule next game after showing result
        game.timeout = setTimeout(() => {
            this.scheduleNextGame(gameId);
        }, 2000);
    }

    showResult(gameId, elapsed, target, error) {
        const game = this.games[gameId];
        let resultClass = 'poor';
        let message = '';
        
        if (error <= 0.5) {
            resultClass = 'success';
            message = `🎯 Perfect!\n${elapsed.toFixed(1)}s / ${target.toFixed(1)}s\nError: ${error.toFixed(1)}s`;
        } else if (error <= 1.5) {
            resultClass = 'good';
            message = `👍 Good!\n${elapsed.toFixed(1)}s / ${target.toFixed(1)}s\nError: ${error.toFixed(1)}s`;
        } else {
            message = `📈 Keep trying!\n${elapsed.toFixed(1)}s / ${target.toFixed(1)}s\nError: ${error.toFixed(1)}s`;
        }
        
        this.setState(gameId, 'showing-result', message, resultClass);
    }

    setState(gameId, state, text, subClass = '') {
        const game = this.games[gameId];
        const button = game.buttonElement;
        const buttonText = button.querySelector('.button-text');
        
        // Remove all state classes
        button.classList.remove('inactive', 'showing-number', 'waiting', 'showing-result', 'success', 'good', 'poor');
        
        // Add new state class
        button.classList.add(state);
        if (subClass) {
            button.classList.add(subClass);
        }
        
        // Update text (preserve line breaks)
        buttonText.innerHTML = text.replace(/\n/g, '<br>');
        
        // Update game state
        game.state = state;
    }

    updateStatistics(error) {
        this.statistics.totalGuesses++;
        this.statistics.totalError += error;
        this.statistics.averageError = this.statistics.totalError / this.statistics.totalGuesses;
        
        this.saveStatistics();
        this.updateStatisticsDisplay();
    }

    updateStatisticsDisplay() {
        document.getElementById('total-guesses').textContent = this.statistics.totalGuesses;
        document.getElementById('average-error').textContent = 
            this.statistics.totalGuesses > 0 ? `${this.statistics.averageError.toFixed(1)}s` : '0.0s';
    }

    loadStatistics() {
        const defaultStats = {
            totalGuesses: 0,
            totalError: 0,
            averageError: 0
        };

        try {
            const saved = localStorage.getItem('timetrainer-advanced-stats');
            if (!saved) return defaultStats;

            return JSON.parse(saved);
        } catch (error) {
            console.warn('Failed to load advanced mode statistics:', error);
            return defaultStats;
        }
    }

    saveStatistics() {
        try {
            localStorage.setItem('timetrainer-advanced-stats', JSON.stringify(this.statistics));
        } catch (error) {
            console.warn('Failed to save advanced mode statistics:', error);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdvancedTimeTrainer();
});
