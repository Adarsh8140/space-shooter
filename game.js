// Game variables
const game = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    isRunning: false,
    score: 0,
    level: 1,
    lives: 3,
    highScore: 0,
    lastTime: 0,
    aliens: [],
    bullets: [],
    powerUps: [],
    obstacles: [],
    player: null,
    keys: {},
    activePowerUps: {
        shield: false,
        doubleLaser: false,
        speedBoost: false
    },
    tips: [
        "Watch out! Bomb ahead!",
        "Collect power-ups for special abilities!",
        "Dodge the meteors!",
        "Boss alien approaching soon!",
        "Double lasers do double damage!"
    ],
    currentTip: 0,
    // Images
    images: {
        background: null,
        player: null,
        aliens: [],
        powerUps: {
            shield: null,
            doubleLaser: null,
            speedBoost: null
        },
        obstacles: {
            bomb: null,
            meteor: null
        },
        explosion: null
    },
    // Sounds
    sounds: {
        backgroundMusic: null,
        shoot: null,
        explosion: null,
        powerUp: null,
        playerHit: null,
        gameOver: null
    },
    // Animation frames
    spriteFrames: {
        explosion: []
    }
};

// Function to start the actual game (called from the HTML startGame function)
function gameStart() {
    console.log("Game start function called from game.js");
    
    // Reset game state
    game.isRunning = true;
    game.score = 0;
    game.level = 1;
    game.lives = 3;
    game.aliens = [];
    game.bullets = [];
    game.powerUps = [];
    game.obstacles = [];
    game.explosions = [];
    game.activePowerUps = {
        shield: false,
        doubleLaser: false,
        speedBoost: false
    };
    
    // Update UI
    document.getElementById('score').textContent = game.score;
    updateLives();
    updatePowerUps();
    
    // Create player
    game.player = {
        x: game.width / 2,
        y: game.height - 100,
        width: 60,
        height: 60,
        speed: 5,
        color: '#00ff00'
    };
    
    // Start background music
    if (game.sounds.backgroundMusic) {
        game.sounds.backgroundMusic.currentTime = 0;
        game.sounds.backgroundMusic.play().catch(error => {
            console.error("Error playing background music:", error);
        });
    }
    
    // Start game loop
    game.lastTime = performance.now();
    requestAnimationFrame(gameLoop);
    
    // Start spawning aliens
    spawnAliens();
    
    // Show random tip
    showRandomTip();
}

// Make gameStart function globally accessible
window.gameStart = gameStart;
        shoot: null,
        explosion: null,
        powerUp: null,
        playerHit: null,
        gameOver: null
    },
    // Animation frames
    spriteFrames: {
        explosion: []
    }
};

// Initialize the game
function init() {
    console.log("Game initializing...");
    // Set up screens
    const welcomeScreen = document.getElementById('welcome-screen');
    const gameScreen = document.getElementById('game-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    
    // Set up canvas
    game.canvas = document.getElementById('game-canvas');
    game.ctx = game.canvas.getContext('2d');
    
    // Load high score from local storage
    const savedHighScore = localStorage.getItem('alienShooterHighScore');
    if (savedHighScore) {
        game.highScore = parseInt(savedHighScore);
        document.querySelector('#high-score span').textContent = game.highScore;
    }
    
    // Load game assets
    loadAssets();
    
    // Resize handler
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Set up keyboard controls
    window.addEventListener('keydown', (e) => game.keys[e.code] = true);
    window.addEventListener('keyup', (e) => game.keys[e.code] = false);
    
    console.log("Game initialization complete");
}
    
    // Load high score from local storage
    const savedHighScore = localStorage.getItem('alienShooterHighScore');
    if (savedHighScore) {
        game.highScore = parseInt(savedHighScore);
        document.querySelector('#high-score span').textContent = game.highScore;
    }
    
    // Resize handler
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
}

// Resize canvas to fit the game area
function resizeCanvas() {
    const gameArea = document.getElementById('game-area');
    game.width = gameArea.clientWidth;
    game.height = gameArea.clientHeight;
    game.canvas.width = game.width;
    game.canvas.height = game.height;
}

// This function is now defined in the HTML file and calls gameStart()

// Game loop
function gameLoop(timestamp) {
    if (!game.isRunning) return;
    
    // Calculate delta time
    const deltaTime = timestamp - game.lastTime;
    game.lastTime = timestamp;
    
    // Clear canvas
    game.ctx.clearRect(0, 0, game.width, game.height);
    
    // Draw background
    drawBackground();
    
    // Update and draw game objects
    updatePlayer(deltaTime);
    updateBullets(deltaTime);
    updateAliens(deltaTime);
    updatePowerUps(deltaTime);
    updateObstacles(deltaTime);
    updateExplosions(deltaTime);
    
    // Check collisions
    checkCollisions();
    
    // Draw player
    drawPlayer();
    
    // Request next frame
    requestAnimationFrame(gameLoop);
}

// Draw background
function drawBackground() {
    if (game.images.background && game.images.background.complete) {
        // Draw tiled background
        const pattern = game.ctx.createPattern(game.images.background, 'repeat');
        game.ctx.fillStyle = pattern;
        game.ctx.fillRect(0, 0, game.width, game.height);
    } else {
        // Fallback if image not loaded
        game.ctx.fillStyle = '#000033';
        game.ctx.fillRect(0, 0, game.width, game.height);
        
        // Draw stars
        game.ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * game.width;
            const y = Math.random() * game.height;
            const size = Math.random() * 3;
            game.ctx.beginPath();
            game.ctx.arc(x, y, size, 0, Math.PI * 2);
            game.ctx.fill();
        }
    }
}

// Update player position based on input
function updatePlayer(deltaTime) {
    const speedMultiplier = game.activePowerUps.speedBoost ? 1.5 : 1;
    
    if (game.keys['ArrowLeft'] && game.player.x > 0) {
        game.player.x -= game.player.speed * speedMultiplier;
    }
    if (game.keys['ArrowRight'] && game.player.x < game.width - game.player.width) {
        game.player.x += game.player.speed * speedMultiplier;
    }
    
    // Shooting
    if (game.keys['Space']) {
        shoot();
    }
}

// Draw the player
function drawPlayer() {
    if (game.images.player && game.images.player.complete) {
        // Draw player image
        game.ctx.drawImage(
            game.images.player,
            game.player.x,
            game.player.y,
            game.player.width,
            game.player.height
        );
    } else {
        // Fallback if image not loaded
        game.ctx.fillStyle = game.player.color;
        
        // Draw spaceship body
        game.ctx.beginPath();
        game.ctx.moveTo(game.player.x + game.player.width / 2, game.player.y);
        game.ctx.lineTo(game.player.x, game.player.y + game.player.height);
        game.ctx.lineTo(game.player.x + game.player.width, game.player.y + game.player.height);
        game.ctx.closePath();
        game.ctx.fill();
    }
    
    // Draw shield if active
    if (game.activePowerUps.shield) {
        game.ctx.strokeStyle = '#00ffff';
        game.ctx.lineWidth = 3;
        game.ctx.beginPath();
        game.ctx.arc(
            game.player.x + game.player.width / 2,
            game.player.y + game.player.height / 2,
            game.player.width * 0.8,
            0, Math.PI * 2
        );
        game.ctx.stroke();
    }
}

// Shoot bullets
function shoot() {
    // Limit shooting rate
    const now = performance.now();
    if (!game.lastShot || now - game.lastShot > 300) {
        game.lastShot = now;
        
        // Play shoot sound
        playSound(game.sounds.shoot);
        
        if (game.activePowerUps.doubleLaser) {
            // Double laser power-up
            game.bullets.push({
                x: game.player.x + game.player.width * 0.3,
                y: game.player.y,
                width: 5,
                height: 15,
                speed: 10,
                color: '#ff00ff'
            });
            
            game.bullets.push({
                x: game.player.x + game.player.width * 0.7,
                y: game.player.y,
                width: 5,
                height: 15,
                speed: 10,
                color: '#ff00ff'
            });
        } else {
            // Single laser
            game.bullets.push({
                x: game.player.x + game.player.width / 2 - 2.5,
                y: game.player.y,
                width: 5,
                height: 15,
                speed: 10,
                color: '#ff0000'
            });
        }
    }
}

// Update bullets
function updateBullets(deltaTime) {
    for (let i = game.bullets.length - 1; i >= 0; i--) {
        const bullet = game.bullets[i];
        bullet.y -= bullet.speed;
        
        // Remove bullets that go off screen
        if (bullet.y + bullet.height < 0) {
            game.bullets.splice(i, 1);
            continue;
        }
        
        // Draw bullet
        game.ctx.fillStyle = bullet.color;
        game.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
}

// Spawn aliens
function spawnAliens() {
    if (!game.isRunning) return;
    
    const alienCount = 1 + Math.floor(game.level / 2);
    
    for (let i = 0; i < alienCount; i++) {
        const alienType = Math.floor(Math.random() * 3);
        const alien = {
            x: Math.random() * (game.width - 50),
            y: -50,
            width: 50,
            height: 50,
            speed: 1 + game.level * 0.2,
            health: alienType + 1,
            type: alienType,
            color: ['#00ff00', '#ffff00', '#ff00ff'][alienType]
        };
        
        game.aliens.push(alien);
    }
    
    // Spawn power-up occasionally
    if (Math.random() < 0.2) {
        spawnPowerUp();
    }
    
    // Spawn obstacle occasionally
    if (Math.random() < 0.3) {
        spawnObstacle();
    }
    
    // Schedule next spawn
    const spawnDelay = Math.max(2000 - game.level * 100, 500);
    setTimeout(spawnAliens, spawnDelay);
}

// Update aliens
function updateAliens(deltaTime) {
    for (let i = game.aliens.length - 1; i >= 0; i--) {
        const alien = game.aliens[i];
        alien.y += alien.speed;
        
        // Check if alien reached bottom
        if (alien.y > game.height) {
            game.aliens.splice(i, 1);
            loseLife();
            continue;
        }
        
        // Draw alien
        drawAlien(alien);
    }
}

// Draw alien
function drawAlien(alien) {
    if (game.images.aliens[alien.type] && game.images.aliens[alien.type].complete) {
        // Draw alien image
        game.ctx.drawImage(
            game.images.aliens[alien.type],
            alien.x,
            alien.y,
            alien.width,
            alien.height
        );
    } else {
        // Fallback if image not loaded
        game.ctx.fillStyle = alien.color;
        
        // Draw alien body
        game.ctx.beginPath();
        game.ctx.arc(
            alien.x + alien.width / 2,
            alien.y + alien.height / 2,
            alien.width / 2,
            0, Math.PI * 2
        );
        game.ctx.fill();
        
        // Draw alien eyes
        game.ctx.fillStyle = '#000000';
        game.ctx.beginPath();
        game.ctx.arc(
            alien.x + alien.width / 3,
            alien.y + alien.height / 3,
            alien.width / 10,
            0, Math.PI * 2
        );
        game.ctx.arc(
            alien.x + alien.width * 2/3,
            alien.y + alien.height / 3,
            alien.width / 10,
            0, Math.PI * 2
        );
        game.ctx.fill();
    }
}

// Spawn power-up
function spawnPowerUp() {
    const powerUpTypes = ['shield', 'doubleLaser', 'speedBoost'];
    const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    
    const powerUp = {
        x: Math.random() * (game.width - 30),
        y: -30,
        width: 30,
        height: 30,
        speed: 2,
        type: type,
        emoji: type === 'shield' ? '🛡️' : type === 'doubleLaser' ? '🚀' : '⚡'
    };
    
    game.powerUps.push(powerUp);
}

// Update power-ups
function updatePowerUps(deltaTime) {
    for (let i = game.powerUps.length - 1; i >= 0; i--) {
        const powerUp = game.powerUps[i];
        powerUp.y += powerUp.speed;
        
        // Remove power-ups that go off screen
        if (powerUp.y > game.height) {
            game.powerUps.splice(i, 1);
            continue;
        }
        
        // Draw power-up
        const powerUpImage = game.images.powerUps[powerUp.type];
        if (powerUpImage && powerUpImage.complete) {
            // Draw power-up image
            game.ctx.drawImage(
                powerUpImage,
                powerUp.x,
                powerUp.y,
                powerUp.width,
                powerUp.height
            );
        } else {
            // Fallback if image not loaded
            game.ctx.font = '24px Arial';
            game.ctx.fillText(powerUp.emoji, powerUp.x, powerUp.y);
        }
    }
}

// Spawn obstacle
function spawnObstacle() {
    const obstacleTypes = ['bomb', 'meteor'];
    const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    
    const obstacle = {
        x: Math.random() * (game.width - 40),
        y: -40,
        width: 40,
        height: 40,
        speed: 3 + Math.random() * 2,
        type: type,
        emoji: type === 'bomb' ? '🔥' : '🛰️'
    };
    
    game.obstacles.push(obstacle);
}

// Update obstacles
function updateObstacles(deltaTime) {
    for (let i = game.obstacles.length - 1; i >= 0; i--) {
        const obstacle = game.obstacles[i];
        obstacle.y += obstacle.speed;
        
        // Remove obstacles that go off screen
        if (obstacle.y > game.height) {
            game.obstacles.splice(i, 1);
            continue;
        }
        
        // Draw obstacle
        const obstacleImage = game.images.obstacles[obstacle.type];
        if (obstacleImage && obstacleImage.complete) {
            // Draw obstacle image
            game.ctx.drawImage(
                obstacleImage,
                obstacle.x,
                obstacle.y,
                obstacle.width,
                obstacle.height
            );
        } else {
            // Fallback if image not loaded
            game.ctx.font = '32px Arial';
            game.ctx.fillText(obstacle.emoji, obstacle.x, obstacle.y);
        }
    }
}

// Check collisions
function checkCollisions() {
    // Bullet-Alien collisions
    for (let i = game.bullets.length - 1; i >= 0; i--) {
        const bullet = game.bullets[i];
        
        for (let j = game.aliens.length - 1; j >= 0; j--) {
            const alien = game.aliens[j];
            
            if (checkCollision(bullet, alien)) {
                // Remove bullet
                game.bullets.splice(i, 1);
                
                // Reduce alien health
                alien.health--;
                
                // Remove alien if health is 0
                if (alien.health <= 0) {
                    // Create explosion effect
                    createExplosion(alien.x + alien.width/2, alien.y + alien.height/2);
                    
                    // Play explosion sound
                    playSound(game.sounds.explosion);
                    
                    game.aliens.splice(j, 1);
                    
                    // Increase score
                    game.score += (alien.type + 1) * 10;
                    document.getElementById('score').textContent = game.score;
                    
                    // Check for level up
                    if (game.score >= game.level * 100) {
                        game.level++;
                        showRandomTip();
                    }
                }
                
                break;
            }
        }
    }
    
    // Player-Alien collisions
    for (let i = game.aliens.length - 1; i >= 0; i--) {
        const alien = game.aliens[i];
        
        if (checkCollision(game.player, alien)) {
            // Create explosion effect
            createExplosion(alien.x + alien.width/2, alien.y + alien.height/2);
            
            game.aliens.splice(i, 1);
            
            if (!game.activePowerUps.shield) {
                // Play hit sound
                playSound(game.sounds.playerHit);
                loseLife();
            }
        }
    }
    
    // Player-PowerUp collisions
    for (let i = game.powerUps.length - 1; i >= 0; i--) {
        const powerUp = game.powerUps[i];
        
        if (checkCollision(game.player, powerUp)) {
            game.powerUps.splice(i, 1);
            
            // Play power-up sound
            playSound(game.sounds.powerUp);
            
            // Activate power-up
            activatePowerUp(powerUp.type);
        }
    }
    
    // Player-Obstacle collisions
    for (let i = game.obstacles.length - 1; i >= 0; i--) {
        const obstacle = game.obstacles[i];
        
        if (checkCollision(game.player, obstacle)) {
            // Create explosion effect
            createExplosion(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2);
            
            game.obstacles.splice(i, 1);
            
            if (!game.activePowerUps.shield) {
                // Play hit sound
                playSound(game.sounds.playerHit);
                loseLife();
            }
        }
    }
}

// Check if two objects are colliding
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

// Activate power-up
function activatePowerUp(type) {
    game.activePowerUps[type] = true;
    updatePowerUps();
    
    // Power-up duration
    setTimeout(() => {
        game.activePowerUps[type] = false;
        updatePowerUps();
    }, 10000);
}

// Update power-up UI
function updatePowerUps() {
    document.getElementById('shield').classList.toggle('active', game.activePowerUps.shield);
    document.getElementById('double-laser').classList.toggle('active', game.activePowerUps.doubleLaser);
    document.getElementById('speed-boost').classList.toggle('active', game.activePowerUps.speedBoost);
}

// Lose a life
function loseLife() {
    game.lives--;
    updateLives();
    
    if (game.lives <= 0) {
        gameOver();
    }
}

// Update lives UI
function updateLives() {
    const livesContainer = document.getElementById('lives');
    livesContainer.innerHTML = '';
    
    for (let i = 0; i < game.lives; i++) {
        const heart = document.createElement('span');
        heart.className = 'heart';
        heart.textContent = '❤️';
        livesContainer.appendChild(heart);
    }
}

// Show random tip
function showRandomTip() {
    const tipIndex = Math.floor(Math.random() * game.tips.length);
    document.getElementById('tip-text').textContent = game.tips[tipIndex];
}

// Game over
function gameOver() {
    game.isRunning = false;
    
    // Stop background music
    if (game.sounds.backgroundMusic) {
        game.sounds.backgroundMusic.pause();
    }
    
    // Play game over sound
    playSound(game.sounds.gameOver);
    
    // Update high score
    if (game.score > game.highScore) {
        game.highScore = game.score;
        localStorage.setItem('alienShooterHighScore', game.highScore);
    }
    
    // Show game over screen
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.remove('hidden');
    
    // Update final score
    document.querySelector('#final-score span').textContent = game.score;
    document.querySelector('#high-score span').textContent = game.highScore;
}

// Initialize the game when the page loads
window.addEventListener('load', init);
// Load game assets (images and sounds)
function loadAssets() {
    console.log("Loading game assets...");
    
    // Load images
    loadImages();
    
    // Load sounds
    loadSounds();
}

// Load game images
function loadImages() {
    // Background
    game.images.background = new Image();
    game.images.background.src = 'assets/images/background.png';
    game.images.background.onload = () => console.log("Background image loaded");
    
    // Player spaceship
    game.images.player = new Image();
    game.images.player.src = 'assets/images/spaceship.png';
    game.images.player.onload = () => console.log("Player image loaded");
    
    // Aliens
    for (let i = 1; i <= 3; i++) {
        const alienImg = new Image();
        alienImg.src = `assets/images/alien${i}.png`;
        alienImg.onload = () => console.log(`Alien ${i} image loaded`);
        game.images.aliens.push(alienImg);
    }
    
    // Power-ups
    game.images.powerUps.shield = new Image();
    game.images.powerUps.shield.src = 'assets/images/powerup_shield.png';
    game.images.powerUps.shield.onload = () => console.log("Shield power-up image loaded");
    
    game.images.powerUps.doubleLaser = new Image();
    game.images.powerUps.doubleLaser.src = 'assets/images/powerup_laser.png';
    game.images.powerUps.doubleLaser.onload = () => console.log("Double laser power-up image loaded");
    
    game.images.powerUps.speedBoost = new Image();
    game.images.powerUps.speedBoost.src = 'assets/images/powerup_speed.png';
    game.images.powerUps.speedBoost.onload = () => console.log("Speed boost power-up image loaded");
    
    // Obstacles
    game.images.obstacles.bomb = new Image();
    game.images.obstacles.bomb.src = 'assets/images/obstacle_bomb.png';
    game.images.obstacles.bomb.onload = () => console.log("Bomb obstacle image loaded");
    
    game.images.obstacles.meteor = new Image();
    game.images.obstacles.meteor.src = 'assets/images/obstacle_meteor.png';
    game.images.obstacles.meteor.onload = () => console.log("Meteor obstacle image loaded");
    
    // Explosion
    game.images.explosion = new Image();
    game.images.explosion.src = 'assets/images/explosion.png';
    game.images.explosion.onload = () => {
        console.log("Explosion sprite sheet loaded");
        // Create explosion animation frames
        const frameWidth = 64; // Assuming explosion sprite sheet has 64x64 frames
        const frameHeight = 64;
        const framesPerRow = 5; // Assuming 5 frames per row in the sprite sheet
        const totalFrames = 25; // Assuming 25 total frames
        
        for (let i = 0; i < totalFrames; i++) {
            const row = Math.floor(i / framesPerRow);
            const col = i % framesPerRow;
            
            game.spriteFrames.explosion.push({
                x: col * frameWidth,
                y: row * frameHeight,
                width: frameWidth,
                height: frameHeight
            });
        }
    };
}

// Load game sounds
function loadSounds() {
    // Background music
    game.sounds.backgroundMusic = new Audio('assets/sounds/background_music.mp3');
    game.sounds.backgroundMusic.loop = true;
    game.sounds.backgroundMusic.volume = 0.5;
    
    // Sound effects
    game.sounds.shoot = new Audio('assets/sounds/shoot.wav');
    game.sounds.explosion = new Audio('assets/sounds/explosion.wav');
    game.sounds.powerUp = new Audio('assets/sounds/powerup.wav');
    game.sounds.playerHit = new Audio('assets/sounds/player_hit.wav');
    game.sounds.gameOver = new Audio('assets/sounds/game_over.wav');
}

// Play sound with error handling
function playSound(sound) {
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(error => {
            console.error("Error playing sound:", error);
        });
    }
}
// Create explosion effect
function createExplosion(x, y) {
    game.explosions = game.explosions || [];
    
    game.explosions.push({
        x: x - 32, // Center explosion (assuming 64x64 explosion sprite)
        y: y - 32,
        width: 64,
        height: 64,
        frame: 0,
        maxFrames: game.spriteFrames.explosion.length,
        lastFrameTime: performance.now(),
        frameDelay: 50 // milliseconds between frames
    });
}

// Update and draw explosions
function updateExplosions(deltaTime) {
    if (!game.explosions) return;
    
    const now = performance.now();
    
    for (let i = game.explosions.length - 1; i >= 0; i--) {
        const explosion = game.explosions[i];
        
        // Update frame if enough time has passed
        if (now - explosion.lastFrameTime > explosion.frameDelay) {
            explosion.frame++;
            explosion.lastFrameTime = now;
            
            // Remove explosion if animation is complete
            if (explosion.frame >= explosion.maxFrames) {
                game.explosions.splice(i, 1);
                continue;
            }
        }
        
        // Draw explosion frame
        if (game.images.explosion && game.images.explosion.complete && game.spriteFrames.explosion.length > 0) {
            const frame = game.spriteFrames.explosion[explosion.frame];
            
            game.ctx.drawImage(
                game.images.explosion,
                frame.x, frame.y, frame.width, frame.height,
                explosion.x, explosion.y, explosion.width, explosion.height
            );
        } else {
            // Fallback if image not loaded
            game.ctx.fillStyle = '#ff9900';
            game.ctx.beginPath();
            game.ctx.arc(
                explosion.x + explosion.width / 2,
                explosion.y + explosion.height / 2,
                explosion.width / 2 * (1 - explosion.frame / explosion.maxFrames),
                0, Math.PI * 2
            );
            game.ctx.fill();
        }
    }
}
// Initialize the game when the page loads
window.addEventListener('load', init);

// Make sure gameStart is available globally
window.gameStart = gameStart;
