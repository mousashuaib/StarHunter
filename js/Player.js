// Player.js - Player Character Class
// كلاس خاص باللعبة (Game-specific)

class Player {
    constructor(x, y, size = 50, speed = 5) {
        this.x = x;
        this.y = y;
        this.width = size;
        this.height = size;
        this.speed = speed;
        
        // للحركة السلسة - محسّنة للسرعة
        this.velocityX = 0;
        this.velocityY = 0;
        this.acceleration = 1.2; // زيادة التسارع (كان 0.5)
        this.friction = 0.82; // تقليل الاحتكاك (كان 0.85)
        
        // حدود الشاشة (سيتم تعيينها من Game.js)
        this.maxX = 800;
        this.maxY = 600;
    }

    /**
     * تعيين حدود الحركة
     */
    setBounds(width, height) {
        this.maxX = width;
        this.maxY = height;
    }

    /**
     * التحديث بناءً على المدخلات - حركة مباشرة سريعة
     * @param {Object} keys - حالة المفاتيح
     */
    update(keys) {
        // الحركة الأفقية - مباشرة
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
            this.x -= this.speed;
        }
        if (keys['ArrowRight'] || keys['d'] || keys['D']) {
            this.x += this.speed;
        }

        // الحركة العمودية - مباشرة
        if (keys['ArrowUp'] || keys['w'] || keys['W']) {
            this.y -= this.speed;
        }
        if (keys['ArrowDown'] || keys['s'] || keys['S']) {
            this.y += this.speed;
        }

        // منع الخروج من الحدود
        this.x = Math.max(0, Math.min(this.maxX - this.width, this.x));
        this.y = Math.max(0, Math.min(this.maxY - this.height, this.y));
    }

    /**
     * رسم اللاعب
     * @param {CanvasRenderingContext2D} ctx - سياق الرسم
     * @param {Image} image - صورة اللاعب (اختياري)
     */
    draw(ctx, image = null) {
        if (image) {
            // رسم الصورة
            ctx.drawImage(image, this.x, this.y, this.width, this.height);
        } else {
            // رسم بديل (مربع أخضر)
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // إضافة حدود
            ctx.strokeStyle = '#00aa00';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }

        // رسم نقطة المركز (للتطوير فقط - يمكن حذفها)
        // ctx.fillStyle = 'red';
        // ctx.fillRect(this.x + this.width/2 - 2, this.y + this.height/2 - 2, 4, 4);
    }

    /**
     * الحصول على مستطيل الحدود للتصادم
     */
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    /**
     * الحصول على نقطة المركز
     */
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }

    /**
     * إعادة تعيين الموقع
     */
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.velocityX = 0;
        this.velocityY = 0;
    }

    /**
     * تحريك اللاعب لموقع محدد (للانيميشن)
     */
    moveTo(x, y) {
        this.x = x;
        this.y = y;
    }
}