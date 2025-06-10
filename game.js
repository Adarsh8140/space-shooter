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
    explosions: [],
    player: null,
    keys: {},
    isMobile: false,
    touchControls: {
        left: false,
        right: false,
        shoot: false
    },
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
        player: null,
        aliens: [],
        powerUps: {},
        obstacles: {},
        background: null
    },
    // Sounds
    sounds: {
        shoot: null,
        explosion: null,
        powerUp: null,
        gameOver: null
    }
};

// Initialize the game
function init() {
    console.log("Game initializing...");
    
    // Check if device is mobile
    game.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Set up canvas
    game.canvas = document.getElementById('game-canvas');
    if (!game.canvas) {
        console.error("Canvas element not found!");
        return;
    }
    
    game.ctx = game.canvas.getContext('2d');
    if (!game.ctx) {
        console.error("Could not get canvas context!");
        return;
    }
    
    // Load high score from local storage
    const savedHighScore = localStorage.getItem('alienShooterHighScore');
    if (savedHighScore) {
        game.highScore = parseInt(savedHighScore);
        document.querySelector('#high-score span').textContent = game.highScore;
    }
    
    // Set up keyboard controls
    window.addEventListener('keydown', (e) => game.keys[e.code] = true);
    window.addEventListener('keyup', (e) => game.keys[e.code] = false);
    
    // Set up touch controls
    setupTouchControls();
    
    // Resize handler
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Load images
    loadImages();
    
    // Load sounds
    loadSounds();
    
    // Add button event listeners
    document.getElementById('start-button').addEventListener('click', function() {
        console.log('Start button clicked');
        startGame();
    });
    
    document.getElementById('play-again-button').addEventListener('click', function() {
        console.log('Play again button clicked');
        startGame();
    });
    
    console.log("Game initialization complete");
}

// Set up touch controls for mobile
function setupTouchControls() {
    // Show/hide mobile controls based on device
    const mobileControls = document.getElementById('mobile-controls');
    if (game.isMobile) {
        mobileControls.style.display = 'flex';
    } else {
        mobileControls.style.display = 'none';
    }
    
    // Left button
    const leftButton = document.getElementById('left-button');
    leftButton.addEventListener('touchstart', function(e) {
        e.preventDefault();
        game.touchControls.left = true;
    });
    leftButton.addEventListener('touchend', function(e) {
        e.preventDefault();
        game.touchControls.left = false;
    });
    
    // Right button
    const rightButton = document.getElementById('right-button');
    rightButton.addEventListener('touchstart', function(e) {
        e.preventDefault();
        game.touchControls.right = true;
    });
    rightButton.addEventListener('touchend', function(e) {
        e.preventDefault();
        game.touchControls.right = false;
    });
    
    // Shoot button
    const shootButton = document.getElementById('shoot-button');
    shootButton.addEventListener('touchstart', function(e) {
        e.preventDefault();
        game.touchControls.shoot = true;
    });
    shootButton.addEventListener('touchend', function(e) {
        e.preventDefault();
        game.touchControls.shoot = false;
    });
    
    // Also add mouse events for testing on desktop
    leftButton.addEventListener('mousedown', function() {
        game.touchControls.left = true;
    });
    leftButton.addEventListener('mouseup', function() {
        game.touchControls.left = false;
    });
    
    rightButton.addEventListener('mousedown', function() {
        game.touchControls.right = true;
    });
    rightButton.addEventListener('mouseup', function() {
        game.touchControls.right = false;
    });
    
    shootButton.addEventListener('mousedown', function() {
        game.touchControls.shoot = true;
    });
    shootButton.addEventListener('mouseup', function() {
        game.touchControls.shoot = false;
    });
}

// Load game images
function loadImages() {
    try {
        // Player spaceship
        game.images.player = new Image();
        game.images.player.src = 'assets/images/spaceship.png';
        game.images.player.onload = () => console.log("Player image loaded");
        game.images.player.onerror = () => console.error("Error loading player image");
        
        // Alien images
        for (let i = 1; i <= 2; i++) {
            const alienImg = new Image();
            alienImg.src = `assets/images/alien${i}.png`;
            alienImg.onload = () => console.log(`Alien ${i} image loaded`);
            alienImg.onerror = () => console.error(`Error loading alien ${i} image`);
            game.images.aliens.push(alienImg);
        }
        
        // Power-up images
        game.images.powerUps.shield = new Image();
        game.images.powerUps.shield.src = 'assets/images/powerup_shield.png';
        game.images.powerUps.shield.onload = () => console.log("Shield power-up image loaded");
        
        // Obstacle images
        game.images.obstacles.meteor = new Image();
        game.images.obstacles.meteor.src = 'assets/images/obstacle_meteor.png';
        game.images.obstacles.meteor.onload = () => console.log("Meteor obstacle image loaded");
        
        // Explosion image
        game.images.explosion = new Image();
        game.images.explosion.src = 'assets/images/explosion.png';
        game.images.explosion.onload = () => console.log("Explosion image loaded");
        
        console.log("Image loading initiated");
    } catch (error) {
        console.error("Error loading images:", error);
    }
}

// Load game sounds
function loadSounds() {
    try {
        // Get audio elements
        game.sounds.shoot = document.getElementById('sound-shoot');
        game.sounds.explosion = document.getElementById('sound-explosion');
        game.sounds.powerUp = document.getElementById('sound-powerup');
        game.sounds.gameOver = document.getElementById('sound-gameover');
        
        console.log("Sound loading complete");
    } catch (error) {
        console.error("Error loading sounds:", error);
    }
}

// Play a sound with error handling
function playSound(sound) {
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(error => {
            console.error("Error playing sound:", error);
        });
    }
}

// Resize canvas to fit the game area
function resizeCanvas() {
    const gameArea = document.getElementById('game-area');
    game.width = gameArea.clientWidth;
    game.height = gameArea.clientHeight;
    game.canvas.width = game.width;
    game.canvas.height = game.height;
    console.log(`Canvas resized to ${game.width}x${game.height}`);
    
    // If the game is already running, adjust player position
    if (game.player) {
        // Make sure player stays within bounds after resize
        game.player.x = Math.min(game.player.x, game.width - game.player.width);
        game.player.y = game.height - 100;
    }
}

// Start the game
function startGame() {
    console.log("Starting game...");
    
    // Hide welcome screen, show game screen
    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    
    // Make sure canvas is properly sized after showing game screen
    resizeCanvas();
    
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
        x: game.width / 2 - 30,
        y: game.height - 100,
        width: 60,
        height: 60,
        speed: 5,
        color: '#00ff00'
    };
    
    console.log("Player created at", game.player.x, game.player.y);
    
    // Start game loop
    game.lastTime = performance.now();
    requestAnimationFrame(gameLoop);
    
    // Start spawning aliens
    spawnAliens();
    
    // Show random tip
    showRandomTip();
}

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
    // Make sure we have a valid context
    if (!game.ctx) {
        console.error("Canvas context is not available");
        return;
    }
    
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

// Update player position based on input
function updatePlayer(deltaTime) {
    const speedMultiplier = game.activePowerUps.speedBoost ? 1.5 : 1;
    
    // Keyboard controls
    if (game.keys['ArrowLeft'] || game.touchControls.left) {
        if (game.player.x > 0) {
            game.player.x -= game.player.speed * speedMultiplier;
        }
    }
    if (game.keys['ArrowRight'] || game.touchControls.right) {
        if (game.player.x < game.width - game.player.width) {
            game.player.x += game.player.speed * speedMultiplier;
        }
    }
    
    // Shooting
    if (game.keys['Space'] || game.touchControls.shoot) {
        shoot();
    }
}

// Draw the player
function drawPlayer() {
    // Make sure player exists
    if (!game.player) {
        console.error("Player object is not initialized");
        return;
    }
    
    // Flash effect when shooting
    if (game.player.flashEffect) {
        game.ctx.fillStyle = '#ffffff'; // White flash
    } else {
        game.ctx.fillStyle = game.player.color;
    }
    
    // Draw spaceship body
    game.ctx.beginPath();
    game.ctx.moveTo(game.player.x + game.player.width / 2, game.player.y);
    game.ctx.lineTo(game.player.x, game.player.y + game.player.height);
    game.ctx.lineTo(game.player.x + game.player.width, game.player.y + game.player.height);
    game.ctx.closePath();
    game.ctx.fill();
    
    // Draw laser cannons on the ship
    game.ctx.fillStyle = '#ff3333';
    game.ctx.fillRect(game.player.x + game.player.width * 0.3 - 2, game.player.y + 5, 4, 8);
    game.ctx.fillRect(game.player.x + game.player.width * 0.7 - 2, game.player.y + 5, 4, 8);
    
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
        
        // Fire two bullets at outward angles
        // Left bullet - angled toward upper-left
        game.bullets.push({
            x: game.player.x + game.player.width * 0.3,
            y: game.player.y,
            width: 5,
            height: 15,
            speed: 10,
            color: '#ff00ff',
            velocityX: -2,  // Move left as it travels up
            velocityY: -10  // Move up
        });
        
        // Right bullet - angled toward upper-right
        game.bullets.push({
            x: game.player.x + game.player.width * 0.7,
            y: game.player.y,
            width: 5,
            height: 15,
            speed: 10,
            color: '#ff00ff',
            velocityX: 2,   // Move right as it travels up
            velocityY: -10  // Move up
        });
        
        // Play shooting sound
        playSound(game.sounds.shoot);
        
        // Add a visual effect when shooting
        createLaserEffect();
    }
}

// Create a visual effect when shooting
function createLaserEffect() {
    // Flash effect on the player
    game.player.flashEffect = true;
    setTimeout(() => {
        game.player.flashEffect = false;
    }, 100);
}

// Update bullets
function updateBullets(deltaTime) {
    for (let i = game.bullets.length - 1; i >= 0; i--) {
        const bullet = game.bullets[i];
        
        // Move bullet according to its velocity
        bullet.x += bullet.velocityX;
        bullet.y += bullet.velocityY;
        
        // Remove bullets that go off screen
        if (bullet.y + bullet.height < 0 || 
            bullet.x < 0 || 
            bullet.x > game.width) {
            game.bullets.splice(i, 1);
            continue;
        }
        
        // Draw bullet with a glowing effect
        game.ctx.save();
        game.ctx.shadowBlur = 10;
        game.ctx.shadowColor = bullet.color;
        game.ctx.fillStyle = bullet.color;
        
        // Rotate the bullet based on its trajectory
        const angle = Math.atan2(bullet.velocityY, bullet.velocityX);
        game.ctx.translate(bullet.x + bullet.width/2, bullet.y + bullet.height/2);
        game.ctx.rotate(angle);
        game.ctx.fillRect(-bullet.width/2, -bullet.height/2, bullet.width, bullet.height);
        
        game.ctx.restore();
        game.ctx.shadowBlur = 0; // Reset shadow for other elements
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
        game.ctx.font = '24px Arial';
        game.ctx.fillText(powerUp.emoji, powerUp.x, powerUp.y);
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
        game.ctx.font = '32px Arial';
        game.ctx.fillText(obstacle.emoji, obstacle.x, obstacle.y);
    }
}

// Create explosion effect
function createExplosion(x, y) {
    game.explosions = game.explosions || [];
    
    game.explosions.push({
        x: x - 32,
        y: y - 32,
        width: 64,
        height: 64,
        frame: 0,
        maxFrames: 10,
        lastFrameTime: performance.now(),
        frameDelay: 50
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
        
        // Draw explosion
        const radius = explosion.width / 2 * (1 - explosion.frame / explosion.maxFrames);
        game.ctx.fillStyle = '#ff9900';
        game.ctx.beginPath();
        game.ctx.arc(
            explosion.x + explosion.width / 2,
            explosion.y + explosion.height / 2,
            radius,
            0, Math.PI * 2
        );
        game.ctx.fill();
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
                
                // One-hit kill - always destroy alien
                // Create explosion effect
                createExplosion(alien.x + alien.width/2, alien.y + alien.height/2);
                
                // Play explosion sound
                playSound(game.sounds.explosion);
                
                // Remove alien
                game.aliens.splice(j, 1);
                
                // Increase score
                game.score += (alien.type + 1) * 10;
                document.getElementById('score').textContent = game.score;
                
                // Check for level up
                if (game.score >= game.level * 100) {
                    game.level++;
                    showRandomTip();
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
                loseLife();
            }
        }
    }
    
    // Player-PowerUp collisions
    for (let i = game.powerUps.length - 1; i >= 0; i--) {
        const powerUp = game.powerUps[i];
        
        if (checkCollision(game.player, powerUp)) {
            game.powerUps.splice(i, 1);
            
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
    
    // Play power-up sound
    playSound(game.sounds.powerUp);
    
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
