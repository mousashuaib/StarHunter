// Star.js - Star/Collectible Object Class
// كلاس خاص باللعبة (Game-specific)

class Star {
    constructor(x, y, value, isCorrect = false) {
        this.x = x;
        this.y = y;
        this.value = value; // الرقم المعروض على النجمة
        this.isCorrect = isCorrect; // هل هذه الإجابة الصحيحة؟
        
        // الحجم - جميع النجوم بنفس الحجم
        this.baseSize = 45;
        this.size = this.baseSize;
        this.width = this.size;
        this.height = this.size;
        
        // الحياة - النجوم لا تختفي!
        this.lifetime = Infinity;
        this.createdAt = Date.now();
        
        // حالة الجمع
        this.collected = false;
        this.collectedCorrect = false;
        
        // الأنيميشن
        this.animationProgress = 0;
        this.rotation = 0;
        this.scale = 1;
        this.opacity = 1;
    }

    /**
     * تحديث النجمة - مبسّط بدون ذهبي
     */
    update(deltaTime = 16) {
        // أنيميشن الجمع فقط
        if (this.collected) {
            this.animationProgress += 0.08;
            
            if (this.collectedCorrect) {
                // أنيميشن الإجابة الصحيحة
                this.scale = 1 + this.animationProgress * 0.5;
                this.rotation += 0.3;
            } else {
                // أنيميشن الإجابة الخاطئة
                this.scale = 1 - this.animationProgress * 0.8;
                this.rotation += 0.2;
                this.x += Math.sin(this.animationProgress * 20) * 2;
            }
            
            this.opacity = 1 - this.animationProgress;
            
            if (this.animationProgress >= 1) {
                return false; // إزالة النجمة
            }
        }

        // تحديث الأبعاد
        this.width = this.baseSize * this.scale;
        this.height = this.baseSize * this.scale;

        return true;
    }

    /**
     * رسم النجمة - مبسّط
     */
    draw(ctx, image = null) {
        ctx.save();
        
        // تطبيق الشفافية
        ctx.globalAlpha = this.opacity;
        
        // الانتقال للمركز للدوران
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotation);

        // رسم النجمة
        if (image) {
            ctx.drawImage(image, -this.width / 2, -this.height / 2, this.width, this.height);
        } else {
            // رسم نجمة بديلة
            ctx.fillStyle = '#FFFF00';
            ctx.beginPath();
            this.drawStarShape(0, 0, 5, this.width / 2, this.width / 4);
            ctx.fill();
            
            // حدود
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        ctx.restore();

        // رسم الرقم على النجمة
        if (!this.collected) {
            this.drawValue(ctx);
        }

        // رسم تغذية بصرية عند الجمع
        if (this.collected && this.animationProgress < 0.5) {
            this.drawFeedback(ctx);
        }
    }

    /**
     * رسم شكل النجمة
     */
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

    /**
     * رسم الرقم على النجمة
     */
    drawValue(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // ظل للنص
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        
        // رسم النص
        ctx.fillStyle = '#000';
        ctx.font = `bold ${Math.floor(this.width * 0.5)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.value, centerX, centerY);
        
        ctx.restore();
    }

    /**
     * رسم التغذية البصرية عند الجمع
     */
    drawFeedback(ctx) {
        ctx.save();
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2 - 30;
        
        ctx.globalAlpha = 1 - this.animationProgress * 2;
        
        if (this.collectedCorrect) {
            // ✓ للإجابة الصحيحة
            ctx.fillStyle = '#00FF00';
            ctx.font = 'bold 36px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('✓', centerX, centerY);
            
            // نقاط ثابتة
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 24px Arial';
            ctx.fillText('+10', centerX, centerY - 25);
        } else {
            // ✗ للإجابة الخاطئة
            ctx.fillStyle = '#FF0000';
            ctx.font = 'bold 36px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('✗', centerX, centerY);
            
            ctx.fillStyle = '#FF6666';
            ctx.font = 'bold 20px Arial';
            ctx.fillText('Wrong!', centerX, centerY - 25);
        }
        
        ctx.restore();
    }

    /**
     * جمع النجمة
     */
    collect(isCorrect) {
        this.collected = true;
        this.collectedCorrect = isCorrect;
    }

    /**
     * الحصول على حدود التصادم
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
     * الحصول على المركز
     */
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }

    /**
     * هل النجمة نشطة (يمكن جمعها)
     */
    isActive() {
        return !this.collected && this.opacity > 0.3;
    }
}