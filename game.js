const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const pauseMenu = document.getElementById('pauseMenu');
const resumeBtn = document.getElementById('resumeBtn');
const restartBtn = document.getElementById('restartBtn');
const exitBtn = document.getElementById('exitBtn');

let pausedTime = 0;
let pauseStartTime = 0;


const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;
const PLAYER_SIZE = 50;
const PLAYER_SPEED = 5;
const STAR_SIZE = 40;
const GOLDEN_STAR_SIZE = 50;
const MAX_STARS = 5;
const STAR_MIN_LIFETIME = 2000; 
const STAR_MAX_LIFETIME = 5000; 
const GOLDEN_STAR_CHANCE = 0.15; // 
const GAME_DURATION = 60; 

let gameState = 'start'; 
let score = 0;
let highScore = 0;
let player = null;
let stars = [];
let keys = {};
let imagesLoaded = false;
let soundLoaded = false;
let gameTimer = 0;
let gameStartTime = 0;

try {
    const savedHighScore = localStorage.getItem('starHunterHighScore');
    if (savedHighScore) {
        highScore = parseInt(savedHighScore);
    }
} catch (e) {
    console.warn('Could not load high score');
}

const images = {
    player: new Image(),
    star: new Image(),
    background: new Image()
};

let collectSound;

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = PLAYER_SIZE;
        this.height = PLAYER_SIZE;
        this.speed = PLAYER_SPEED;
    }

    update() {
        if (keys['ArrowUp'] || keys['w'] || keys['W']) {
            this.y -= this.speed;
        }
        if (keys['ArrowDown'] || keys['s'] || keys['S']) {
            this.y += this.speed;
        }
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
            this.x -= this.speed;
        }
        if (keys['ArrowRight'] || keys['d'] || keys['D']) {
            this.x += this.speed;
        }

        this.x = Math.max(0, Math.min(GAME_WIDTH - this.width, this.x));
        this.y = Math.max(0, Math.min(GAME_HEIGHT - this.height, this.y));
    }

    draw() {
        if (imagesLoaded) {
            ctx.drawImage(images.player, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

class Star {
    constructor(isGolden = false) {
        this.isGolden = isGolden;
        this.size = isGolden ? GOLDEN_STAR_SIZE : STAR_SIZE;
        this.x = Math.random() * (GAME_WIDTH - this.size);
        this.y = Math.random() * (GAME_HEIGHT - this.size);
        this.width = this.size;
        this.height = this.size;
        this.lifetime = STAR_MIN_LIFETIME + Math.random() * (STAR_MAX_LIFETIME - STAR_MIN_LIFETIME);
        this.createdAt = Date.now();
        this.collected = false;
        this.animationProgress = 0;
        this.rotation = 0;
        this.points = isGolden ? 50 : 10;
    }

    update() {
        if (Date.now() - this.createdAt > this.lifetime && !this.collected) {
            return false; 
        }

        if (this.collected) {
            this.animationProgress += 0.1;
            this.rotation += 0.3;
            this.width *= 0.95;
            this.height *= 0.95;
            
            if (this.animationProgress > 1) {
                return false; 
            }
        } else if (this.isGolden) {
            this.rotation += 0.05;
        }

        return true; 
    }

    draw() {
        if (this.collected) {
            ctx.save();
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(this.rotation);
            ctx.globalAlpha = 1 - this.animationProgress;
            
            if (imagesLoaded) {
                ctx.drawImage(images.star, -this.width / 2, -this.height / 2, this.width, this.height);
            } else {
                ctx.fillStyle = this.isGolden ? '#FFD700' : '#ffff00';
                ctx.beginPath();
                this.drawStarShape(0, 0, 5, this.width / 2, this.width / 4);
                ctx.fill();
            }
            
            ctx.restore();
        } else {
            ctx.save();
            
            if (this.isGolden) {
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#FFD700';
                ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
                ctx.rotate(this.rotation);
                
                if (imagesLoaded) {
                    ctx.drawImage(images.star, -this.width / 2, -this.height / 2, this.width, this.height);
                } else {
                    ctx.fillStyle = '#FFD700';
                    ctx.beginPath();
                    this.drawStarShape(0, 0, 5, this.width / 2, this.width / 4);
                    ctx.fill();
                }
            } else {
                if (imagesLoaded) {
                    ctx.drawImage(images.star, this.x, this.y, this.width, this.height);
                } else {
                    ctx.fillStyle = '#ffff00';
                    ctx.beginPath();
                    this.drawStarShape(this.x + this.width / 2, this.y + this.height / 2, 5, this.width / 2, this.width / 4);
                    ctx.fill();
                }
            }
            
            ctx.restore();
                        if (this.isGolden) {
                ctx.fillStyle = '#FFD700';
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('+' + this.points, this.x + this.width / 2, this.y - 10);
            }
        }
    }

    drawStarShape(cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let step = Math.PI / spikes;

        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
            rot += step;
            ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function saveHighScore() {
    try {
        localStorage.setItem('starHunterHighScore', highScore.toString());
    } catch (e) {
        console.warn('Could not save high score');
    }
}
function startGame() {
    gameState = 'playing';
    score = 0;
    stars = [];
    pausedTime = 0;
    gameStartTime = Date.now();

    player = new Player(
        GAME_WIDTH / 2 - PLAYER_SIZE / 2,
        GAME_HEIGHT / 2 - PLAYER_SIZE / 2
    );

    pauseMenu.classList.remove('active');
}

function pauseGame() {
    if (gameState === 'playing') {
        gameState = 'paused';
        pauseStartTime = Date.now();
        pauseMenu.classList.add('active');
    }
}

function resumeGame() {
    if (gameState === 'paused') {
        gameState = 'playing';

        const pauseDuration = Date.now() - pauseStartTime;
        pausedTime += pauseDuration;

        pauseMenu.classList.remove('active');
    }
}

function exitToMenu() {
    gameState = 'start';
    stars = [];
    pauseMenu.classList.remove('active');
}

function init() {
    images.player.src = 'assets/player.png';
    images.star.src = 'assets/star.png';
    images.background.src = 'assets/background.png';

    let loadedCount = 0;
    const totalImages = Object.keys(images).length;
    
    Object.values(images).forEach(img => {
        img.onload = () => {
            loadedCount++;
            if (loadedCount === totalImages) {
                imagesLoaded = true;
            }
        };
        img.onerror = () => {
            loadedCount++;
            console.warn('Image failed to load, using fallback graphics');
            if (loadedCount === totalImages) {
                imagesLoaded = false;
            }
        };
    });

    try {
        collectSound = new Audio('assets/collect.mp3');
        collectSound.volume = 0.3;
        soundLoaded = true;
    } catch (e) {
        console.warn('Sound failed to load');
        soundLoaded = false;
    }

    player = new Player(GAME_WIDTH / 2 - PLAYER_SIZE / 2, GAME_HEIGHT / 2 - PLAYER_SIZE / 2);

  window.addEventListener('keydown', (e) => {
    if (keys[e.key]) return;
    keys[e.key] = true;

    if (gameState === 'paused' && e.key !== ' ') return;

    if (e.key === ' ' && (gameState === 'start' || gameState === 'gameover')) {
        e.preventDefault();
        startGame();
    }
    else if (e.key === ' ' && gameState === 'playing') {
        e.preventDefault();
        pauseGame();
    }
    else if (e.key === ' ' && gameState === 'paused') {
        e.preventDefault();
        resumeGame();
    }
    else if (e.key === 'Escape' && gameState === 'playing') {
        pauseGame();
    }
});


    window.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    gameLoop();
}

function update() {
    if (gameState !== 'playing') return;

const elapsedTime = (Date.now() - gameStartTime - pausedTime) / 1000;
    gameTimer = Math.max(0, GAME_DURATION - elapsedTime);
    
    if (gameTimer <= 0) {
        gameState = 'gameover';
        if (score > highScore) {
            highScore = score;
            saveHighScore();
        }
        return;
    }

    player.update();

    stars = stars.filter(star => star.update());

    const playerBounds = player.getBounds();
    stars.forEach(star => {
        if (!star.collected && checkCollision(playerBounds, star.getBounds())) {
            star.collected = true;
            score += star.points;
            
            if (soundLoaded) {
                try {
                    collectSound.currentTime = 0;
                    collectSound.play();
                } catch (e) {
                    console.warn('Could not play sound');
                }
            }
        }
    });

    if (stars.filter(s => !s.collected).length < MAX_STARS) {
        if (Math.random() < 0.02) { 
            const isGolden = Math.random() < GOLDEN_STAR_CHANCE;
            stars.push(new Star(isGolden));
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    if (imagesLoaded) {
        ctx.drawImage(images.background, 0, 0, GAME_WIDTH, GAME_HEIGHT);
    } else {
        const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#0f0f1e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }

    if (gameState === 'start') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('STAR HUNTER', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100);

        ctx.font = '24px Arial';
        ctx.fillText('Instructions:', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30);
        ctx.font = '20px Arial';
        ctx.fillText('Use Arrow Keys or WASD to move', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10);
        ctx.fillText('Collect stars before they disappear!', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40);
        ctx.fillText('Yellow stars = 10 points', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 70);
        
        ctx.fillStyle = '#FFD700';
        ctx.fillText('Golden stars = 50 points!', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100);
        
        ctx.fillStyle = '#ffffff';
        ctx.fillText('You have 60 seconds!', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 130);

        ctx.font = 'bold 28px Arial';
        ctx.fillStyle = '#ffff00';
        ctx.fillText('Press SPACEBAR to Start', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 180);
        
        if (highScore > 0) {
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 24px Arial';
            ctx.fillText('High Score: ' + highScore, GAME_WIDTH / 2, GAME_HEIGHT - 50);
        }

   } else if (gameState === 'playing') {

    stars.forEach(star => star.draw());
    player.draw();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, GAME_WIDTH, 60);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Star Hunter', 20, 40);

    ctx.textAlign = 'center';
    const timeColor = gameTimer < 10 ? '#ff0000' : '#ffffff';
    ctx.fillStyle = timeColor;
    ctx.fillText('Time: ' + Math.ceil(gameTimer) + 's', GAME_WIDTH / 2, 40);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Score: ' + score, GAME_WIDTH - 20, 40);

} else if (gameState === 'paused') {

    stars.forEach(star => star.draw());
    player.draw();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

   


        
    } else if (gameState === 'gameover') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 56px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('TIME UP!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px Arial';
        ctx.fillText('Final Score: ' + score, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10);
        
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 32px Arial';
        ctx.fillText('High Score: ' + highScore, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40);
        
        if (score === highScore && score > 0) {
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 28px Arial';
            ctx.fillText('🌟 NEW HIGH SCORE! 🌟', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 90);
        }

        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 28px Arial';
        ctx.fillText('Press SPACEBAR to Play Again', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 150);
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

resumeBtn.addEventListener('click', resumeGame);
restartBtn.addEventListener('click', startGame);
exitBtn.addEventListener('click', exitToMenu);


init();