
(function() {
    'use strict';

    const CANVAS_ID = 'gameCanvas';
    
    const ASSETS = {
        images: {
            player: 'assets/player.png',
            star: 'assets/star.png',
            background: 'assets/background.png'
        },
        sounds: {
            correct: 'assets/correct.mp3',
            wrong: 'assets/wrong.mp3'
        }
    };

  
    async function init() {
        console.log('🎮 Initializing Star Hunter - Math Edition...');

        const canvas = document.getElementById(CANVAS_ID);
        if (!canvas) {
            console.error('Canvas element not found!');
            return;
        }

        const assetLoader = new AssetLoader();
        
        const game = new Game(canvas, assetLoader);
        
        assetLoader.onProgress = (progress) => {
            console.log(`Loading... ${Math.round(progress * 100)}%`);
            game.draw(); // رسم شريط التقدم
        };

        assetLoader.onComplete = () => {
            console.log('✅ All assets loaded successfully!');
            game.state = 'start';
            console.log('🎮 Game ready! Press SPACEBAR to start.');
        };

        try {
            await assetLoader.loadAll(ASSETS);
        } catch (error) {
            console.error('Error loading assets:', error);
            game.state = 'start';
        }

        game.start();

        displayDevInfo(game);

        window.game = game;
    }

    
    function displayDevInfo(game) {
        console.log(`
╔═══════════════════════════════════════════════════════════╗
║         🌟 STAR HUNTER - MATH EDITION 🌟                 ║
║                 Phase 2 - Serious Game                    ║
╠═══════════════════════════════════════════════════════════╣
║  🎯 Learning Skill: Basic Math Operations                ║
║  🎮 Controls:                                             ║
║     • Arrow Keys / WASD - Move                            ║
║     • SPACE - Start/Pause/Resume                          ║
║     • ESC - Pause                                         ║
║                                                           ║
║  📚 Game Rules:                                           ║
║     • Solve math problems by collecting correct stars    ║
║     • Win: 15 correct answers                             ║
║     • Lose: 5 mistakes OR time runs out (90s)            ║
║                                                           ║
║  ⭐ Scoring:                                              ║
║     • Normal answer: 10-15 points                         ║
║     • Golden answer: 50 points                            ║
║     • Level up every 3 correct answers in a row          ║
║                                                           ║
║  🔧 Developer Commands (Console):                        ║
║     • game.state = 'start'  - Go to start screen         ║
║     • game.lives = 10       - Add lives                   ║
║     • game.score += 100     - Add score                   ║
║     • game.questionManager.level = 5 - Change level      ║
╚═══════════════════════════════════════════════════════════╝
        `);
    }

 
    window.addEventListener('error', (event) => {
        console.error('❌ Runtime Error:', event.error);
    });

   
    window.addEventListener('unhandledrejection', (event) => {
        console.error('❌ Unhandled Promise Rejection:', event.reason);
    });


    window.addEventListener('beforeunload', () => {
        if (window.game) {
            window.game.stop();
        }
    });
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();


function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}


function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}


function lerp(start, end, t) {
    return start + (end - start) * t;
}