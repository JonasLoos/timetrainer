// Time Trainer PWA - Main JavaScript File

class TimeTrainer {
    constructor() {
        this.currentMode = 'estimation';
        this.audioContext = null;
        this.statistics = this.loadStatistics();
        this.currentGame = null;
        this.currentChartMode = 'estimation';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeAudio();
        this.updateStatisticsDisplay();
        this.updateVisualization();
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

        // Visualization
        document.getElementById('chart-estimation').addEventListener('click', () => this.switchChartMode('estimation'));
        document.getElementById('chart-production').addEventListener('click', () => this.switchChartMode('production'));

        // Slider value update
        document.getElementById('guess-slider').addEventListener('input', (e) => {
            document.getElementById('guess-value').textContent = parseFloat(e.target.value).toFixed(1);
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
        document.getElementById('guess-slider').value = '5.0';
        document.getElementById('guess-value').textContent = '5.0';

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
                document.getElementById('guess-slider').focus();
            }, targetTime * 1000);
        }, 1000);
    }

    submitGuess() {
        const guess = parseFloat(document.getElementById('guess-slider').value);

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
        document.getElementById('guess-slider').value = '5.0';
        document.getElementById('guess-value').textContent = '5.0';
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
        const actualTime = this.currentGame.targetTime;
        const guess = parseFloat(document.getElementById('guess-slider').value);
        
        // Store individual game result for visualization
        this.statistics.estimation.gameResults.push({
            actualTime: actualTime,
            perceivedTime: guess,
            error: error,
            accuracy: accuracy,
            timestamp: Date.now()
        });
        
        // Keep only last 50 games for performance
        if (this.statistics.estimation.gameResults.length > 50) {
            this.statistics.estimation.gameResults = this.statistics.estimation.gameResults.slice(-50);
        }
        
        this.statistics.estimation.games++;
        this.statistics.estimation.totalError += error;
        this.statistics.estimation.avgError = this.statistics.estimation.totalError / this.statistics.estimation.games;
        
        if (!this.statistics.estimation.bestScore || error < this.statistics.estimation.bestScore) {
            this.statistics.estimation.bestScore = error;
        }

        this.saveStatistics();
        this.updateStatisticsDisplay();
        this.updateVisualization();
    }

    updateProductionStatistics(error, accuracy) {
        const actualTime = this.currentGame.targetTime;
        const elapsed = (Date.now() - this.currentGame.startTime) / 1000;
        
        // Store individual game result for visualization
        this.statistics.production.gameResults.push({
            actualTime: actualTime,
            perceivedTime: elapsed,
            error: error,
            accuracy: accuracy,
            timestamp: Date.now()
        });
        
        // Keep only last 50 games for performance
        if (this.statistics.production.gameResults.length > 50) {
            this.statistics.production.gameResults = this.statistics.production.gameResults.slice(-50);
        }
        
        this.statistics.production.games++;
        this.statistics.production.totalError += error;
        this.statistics.production.avgError = this.statistics.production.totalError / this.statistics.production.games;
        
        if (!this.statistics.production.bestScore || error < this.statistics.production.bestScore) {
            this.statistics.production.bestScore = error;
        }

        this.saveStatistics();
        this.updateStatisticsDisplay();
        this.updateVisualization();
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
                bestScore: null,
                gameResults: [] // Store individual game results for visualization
            },
            production: {
                games: 0,
                totalError: 0,
                avgError: 0,
                bestScore: null,
                gameResults: [] // Store individual game results for visualization
            }
        };

        try {
            const saved = localStorage.getItem('timetrainer-stats');
            if (!saved) return defaultStats;
            
            const loadedStats = JSON.parse(saved);
            
            // Migration: Ensure gameResults arrays exist for backward compatibility
            if (!loadedStats.estimation.gameResults) {
                loadedStats.estimation.gameResults = [];
            }
            if (!loadedStats.production.gameResults) {
                loadedStats.production.gameResults = [];
            }
            
            return loadedStats;
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
                estimation: { games: 0, totalError: 0, avgError: 0, bestScore: null, gameResults: [] },
                production: { games: 0, totalError: 0, avgError: 0, bestScore: null, gameResults: [] }
            };
            this.saveStatistics();
            this.updateStatisticsDisplay();
            this.updateVisualization();
        }
    }

    // VISUALIZATION METHODS
    switchChartMode(mode) {
        this.currentChartMode = mode;
        
        // Update chart mode buttons
        document.querySelectorAll('.chart-mode-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`chart-${mode}`).classList.add('active');
        
        this.updateVisualization();
    }

    updateVisualization() {
        const data = this.statistics[this.currentChartMode].gameResults;
        const container = document.getElementById('perception-chart');
        
        if (!data || data.length === 0) {
            container.innerHTML = `
                <div class="chart-placeholder">
                    <p>🎯 Play some ${this.currentChartMode} games to see your time perception patterns!</p>
                    <p>The chart will show how your perceived time compares to real time.</p>
                </div>
            `;
            return;
        }

        // Create SVG chart
        const svg = this.createScatterPlot(data);
        container.innerHTML = '';
        container.appendChild(svg);
    }

    createScatterPlot(data) {
        const width = 560;
        const height = 260;
        const margin = { top: 20, right: 20, bottom: 40, left: 50 };
        const plotWidth = width - margin.left - margin.right;
        const plotHeight = height - margin.top - margin.bottom;

        // Create SVG element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'chart-svg');
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

        // Find data bounds
        const actualTimes = data.map(d => d.actualTime);
        const perceivedTimes = data.map(d => d.perceivedTime);
        const minTime = Math.min(...actualTimes, ...perceivedTimes);
        const maxTime = Math.max(...actualTimes, ...perceivedTimes);
        
        // Add some padding to the bounds
        const padding = (maxTime - minTime) * 0.1;
        const xMin = Math.max(0, minTime - padding);
        const xMax = maxTime + padding;
        const yMin = Math.max(0, minTime - padding);
        const yMax = maxTime + padding;

        // Create scales
        const xScale = (value) => margin.left + (value - xMin) / (xMax - xMin) * plotWidth;
        const yScale = (value) => height - margin.bottom - (value - yMin) / (yMax - yMin) * plotHeight;

        // Add grid lines
        this.addGridLines(svg, xMin, xMax, yMin, yMax, xScale, yScale, plotWidth, plotHeight, margin);

        // Add axes
        this.addAxes(svg, xMin, xMax, yMin, yMax, xScale, yScale, width, height, margin);

        // Add perfect diagonal line (where perceived = actual)
        const diagonalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        diagonalLine.setAttribute('class', 'chart-diagonal');
        diagonalLine.setAttribute('x1', xScale(xMin));
        diagonalLine.setAttribute('y1', yScale(xMin));
        diagonalLine.setAttribute('x2', xScale(xMax));
        diagonalLine.setAttribute('y2', yScale(xMax));
        svg.appendChild(diagonalLine);

        // Add data points
        data.forEach((point, index) => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            const x = xScale(point.actualTime);
            const y = yScale(point.perceivedTime);
            
            circle.setAttribute('class', 'chart-point');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', 4);
            circle.setAttribute('stroke', '#fff');
            circle.setAttribute('stroke-width', 1);
            
            // Color based on accuracy
            let color;
            if (point.error <= 0.5) {
                color = '#28a745'; // Perfect
            } else if (point.error <= 1.5) {
                color = '#ffc107'; // Good
            } else {
                color = '#dc3545'; // Poor
            }
            circle.setAttribute('fill', color);

            // Add tooltip on hover
            const tooltip = this.createTooltip(point, index + 1);
            this.addPointInteractivity(circle, tooltip);

            svg.appendChild(circle);
        });

        return svg;
    }

    addGridLines(svg, xMin, xMax, yMin, yMax, xScale, yScale, plotWidth, plotHeight, margin) {
        const steps = 5;
        const xStep = (xMax - xMin) / steps;
        const yStep = (yMax - yMin) / steps;

        // Vertical grid lines
        for (let i = 0; i <= steps; i++) {
            const x = xMin + i * xStep;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('class', 'chart-grid');
            line.setAttribute('x1', xScale(x));
            line.setAttribute('y1', margin.top);
            line.setAttribute('x2', xScale(x));
            line.setAttribute('y2', margin.top + plotHeight);
            svg.appendChild(line);
        }

        // Horizontal grid lines
        for (let i = 0; i <= steps; i++) {
            const y = yMin + i * yStep;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('class', 'chart-grid');
            line.setAttribute('x1', margin.left);
            line.setAttribute('y1', yScale(y));
            line.setAttribute('x2', margin.left + plotWidth);
            line.setAttribute('y2', yScale(y));
            svg.appendChild(line);
        }
    }

    addAxes(svg, xMin, xMax, yMin, yMax, xScale, yScale, width, height, margin) {
        // X-axis
        const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        xAxis.setAttribute('class', 'chart-axis');
        xAxis.setAttribute('x1', margin.left);
        xAxis.setAttribute('y1', height - margin.bottom);
        xAxis.setAttribute('x2', margin.left + (width - margin.left - margin.right));
        xAxis.setAttribute('y2', height - margin.bottom);
        svg.appendChild(xAxis);

        // Y-axis
        const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        yAxis.setAttribute('class', 'chart-axis');
        yAxis.setAttribute('x1', margin.left);
        yAxis.setAttribute('y1', margin.top);
        yAxis.setAttribute('x2', margin.left);
        yAxis.setAttribute('y2', height - margin.bottom);
        svg.appendChild(yAxis);

        // X-axis label
        const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        xLabel.setAttribute('class', 'chart-axis-label');
        xLabel.setAttribute('x', margin.left + (width - margin.left - margin.right) / 2);
        xLabel.setAttribute('y', height - 10);
        xLabel.textContent = 'Actual Time (seconds)';
        svg.appendChild(xLabel);

        // Y-axis label
        const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        yLabel.setAttribute('class', 'chart-axis-label');
        yLabel.setAttribute('x', 15);
        yLabel.setAttribute('y', margin.top + (height - margin.top - margin.bottom) / 2);
        yLabel.setAttribute('transform', `rotate(-90, 15, ${margin.top + (height - margin.top - margin.bottom) / 2})`);
        yLabel.textContent = 'Perceived Time (seconds)';
        svg.appendChild(yLabel);

        // Add tick labels
        const steps = 5;
        const xStep = (xMax - xMin) / steps;
        const yStep = (yMax - yMin) / steps;

        // X-axis ticks
        for (let i = 0; i <= steps; i++) {
            const value = xMin + i * xStep;
            const tick = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            tick.setAttribute('class', 'chart-axis-label');
            tick.setAttribute('x', xScale(value));
            tick.setAttribute('y', height - margin.bottom + 15);
            tick.setAttribute('text-anchor', 'middle');
            tick.textContent = value.toFixed(1);
            svg.appendChild(tick);
        }

        // Y-axis ticks
        for (let i = 0; i <= steps; i++) {
            const value = yMin + i * yStep;
            const tick = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            tick.setAttribute('class', 'chart-axis-label');
            tick.setAttribute('x', margin.left - 10);
            tick.setAttribute('y', yScale(value) + 4);
            tick.setAttribute('text-anchor', 'end');
            tick.textContent = value.toFixed(1);
            svg.appendChild(tick);
        }
    }

    createTooltip(point, gameNumber) {
        return `Game ${gameNumber}: ${point.actualTime.toFixed(1)}s → ${point.perceivedTime.toFixed(1)}s (±${point.error.toFixed(1)}s)`;
    }

    addPointInteractivity(circle, tooltipText) {
        let tooltip = null;

        circle.addEventListener('mouseenter', (e) => {
            tooltip = document.createElement('div');
            tooltip.className = 'chart-tooltip';
            tooltip.textContent = tooltipText;
            
            // Position tooltip with better offset
            const rect = e.target.getBoundingClientRect();
            tooltip.style.left = (rect.left + rect.width / 2) + 'px';
            tooltip.style.top = (rect.top - 10) + 'px';
            tooltip.style.position = 'fixed';
            
            document.body.appendChild(tooltip);
        });

        circle.addEventListener('mouseleave', () => {
            if (tooltip) {
                document.body.removeChild(tooltip);
                tooltip = null;
            }
        });

        circle.addEventListener('mousemove', (e) => {
            if (tooltip) {
                const rect = e.target.getBoundingClientRect();
                tooltip.style.left = (rect.left + rect.width / 2) + 'px';
                tooltip.style.top = (rect.top - 10) + 'px';
            }
        });
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
