// Game.js - Main Game Controller and State Management
// كلاس خاص باللعبة (Game-specific)

class Game {
    constructor(canvas, assetLoader) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.assets = assetLoader;
        
        // أبعاد اللعبة
        this.width = canvas.width;
        this.height = canvas.height;
        
        // حالة اللعبة
        this.state = 'loading'; // loading, start, playing, paused, gameover, victory
        
        // عناصر اللعبة
        this.player = null;
        this.stars = [];
        this.questionManager = new QuestionManager();
        
        // التحكم
        this.keys = {};
        this.setupInput();
        
        // التوقيت
        this.gameTimer = 0;
        this.gameStartTime = 0;
        this.pausedTime = 0;
        this.pauseStartTime = 0;
        this.gameDuration = 90; // 90 ثانية
        
        // النقاط والإحصائيات
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.lives = 5; // عدد الأخطاء المسموح بها
        this.maxLives = 5;
        
        // أهداف اللعبة
        this.targetCorrectAnswers = 15; // الفوز عند 15 إجابة صحيحة
        
        // عناصر الواجهة
        this.pauseMenu = document.getElementById('pauseMenu');
        this.setupUI();
        
        // Game loop
        this.lastTime = 0;
        this.running = false;
    }

    // ===== INITIALIZATION =====
    
    /**
     * إعداد المدخلات
     */
    setupInput() {
        window.addEventListener('keydown', (e) => {
            if (this.keys[e.key]) return;
            this.keys[e.key] = true;

            // منع التمرير بالمسافة والأسهم
            if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }

            this.handleKeyPress(e.key);
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }

    /**
     * إعداد واجهة المستخدم
     */
    setupUI() {
        document.getElementById('resumeBtn').addEventListener('click', () => this.resumeGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('exitBtn').addEventListener('click', () => this.exitToMenu());
    }

    /**
     * معالجة الضغط على المفاتيح
     */
    handleKeyPress(key) {
        if (key === ' ') {
            if (this.state === 'start' || this.state === 'gameover' || this.state === 'victory') {
                this.startGame();
            } else if (this.state === 'playing') {
                this.pauseGame();
            } else if (this.state === 'paused') {
                this.resumeGame();
            }
        } else if (key === 'Escape' && this.state === 'playing') {
            this.pauseGame();
        }
    }

    // ===== GAME STATE MANAGEMENT =====

    /**
     * بدء اللعبة
     */
    startGame() {
        this.state = 'playing';
        this.score = 0;
        this.lives = this.maxLives;
        this.stars = [];
        this.pausedTime = 0;
        this.gameStartTime = Date.now();
        
        // إعادة تعيين مدير الأسئلة
        this.questionManager.reset();
        
        // إنشاء اللاعب
        this.player = new Player(
            this.width / 2 - 25,
            this.height / 2 - 25,
            50,
            7 // زيادة السرعة من 5 إلى 7
        );
        this.player.setBounds(this.width, this.height);
        
        // توليد السؤال الأول والنجوم
        this.generateNewQuestion();
        
        this.pauseMenu.classList.remove('active');
    }

    /**
     * إيقاف مؤقت
     */
    pauseGame() {
        if (this.state === 'playing') {
            this.state = 'paused';
            this.pauseStartTime = Date.now();
            this.pauseMenu.classList.add('active');
        }
    }

    /**
     * استئناف اللعبة
     */
    resumeGame() {
        if (this.state === 'paused') {
            this.state = 'playing';
            const pauseDuration = Date.now() - this.pauseStartTime;
            this.pausedTime += pauseDuration;
            this.pauseMenu.classList.remove('active');
        }
    }

    /**
     * إعادة البدء
     */
    restartGame() {
        this.startGame();
    }

    /**
     * العودة للقائمة
     */
    exitToMenu() {
        this.state = 'start';
        this.stars = [];
        this.pauseMenu.classList.remove('active');
    }

    /**
     * انتهاء اللعبة (خسارة)
     */
    gameOver() {
        this.state = 'gameover';
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
    }

    /**
     * الفوز
     */
    victory() {
        this.state = 'victory';
        // مكافأة الوقت المتبقي
        const timeBonus = Math.floor(this.gameTimer * 2);
        this.score += timeBonus;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
    }

    // ===== GAME LOGIC =====

    /**
     * توليد سؤال جديد ونجوم
     */
    generateNewQuestion() {
        // مسح النجوم القديمة
        this.stars = [];
        
        // توليد سؤال جديد
        const question = this.questionManager.generateNewQuestion();
        
        // إنشاء نجوم بالإجابات (جميعها عادية)
        const answers = question.allAnswers;
        const positions = this.generateStarPositions(answers.length);
        
        answers.forEach((answer, index) => {
            const pos = positions[index];
            const isCorrect = answer === question.correctAnswer;
            const star = new Star(pos.x, pos.y, answer, isCorrect);
            this.stars.push(star);
        });
    }

    /**
     * توليد مواقع النجوم (بعيدة عن اللاعب!)
     */
    generateStarPositions(count) {
        const positions = [];
        const margin = 60;
        const minDistance = 100; // المسافة بين النجوم
        const minPlayerDistance = 150; // المسافة من اللاعب (مهم!)
        const maxAttempts = 30;
        
        // موقع اللاعب
        const playerX = this.player.x + this.player.width / 2;
        const playerY = this.player.y + this.player.height / 2;
        
        for (let i = 0; i < count; i++) {
            let attempts = 0;
            let pos = null;
            let bestPos = null;
            let bestDistance = 0;
            
            while (attempts < maxAttempts) {
                const candidate = {
                    x: margin + Math.random() * (this.width - margin * 2 - 60),
                    y: 120 + Math.random() * (this.height - 180)
                };
                
                // حساب المسافة من اللاعب
                const distFromPlayer = Math.hypot(
                    playerX - (candidate.x + 25),
                    playerY - (candidate.y + 25)
                );
                
                // حساب أقرب مسافة للنجوم الموجودة
                let minDistFromStars = Infinity;
                for (const p of positions) {
                    const dist = Math.hypot(p.x - candidate.x, p.y - candidate.y);
                    if (dist < minDistFromStars) minDistFromStars = dist;
                }
                
                // الموقع مثالي إذا:
                // 1. بعيد عن اللاعب (150px على الأقل)
                // 2. بعيد عن النجوم الأخرى (100px على الأقل)
                if (distFromPlayer >= minPlayerDistance && 
                    (minDistFromStars >= minDistance || positions.length === 0)) {
                    pos = candidate;
                    break;
                }
                
                // نحفظ أفضل موقع بعيد عن اللاعب
                if (distFromPlayer > bestDistance) {
                    bestDistance = distFromPlayer;
                    bestPos = candidate;
                }
                
                attempts++;
            }
            
            // استخدام أفضل موقع وجدناه
            positions.push(pos || bestPos || {
                x: margin + Math.random() * (this.width - margin * 2 - 60),
                y: 120 + Math.random() * (this.height - 180)
            });
        }
        
        return positions;
    }

    /**
     * التحديث الرئيسي
     */
    update(deltaTime) {
        if (this.state !== 'playing') return;

        // تحديث المؤقت
        const elapsedTime = (Date.now() - this.gameStartTime - this.pausedTime) / 1000;
        this.gameTimer = Math.max(0, this.gameDuration - elapsedTime);
        
        // انتهاء الوقت
        if (this.gameTimer <= 0) {
            this.gameOver();
            return;
        }

        // تحديث اللاعب
        this.player.update(this.keys);

        // تحديث النجوم
        this.stars = this.stars.filter(star => star.update(deltaTime));

        // فحص التصادم
        this.checkCollisions();

        // التحقق من شروط الفوز
        const stats = this.questionManager.getStats();
        if (stats.totalCorrect >= this.targetCorrectAnswers) {
            this.victory();
        }

        // التحقق من شروط الخسارة
        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    /**
     * فحص التصادم مع النجوم
     */
    checkCollisions() {
        const playerBounds = this.player.getBounds();
        
        this.stars.forEach(star => {
            if (!star.isActive()) return;
            
            const starBounds = star.getBounds();
            if (this.checkCollision(playerBounds, starBounds)) {
                // جمع النجمة
                const result = this.questionManager.submitAnswer(star.value);
                star.collect(result.isCorrect);
                
                if (result.isCorrect) {
                    // إجابة صحيحة
                    this.score += result.points;
                    this.assets.playSound('correct');
                    
                    // سؤال جديد بعد تأخير قصير
                    setTimeout(() => {
                        if (this.state === 'playing') {
                            this.generateNewQuestion();
                        }
                    }, 800);
                } else {
                    // إجابة خاطئة
                    this.lives--;
                    this.assets.playSound('wrong');
                    
                    // لا نولد سؤال جديد - يجب المحاولة مرة أخرى
                }
            }
        });
    }

    /**
     * فحص التصادم بين مستطيلين
     */
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    // ===== RENDERING =====

    /**
     * الرسم الرئيسي
     */
    draw() {
        // مسح الشاشة
        this.ctx.clearRect(0, 0, this.width, this.height);

        // رسم الخلفية
        this.drawBackground();

        // رسم بناءً على الحالة
        switch (this.state) {
            case 'loading':
                this.drawLoading();
                break;
            case 'start':
                this.drawStartScreen();
                break;
            case 'playing':
                this.drawGame();
                break;
            case 'paused':
                this.drawGame();
                this.drawPauseOverlay();
                break;
            case 'gameover':
                this.drawGameOver();
                break;
            case 'victory':
                this.drawVictory();
                break;
        }
    }

    /**
     * رسم الخلفية
     */
    drawBackground() {
        const bgImage = this.assets.getImage('background');
        if (bgImage) {
            this.ctx.drawImage(bgImage, 0, 0, this.width, this.height);
        } else {
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(1, '#0f0f1e');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
    }

    /**
     * رسم شاشة التحميل
     */
    drawLoading() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Loading...', this.width / 2, this.height / 2);
        
        const progress = this.assets.getProgress();
        const barWidth = 400;
        const barHeight = 30;
        const x = (this.width - barWidth) / 2;
        const y = this.height / 2 + 40;
        
        this.ctx.strokeStyle = '#fff';
        this.ctx.strokeRect(x, y, barWidth, barHeight);
        
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(x, y, barWidth * progress, barHeight);
    }

    /**
     * رسم شاشة البداية
     */
    drawStartScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 56px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('⭐ STAR HUNTER ⭐', this.width / 2, 120);

        this.ctx.fillStyle = '#FFA500';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.fillText('Math Edition', this.width / 2, 160);

        this.ctx.fillStyle = '#fff';
        this.ctx.font = '24px Arial';
        this.ctx.fillText('📚 How to Play:', this.width / 2, 230);

        this.ctx.font = '20px Arial';
        const instructions = [
            '1. Solve the math problem shown at the top',
            '2. Move with Arrow Keys or WASD',
            '3. Collect the star with the correct answer',
            '4. Wrong answer = lose 1 life ❤️',
            `5. Get ${this.targetCorrectAnswers} correct answers to WIN!`,
            '',
            '💡 All correct answers = 10 points',
            '⏰ You have 90 seconds!'
        ];

        instructions.forEach((text, i) => {
            this.ctx.fillText(text, this.width / 2, 270 + i * 30);
        });

        this.ctx.font = 'bold 32px Arial';
        this.ctx.fillStyle = '#00FF00';
        this.ctx.fillText('Press SPACEBAR to Start', this.width / 2, this.height - 80);

        if (this.highScore > 0) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.fillText(`High Score: ${this.highScore}`, this.width / 2, this.height - 30);
        }
    }

    /**
     * رسم اللعبة
     */
    drawGame() {
        // رسم النجوم
        const starImage = this.assets.getImage('star');
        this.stars.forEach(star => star.draw(this.ctx, starImage));

        // رسم اللاعب
        const playerImage = this.assets.getImage('player');
        this.player.draw(this.ctx, playerImage);

        // رسم الواجهة
        this.drawUI();
    }

    /**
     * رسم واجهة اللعبة
     */
    drawUI() {
        // خلفية للواجهة
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.width, 100);

        // السؤال
        const question = this.questionManager.currentQuestion;
        if (question) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 36px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(question.getQuestionText(), this.width / 2, 45);
        }

        // المستوى
        const stats = this.questionManager.getStats();
        this.ctx.fillStyle = Question.getLevelColor(stats.level);
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Level ${stats.level}`, 20, 80);

        // النقاط
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`Score: ${this.score}`, this.width - 20, 35);

        // الوقت
        const timeColor = this.gameTimer < 15 ? '#FF0000' : '#fff';
        this.ctx.fillStyle = timeColor;
        this.ctx.fillText(`Time: ${Math.ceil(this.gameTimer)}s`, this.width - 20, 65);

        // التقدم
        this.ctx.fillText(`Progress: ${stats.totalCorrect}/${this.targetCorrectAnswers}`, this.width - 20, 95);

        // الحيوات
        this.ctx.textAlign = 'left';
        this.ctx.fillStyle = '#FF0000';
        this.ctx.font = 'bold 28px Arial';
        let heartsText = '❤️'.repeat(this.lives);
        this.ctx.fillText(heartsText, 20, 35);
    }

    /**
     * طبقة الإيقاف المؤقت
     */
    drawPauseOverlay() {
        // لا نرسم شيء هنا - القائمة في HTML
    }

    /**
     * شاشة الخسارة
     */
    drawGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.fillStyle = '#FF0000';
        this.ctx.font = 'bold 64px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER!', this.width / 2, this.height / 2 - 100);

        const stats = this.questionManager.getStats();
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '28px Arial';
        this.ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2 - 20);
        this.ctx.fillText(`Correct Answers: ${stats.totalCorrect}`, this.width / 2, this.height / 2 + 20);
        this.ctx.fillText(`Accuracy: ${stats.accuracy}%`, this.width / 2, this.height / 2 + 60);

        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText(`High Score: ${this.highScore}`, this.width / 2, this.height / 2 + 110);

        this.ctx.fillStyle = '#00FF00';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.fillText('Press SPACEBAR to Try Again', this.width / 2, this.height - 80);
    }

    /**
     * شاشة الفوز
     */
    drawVictory() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 64px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎉 VICTORY! 🎉', this.width / 2, this.height / 2 - 100);

        const stats = this.questionManager.getStats();
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '28px Arial';
        this.ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2 - 20);
        this.ctx.fillText(`Level Reached: ${stats.level}`, this.width / 2, this.height / 2 + 20);
        this.ctx.fillText(`Accuracy: ${stats.accuracy}%`, this.width / 2, this.height / 2 + 60);

        if (this.score === this.highScore && this.score > 0) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 32px Arial';
            this.ctx.fillText('⭐ NEW HIGH SCORE! ⭐', this.width / 2, this.height / 2 + 120);
        } else {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.fillText(`High Score: ${this.highScore}`, this.width / 2, this.height / 2 + 110);
        }

        this.ctx.fillStyle = '#00FF00';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.fillText('Press SPACEBAR to Play Again', this.width / 2, this.height - 80);
    }

    // ===== STORAGE =====

    /**
     * تحميل أعلى نقاط
     */
    loadHighScore() {
        try {
            const saved = localStorage.getItem('starHunterMathHighScore');
            return saved ? parseInt(saved) : 0;
        } catch (e) {
            console.warn('Could not load high score');
            return 0;
        }
    }

    /**
     * حفظ أعلى نقاط
     */
    saveHighScore() {
        try {
            localStorage.setItem('starHunterMathHighScore', this.highScore.toString());
        } catch (e) {
            console.warn('Could not save high score');
        }
    }

    // ===== GAME LOOP =====

    /**
     * بدء حلقة اللعبة
     */
    start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }

    /**
     * حلقة اللعبة الرئيسية
     */
    gameLoop(currentTime) {
        if (!this.running) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    /**
     * إيقاف اللعبة
     */
    stop() {
        this.running = false;
    }
}