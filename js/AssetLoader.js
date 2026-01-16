class AssetLoader {
    constructor() {
        this.images = {};
        this.sounds = {};
        this.loadedCount = 0;
        this.totalAssets = 0;
        this.onProgress = null;
        this.onComplete = null;
    }

   
    loadImage(key, src) {
        this.totalAssets++;
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                this.images[key] = img;
                this.loadedCount++;
                this.updateProgress();
                resolve(img);
            };
            
            img.onerror = () => {
                console.warn(`Failed to load image: ${src}`);
                this.loadedCount++;
                this.updateProgress();
                resolve(null);
            };
            
            img.src = src;
        });
    }

    
    loadSound(key, src) {
        this.totalAssets++;
        
        return new Promise((resolve, reject) => {
            try {
                const audio = new Audio(src);
                audio.volume = 0.3;
                
                audio.addEventListener('canplaythrough', () => {
                    this.sounds[key] = audio;
                    this.loadedCount++;
                    this.updateProgress();
                    resolve(audio);
                }, { once: true });
                
                audio.addEventListener('error', () => {
                    console.warn(`Failed to load sound: ${src}`);
                    this.loadedCount++;
                    this.updateProgress();
                    resolve(null);
                }, { once: true });
                
                audio.load();
            } catch (e) {
                console.warn(`Error loading sound: ${src}`, e);
                this.loadedCount++;
                this.updateProgress();
                resolve(null);
            }
        });
    }

    
    updateProgress() {
        if (this.onProgress) {
            const progress = this.totalAssets > 0 
                ? this.loadedCount / this.totalAssets 
                : 0;
            this.onProgress(progress);
        }

        if (this.loadedCount === this.totalAssets && this.onComplete) {
            this.onComplete();
        }
    }

   
    async loadAll(assets) {
        const promises = [];

        if (assets.images) {
            for (const [key, src] of Object.entries(assets.images)) {
                promises.push(this.loadImage(key, src));
            }
        }

        if (assets.sounds) {
            for (const [key, src] of Object.entries(assets.sounds)) {
                promises.push(this.loadSound(key, src));
            }
        }

        await Promise.all(promises);
        return this;
    }

    getImage(key) {
        return this.images[key] || null;
    }

    
    getSound(key) {
        return this.sounds[key] || null;
    }

    playSound(key) {
        const sound = this.sounds[key];
        if (sound) {
            try {
                sound.currentTime = 0;
                sound.play().catch(e => console.warn('Could not play sound:', e));
            } catch (e) {
                console.warn('Error playing sound:', e);
            }
        }
    }

    isComplete() {
        return this.loadedCount === this.totalAssets && this.totalAssets > 0;
    }

  
    getProgress() {
        return this.totalAssets > 0 ? this.loadedCount / this.totalAssets : 0;
    }
}