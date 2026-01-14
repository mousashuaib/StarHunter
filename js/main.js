// main.js - Entry Point and Initialization
// نقطة البداية وربط جميع المكونات

(function() {
    'use strict';

    // ===== CONSTANTS =====
    const CANVAS_ID = 'gameCanvas';
    
    // مسارات الملفات
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

    // ===== INITIALIZATION =====

    /**
     * التهيئة الرئيسية
     */
    async function init() {
        console.log('🎮 Initializing Star Hunter - Math Edition...');

        // الحصول على Canvas
        const canvas = document.getElementById(CANVAS_ID);
        if (!canvas) {
            console.error('Canvas element not found!');
            return;
        }

        // إنشاء محمل الملفات
        const assetLoader = new AssetLoader();
        
        // إنشاء اللعبة
        const game = new Game(canvas, assetLoader);
        
        // إعداد callbacks للتحميل
        assetLoader.onProgress = (progress) => {
            console.log(`Loading... ${Math.round(progress * 100)}%`);
            // يمكن تحديث شاشة التحميل هنا
            game.draw(); // رسم شريط التقدم
        };

        assetLoader.onComplete = () => {
            console.log('✅ All assets loaded successfully!');
            // الانتقال لشاشة البداية
            game.state = 'start';
            console.log('🎮 Game ready! Press SPACEBAR to start.');
        };

        // بدء التحميل
        try {
            await assetLoader.loadAll(ASSETS);
        } catch (error) {
            console.error('Error loading assets:', error);
            // حتى لو فشل التحميل، نستمر بدون الملفات
            game.state = 'start';
        }

        // بدء حلقة اللعبة
        game.start();

        // عرض معلومات التطوير في Console
        displayDevInfo(game);

        // حفظ مرجع اللعبة للوصول من Console (للتطوير)
        window.game = game;
    }

    /**
     * عرض معلومات التطوير
     */
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

    /**
     * معالجة الأخطاء العامة
     */
    window.addEventListener('error', (event) => {
        console.error('❌ Runtime Error:', event.error);
    });

    /**
     * معالجة الأخطاء غير المعالجة في Promises
     */
    window.addEventListener('unhandledrejection', (event) => {
        console.error('❌ Unhandled Promise Rejection:', event.reason);
    });

    /**
     * التنظيف عند إغلاق الصفحة
     */
    window.addEventListener('beforeunload', () => {
        if (window.game) {
            window.game.stop();
        }
    });

    // ===== START THE GAME =====
    
    // انتظار تحميل DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM محمل بالفعل
        init();
    }

})();

// ===== UTILITY FUNCTIONS (Global Helpers) =====

/**
 * Generic collision detection function
 * يمكن استخدامها في أي لعبة
 */
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

/**
 * Generic random integer function
 * يمكن استخدامها في أي لعبة
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generic distance calculation
 * يمكن استخدامها في أي لعبة
 */
function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

/**
 * Generic clamp function
 * يمكن استخدامها في أي لعبة
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Generic lerp (linear interpolation)
 * يمكن استخدامها في أي لعبة
 */
function lerp(start, end, t) {
    return start + (end - start) * t;
}