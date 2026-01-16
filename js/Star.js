class Star {
    constructor(x, y, value, isCorrect = false) {
        this.x = x;
        this.y = y;
        this.value = value; 
        this.isCorrect = isCorrect; 
        
        this.baseSize = 45;
        this.size = this.baseSize;
        this.width = this.size;
        this.height = this.size;
        
        this.lifetime = Infinity;
        this.createdAt = Date.now();
        
        this.collected = false;
        this.collectedCorrect = false;
        
        this.animationProgress = 0;
        this.rotation = 0;
        this.scale = 1;
        this.opacity = 1;
    }

    update(deltaTime = 16) {
        if (this.collected) {
            this.animationProgress += 0.08;
            
            if (this.collectedCorrect) {
                this.scale = 1 + this.animationProgress * 0.5;
                this.rotation += 0.3;
            } else {
                this.scale = 1 - this.animationProgress * 0.8;
                this.rotation += 0.2;
                this.x += Math.sin(this.animationProgress * 20) * 2;
            }
            
            this.opacity = 1 - this.animationProgress;
            
            if (this.animationProgress >= 1) {
                return false; 
            }
        }

        this.width = this.baseSize * this.scale;
        this.height = this.baseSize * this.scale;

        return true;
    }

   
    draw(ctx, image = null) {
        ctx.save();
        
        ctx.globalAlpha = this.opacity;
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotation);

        if (image) {
            ctx.drawImage(image, -this.width / 2, -this.height / 2, this.width, this.height);
        } else {
            ctx.fillStyle = '#FFFF00';
            ctx.beginPath();
            this.drawStarShape(0, 0, 5, this.width / 2, this.width / 4);
            ctx.fill();
            
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        ctx.restore();

        if (!this.collected) {
            this.drawValue(ctx);
        }

        if (this.collected && this.animationProgress < 0.5) {
            this.drawFeedback(ctx);
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

    drawValue(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        
        ctx.fillStyle = '#000';
        ctx.font = `bold ${Math.floor(this.width * 0.5)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.value, centerX, centerY);
        
        ctx.restore();
    }

    
    drawFeedback(ctx) {
        ctx.save();
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2 - 30;
        
        ctx.globalAlpha = 1 - this.animationProgress * 2;
        
        if (this.collectedCorrect) {
            ctx.fillStyle = '#00FF00';
            ctx.font = 'bold 36px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('✓', centerX, centerY);
            
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 24px Arial';
            ctx.fillText('+10', centerX, centerY - 25);
        } else {
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

    collect(isCorrect) {
        this.collected = true;
        this.collectedCorrect = isCorrect;
    }

    
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

   
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }

    
    isActive() {
        return !this.collected && this.opacity > 0.3;
    }
}