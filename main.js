class CircusFunGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameWidth = 0;
        this.gameHeight = 0;
        this.gameRunning = false;
        this.isMobile = this.detectMobile();
        
        // Game state
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameSpeed = 1;
        
        // Player
        this.player = {
            x: 0,
            y: 0,
            width: 60,
            height: 80,
            speed: 5
        };
        
        // Falling objects
        this.fallingObjects = [];
        this.objectSpawnTimer = 0;
        this.objectSpawnRate = 120; // frames
        
        // Input handling
        this.keys = {};
        this.joystickActive = false;
        this.joystickDirection = 0;
        
        this.init();
    }
    
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    init() {
        // Update gameplay text for mobile
        if (this.isMobile) {
            document.getElementById('gameplayText').innerHTML = 
                'Use the virtual joystick to move the performer along the tightrope. ' +
                'Catch falling circus items like balls, rings, and stars to earn points. ' +
                'Avoid bombs and other dangerous objects - they will end your performance!';
        }
        
        // Event listeners
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('playAgainButton').addEventListener('click', () => this.restartGame());
        
        // Keyboard events (for desktop)
        if (!this.isMobile) {
            document.addEventListener('keydown', (e) => this.handleKeyDown(e));
            document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        }
    }
    
    startGame() {
        document.getElementById('firstScreen').style.display = 'none';
        document.getElementById('secondScreen').style.display = 'block';
        
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Show mobile controls if needed
        if (this.isMobile) {
            document.getElementById('mobileControls').style.display = 'block';
            this.initMobileControls();
        }
        
        this.resetGame();
        this.gameRunning = true;
        this.gameLoop();
    }
    
    resizeCanvas() {
        this.gameWidth = window.innerWidth;
        this.gameHeight = window.innerHeight;
        this.canvas.width = this.gameWidth;
        this.canvas.height = this.gameHeight;
        
        // Update player position
        this.player.x = this.gameWidth / 2 - this.player.width / 2;
        this.player.y = this.gameHeight - 200;
    }
    
    initMobileControls() {
        const joystickBase = document.getElementById('joystickBase');
        const joystickKnob = document.getElementById('joystickKnob');
        
        let isDragging = false;
        let startX = 0;
        
        const handleStart = (e) => {
            isDragging = true;
            this.joystickActive = true;
            const rect = joystickBase.getBoundingClientRect();
            startX = rect.left + rect.width / 2;
        };
        
        const handleMove = (e) => {
            if (!isDragging) return;
            
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const rect = joystickBase.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const deltaX = clientX - centerX;
            const maxDistance = 30;
            
            const distance = Math.min(Math.abs(deltaX), maxDistance);
            const direction = deltaX > 0 ? 1 : -1;
            
            joystickKnob.style.transform = `translate(${direction * distance - 20}px, -20px)`;
            this.joystickDirection = direction * (distance / maxDistance);
        };
        
        const handleEnd = () => {
            isDragging = false;
            this.joystickActive = false;
            this.joystickDirection = 0;
            joystickKnob.style.transform = 'translate(-50%, -50%)';
        };
        
        joystickBase.addEventListener('mousedown', handleStart);
        joystickBase.addEventListener('touchstart', handleStart);
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('touchmove', handleMove);
        document.addEventListener('mouseup', handleEnd);
        document.addEventListener('touchend', handleEnd);
    }
    
    handleKeyDown(e) {
        this.keys[e.key] = true;
    }
    
    handleKeyUp(e) {
        this.keys[e.key] = false;
    }
    
    resetGame() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameSpeed = 1;
        this.fallingObjects = [];
        this.objectSpawnTimer = 0;
        this.updateUI();
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
    }
    
    spawnFallingObject() {
        const objectTypes = [
            { type: 'ball', color: '#ff6b6b', points: 10, danger: false },
            { type: 'ring', color: '#4ecdc4', points: 15, danger: false },
            { type: 'star', color: '#ffe66d', points: 20, danger: false },
            { type: 'juggling_pin', color: '#9b59b6', points: 25, danger: false },
            { type: 'balloon', color: '#e74c3c', points: 15, danger: false },
            { type: 'confetti', color: '#f39c12', points: 12, danger: false },
            { type: 'bomb', color: '#2c2c2c', points: 0, danger: true },
            { type: 'cannon_ball', color: '#34495e', points: 0, danger: true }
        ];
        
        const randomType = objectTypes[Math.floor(Math.random() * objectTypes.length)];
        
        const object = {
            x: Math.random() * (this.gameWidth - 40) + 20,
            y: -40,
            width: 30,
            height: 30,
            speed: 2 + this.gameSpeed,
            rotation: 0,
            ...randomType
        };
        
        this.fallingObjects.push(object);
    }
    
    updatePlayer() {
        let moveDirection = 0;
        
        if (this.isMobile && this.joystickActive) {
            moveDirection = this.joystickDirection;
        } else {
            if (this.keys['ArrowLeft']) moveDirection = -1;
            if (this.keys['ArrowRight']) moveDirection = 1;
        }
        
        this.player.x += moveDirection * this.player.speed;
        
        // Keep player within bounds
        if (this.player.x < 0) this.player.x = 0;
        if (this.player.x > this.gameWidth - this.player.width) {
            this.player.x = this.gameWidth - this.player.width;
        }
    }
    
    updateFallingObjects() {
        this.fallingObjects.forEach((obj, index) => {
            obj.y += obj.speed;
            obj.rotation += 0.1;
            
            // Check collision with player
            if (this.checkCollision(this.player, obj)) {
                if (obj.danger) {
                    this.lives--;
                    if (this.lives <= 0) {
                        this.gameOver();
                        return;
                    }
                } else {
                    this.score += obj.points;
                    // Level up every 100 points
                    this.level = Math.floor(this.score / 100) + 1;
                    this.gameSpeed = 1 + (this.level - 1) * 0.5;
                }
                this.fallingObjects.splice(index, 1);
                this.updateUI();
            }
            
            // Remove objects that fell off screen
            if (obj.y > this.gameHeight) {
                this.fallingObjects.splice(index, 1);
            }
        });
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    drawCircusPerformer() {
        this.ctx.save();
        this.ctx.translate(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
        
        // Shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.ellipse(0, 35, 25, 8, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Legs
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 6;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(-8, 15);
        this.ctx.lineTo(-6, 30);
        this.ctx.moveTo(8, 15);
        this.ctx.lineTo(6, 30);
        this.ctx.stroke();
        
        // Shoes
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(-12, 28, 12, 6);
        this.ctx.fillRect(0, 28, 12, 6);
        
        // Body (costume)
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 18, 25, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Belt
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(-18, 8, 36, 4);
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(-3, 6, 6, 8);
        
        // Arms
        this.ctx.strokeStyle = '#FFDBAC';
        this.ctx.lineWidth = 5;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(-18, -5);
        this.ctx.lineTo(-28, 5);
        this.ctx.moveTo(18, -5);
        this.ctx.lineTo(28, 5);
        this.ctx.stroke();
        
        // Hands
        this.ctx.fillStyle = '#FFDBAC';
        this.ctx.beginPath();
        this.ctx.arc(-28, 5, 4, 0, Math.PI * 2);
        this.ctx.arc(28, 5, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Head
        this.ctx.fillStyle = '#FFDBAC';
        this.ctx.beginPath();
        this.ctx.arc(0, -30, 12, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Hair
        this.ctx.fillStyle = '#8B4513';
        this.ctx.beginPath();
        this.ctx.arc(0, -35, 14, 0, Math.PI);
        this.ctx.fill();
        
        // Hat
        this.ctx.fillStyle = '#4ECDC4';
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.ellipse(0, -42, 16, 6, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Hat feather
        this.ctx.strokeStyle = '#E74C3C';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(12, -42);
        this.ctx.lineTo(18, -50);
        this.ctx.stroke();
        
        // Face
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(-4, -32, 1.5, 0, Math.PI * 2);
        this.ctx.arc(4, -32, 1.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#E74C3C';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(0, -28, 2, 0, Math.PI);
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawFallingObject(obj) {
        this.ctx.save();
        this.ctx.translate(obj.x + obj.width / 2, obj.y + obj.height / 2);
        this.ctx.rotate(obj.rotation);
        
        switch (obj.type) {
            case 'ball':
                // Circus ball with pattern
                this.ctx.fillStyle = obj.color;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, obj.width / 2, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.strokeStyle = '#FFF';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, obj.width / 3, 0, Math.PI * 2);
                this.ctx.stroke();
                break;
                
            case 'ring':
                // Circus ring with decorations
                this.ctx.strokeStyle = obj.color;
                this.ctx.lineWidth = 4;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, obj.width / 2, 0, Math.PI * 2);
                this.ctx.stroke();
                
                // Inner decorations
                this.ctx.strokeStyle = '#FFD700';
                this.ctx.lineWidth = 1;
                for (let i = 0; i < 8; i++) {
                    const angle = (i * Math.PI) / 4;
                    this.ctx.beginPath();
                    this.ctx.moveTo(Math.cos(angle) * 8, Math.sin(angle) * 8);
                    this.ctx.lineTo(Math.cos(angle) * 12, Math.sin(angle) * 12);
                    this.ctx.stroke();
                }
                break;
                
            case 'star':
                // Circus star
                this.ctx.fillStyle = obj.color;
                this.ctx.strokeStyle = '#FF6B6B';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
                    const x = Math.cos(angle) * (obj.width / 2);
                    const y = Math.sin(angle) * (obj.width / 2);
                    if (i === 0) this.ctx.moveTo(x, y);
                    else this.ctx.lineTo(x, y);
                    
                    const innerAngle = ((i + 0.5) * Math.PI * 2) / 5 - Math.PI / 2;
                    const innerX = Math.cos(innerAngle) * (obj.width / 4);
                    const innerY = Math.sin(innerAngle) * (obj.width / 4);
                    this.ctx.lineTo(innerX, innerY);
                }
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
                break;
                
            case 'juggling_pin':
                // Juggling pin
                this.ctx.fillStyle = obj.color;
                this.ctx.strokeStyle = '#2C3E50';
                this.ctx.lineWidth = 1;
                
                // Handle
                this.ctx.fillRect(-2, -15, 4, 20);
                this.ctx.strokeRect(-2, -15, 4, 20);
                
                // Top bulb
                this.ctx.beginPath();
                this.ctx.arc(0, -15, 6, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();
                
                // Bottom bulb
                this.ctx.beginPath();
                this.ctx.arc(0, 8, 4, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();
                break;
                
            case 'balloon':
                // Balloon
                this.ctx.fillStyle = obj.color;
                this.ctx.strokeStyle = '#C0392B';
                this.ctx.lineWidth = 1;
                
                // Balloon body
                this.ctx.beginPath();
                this.ctx.ellipse(0, -5, 8, 12, 0, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();
                
                // Balloon knot
                this.ctx.fillStyle = '#8B4513';
                this.ctx.fillRect(-1, 7, 2, 3);
                
                // String
                this.ctx.strokeStyle = '#8B4513';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(0, 10);
                this.ctx.lineTo(0, 15);
                this.ctx.stroke();
                break;
                
            case 'confetti':
                // Confetti pieces
                const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#9B59B6'];
                for (let i = 0; i < 6; i++) {
                    this.ctx.fillStyle = colors[i % colors.length];
                    const x = (Math.random() - 0.5) * 20;
                    const y = (Math.random() - 0.5) * 20;
                    this.ctx.fillRect(x, y, 3, 3);
                }
                break;
                
            case 'bomb':
                // Cartoon bomb
                this.ctx.fillStyle = obj.color;
                this.ctx.strokeStyle = '#000';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, obj.width / 2, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();
                
                // Fuse
                this.ctx.strokeStyle = '#D35400';
                this.ctx.lineWidth = 3;
                this.ctx.lineCap = 'round';
                this.ctx.beginPath();
                this.ctx.moveTo(0, -obj.width / 2);
                this.ctx.lineTo(5, -obj.width / 2 - 8);
                this.ctx.stroke();
                
                // Spark
                this.ctx.fillStyle = '#E74C3C';
                this.ctx.beginPath();
                this.ctx.arc(5, -obj.width / 2 - 8, 2, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Skull symbol
                this.ctx.fillStyle = '#FFF';
                this.ctx.beginPath();
                this.ctx.arc(-2, -2, 3, 0, Math.PI * 2);
                this.ctx.arc(2, -2, 3, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.fillRect(-1, 3, 2, 4);
                break;
                
            case 'cannon_ball':
                // Heavy cannon ball
                this.ctx.fillStyle = obj.color;
                this.ctx.strokeStyle = '#2C3E50';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, obj.width / 2, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();
                
                // Metallic shine effect
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                this.ctx.beginPath();
                this.ctx.arc(-4, -4, 4, 0, Math.PI * 2);
                this.ctx.fill();
                break;
        }
        
        this.ctx.restore();
    }
    
    drawBackground() {
        // Draw circus tent background with more detail
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.gameHeight);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f1419');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
        
        // Circus tent stripes
        this.ctx.strokeStyle = 'rgba(255, 107, 107, 0.15)';
        this.ctx.lineWidth = 30;
        for (let i = -100; i < this.gameWidth + 100; i += 80) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i + 100, this.gameHeight);
            this.ctx.stroke();
        }
        
        // Alternate stripes
        this.ctx.strokeStyle = 'rgba(78, 205, 196, 0.1)';
        for (let i = -60; i < this.gameWidth + 100; i += 80) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i + 100, this.gameHeight);
            this.ctx.stroke();
        }
        
        // Spotlights
        const spotlights = [
            { x: this.gameWidth * 0.2, y: 50 },
            { x: this.gameWidth * 0.8, y: 50 }
        ];
        
        spotlights.forEach(light => {
            const lightGradient = this.ctx.createRadialGradient(
                light.x, light.y, 0,
                light.x, light.y, 200
            );
            lightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
            lightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            this.ctx.fillStyle = lightGradient;
            this.ctx.fillRect(light.x - 200, light.y, 400, this.gameHeight);
        });
        
        // Draw tightrope with support posts
        const ropeY = this.player.y + this.player.height + 10;
        
        // Support posts
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, ropeY - 20, 15, this.gameHeight - ropeY + 20);
        this.ctx.fillRect(this.gameWidth - 15, ropeY - 20, 15, this.gameHeight - ropeY + 20);
        
        // Tightrope
        this.ctx.strokeStyle = '#DEB887';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(0, ropeY);
        this.ctx.lineTo(this.gameWidth, ropeY);
        this.ctx.stroke();
        
        // Rope texture
        this.ctx.strokeStyle = '#CD853F';
        this.ctx.lineWidth = 1;
        for (let x = 0; x < this.gameWidth; x += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, ropeY - 2);
            this.ctx.lineTo(x + 10, ropeY + 2);
            this.ctx.stroke();
        }
        
        // Circus decorations (hanging banners)
        for (let i = 0; i < 3; i++) {
            const x = (this.gameWidth / 4) * (i + 1);
            this.ctx.fillStyle = i % 2 === 0 ? '#FF6B6B' : '#4ECDC4';
            this.ctx.fillRect(x - 20, 0, 40, 80);
            
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('🎪', x, 45);
        }
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
        
        // Draw background
        this.drawBackground();
        
        // Update game objects
        this.updatePlayer();
        this.updateFallingObjects();
        
        // Spawn new objects
        this.objectSpawnTimer++;
        if (this.objectSpawnTimer >= this.objectSpawnRate / this.gameSpeed) {
            this.spawnFallingObject();
            this.objectSpawnTimer = 0;
        }
        
        // Draw game objects
        this.drawCircusPerformer();
        this.fallingObjects.forEach(obj => this.drawFallingObject(obj));
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    gameOver() {
        this.gameRunning = false;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverPopup').style.display = 'flex';
    }
    
    restartGame() {
        document.getElementById('gameOverPopup').style.display = 'none';
        this.resetGame();
        this.gameRunning = true;
        this.gameLoop();
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new CircusFunGame();
});
