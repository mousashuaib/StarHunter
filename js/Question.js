// Question.js - Math Question Generator
// كلاس خاص باللعبة (Game-specific)

class Question {
    constructor(level = 1) {
        this.level = level;
        this.operation = this.selectOperation();
        this.num1 = 0;
        this.num2 = 0;
        this.correctAnswer = 0;
        this.wrongAnswers = [];
        this.allAnswers = [];
        
        this.generate();
    }

    /**
     * اختيار نوع العملية بناءً على المستوى
     */
    selectOperation() {
        if (this.level <= 3) {
            // المستويات 1-3: جمع فقط
            return 'add';
        } else if (this.level <= 6) {
            // المستويات 4-6: جمع وطرح
            return Math.random() < 0.5 ? 'add' : 'subtract';
        } else if (this.level <= 9) {
            // المستويات 7-9: جمع وطرح وضرب
            const rand = Math.random();
            if (rand < 0.4) return 'add';
            if (rand < 0.7) return 'subtract';
            return 'multiply';
        } else {
            // المستوى 10+: جميع العمليات
            const rand = Math.random();
            if (rand < 0.3) return 'add';
            if (rand < 0.5) return 'subtract';
            if (rand < 0.8) return 'multiply';
            return 'divide';
        }
    }

    /**
     * توليد السؤال
     */
    generate() {
        // نطاق الأرقام بناءً على المستوى
        const range = this.getNumberRange();
        
        switch (this.operation) {
            case 'add':
                this.generateAddition(range);
                break;
            case 'subtract':
                this.generateSubtraction(range);
                break;
            case 'multiply':
                this.generateMultiplication(range);
                break;
            case 'divide':
                this.generateDivision(range);
                break;
        }

        // توليد إجابات خاطئة
        this.generateWrongAnswers();
        
        // خلط الإجابات
        this.shuffleAnswers();
    }

    /**
     * الحصول على نطاق الأرقام بناءً على المستوى
     */
    getNumberRange() {
        if (this.level <= 2) return { min: 1, max: 10 };
        if (this.level <= 4) return { min: 1, max: 20 };
        if (this.level <= 6) return { min: 5, max: 30 };
        if (this.level <= 8) return { min: 10, max: 50 };
        return { min: 10, max: 100 };
    }

    /**
     * توليد سؤال جمع
     */
    generateAddition(range) {
        this.num1 = this.randomInt(range.min, range.max);
        this.num2 = this.randomInt(range.min, range.max);
        this.correctAnswer = this.num1 + this.num2;
    }

    /**
     * توليد سؤال طرح
     */
    generateSubtraction(range) {
        this.num1 = this.randomInt(range.min, range.max);
        this.num2 = this.randomInt(range.min, this.num1); // تجنب النتائج السالبة
        this.correctAnswer = this.num1 - this.num2;
    }

    /**
     * توليد سؤال ضرب
     */
    generateMultiplication(range) {
        // أرقام أصغر للضرب
        const multiplyRange = Math.ceil(range.max / 3);
        this.num1 = this.randomInt(2, multiplyRange);
        this.num2 = this.randomInt(2, multiplyRange);
        this.correctAnswer = this.num1 * this.num2;
    }

    /**
     * توليد سؤال قسمة
     */
    generateDivision(range) {
        // توليد قسمة صحيحة (بدون كسور)
        this.num2 = this.randomInt(2, 12); // المقسوم عليه
        const quotient = this.randomInt(2, Math.ceil(range.max / this.num2));
        this.num1 = this.num2 * quotient; // المقسوم
        this.correctAnswer = quotient;
    }

    /**
     * توليد إجابات خاطئة
     */
    generateWrongAnswers() {
        this.wrongAnswers = [];
        const used = new Set([this.correctAnswer]);
        
        // نحتاج 3 إجابات خاطئة
        while (this.wrongAnswers.length < 3) {
            let wrong;
            
            // توليد إجابة خاطئة قريبة من الصحيحة
            const offset = this.randomInt(1, Math.max(5, Math.ceil(this.correctAnswer * 0.3)));
            if (Math.random() < 0.5) {
                wrong = this.correctAnswer + offset;
            } else {
                wrong = this.correctAnswer - offset;
            }
            
            // التأكد من أن الإجابة موجبة وغير مكررة
            if (wrong > 0 && !used.has(wrong)) {
                this.wrongAnswers.push(wrong);
                used.add(wrong);
            }
        }
    }

    /**
     * خلط الإجابات
     */
    shuffleAnswers() {
        this.allAnswers = [
            this.correctAnswer,
            ...this.wrongAnswers
        ];
        
        // خلط عشوائي
        for (let i = this.allAnswers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.allAnswers[i], this.allAnswers[j]] = [this.allAnswers[j], this.allAnswers[i]];
        }
    }

    /**
     * الحصول على نص السؤال
     */
    getQuestionText() {
        let symbol;
        switch (this.operation) {
            case 'add': symbol = '+'; break;
            case 'subtract': symbol = '-'; break;
            case 'multiply': symbol = '×'; break;
            case 'divide': symbol = '÷'; break;
        }
        
        return `${this.num1} ${symbol} ${this.num2} = ?`;
    }

    /**
     * التحقق من الإجابة
     */
    checkAnswer(answer) {
        return answer === this.correctAnswer;
    }

    /**
     * هل هذا سؤال ذهبي (صعب)؟
     */
    isGolden() {
        // تم إلغاء النجوم الذهبية - جميع النجوم عادية الآن
        return false;
    }

    /**
     * الحصول على النقاط للسؤال
     */
    getPoints() {
        // جميع الإجابات الصحيحة = 10 نقاط
        return 10;
    }

    /**
     * رقم عشوائي ضمن نطاق
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * وصف المستوى
     */
    static getLevelDescription(level) {
        if (level <= 3) return 'Easy - Addition';
        if (level <= 6) return 'Medium - Add & Subtract';
        if (level <= 9) return 'Hard - Multiply';
        return 'Expert - All Operations';
    }

    /**
     * الحصول على لون المستوى
     */
    static getLevelColor(level) {
        if (level <= 3) return '#4CAF50'; // أخضر
        if (level <= 6) return '#FF9800'; // برتقالي
        if (level <= 9) return '#F44336'; // أحمر
        return '#9C27B0'; // بنفسجي
    }
}


// ====== Question Manager ======
// إدارة الأسئلة والمستويات

class QuestionManager {
    constructor() {
        this.currentQuestion = null;
        this.level = 1;
        this.correctStreak = 0; // عدد الإجابات الصحيحة المتتالية
        this.totalCorrect = 0;
        this.totalWrong = 0;
    }

    /**
     * توليد سؤال جديد
     */
    generateNewQuestion() {
        this.currentQuestion = new Question(this.level);
        return this.currentQuestion;
    }

    /**
     * التحقق من الإجابة وتحديث الإحصائيات
     */
    submitAnswer(answer) {
        const isCorrect = this.currentQuestion.checkAnswer(answer);
        
        if (isCorrect) {
            this.totalCorrect++;
            this.correctStreak++;
            
            // زيادة المستوى كل 3 إجابات صحيحة
            if (this.correctStreak >= 3 && this.level < 12) {
                this.level++;
                this.correctStreak = 0;
            }
        } else {
            this.totalWrong++;
            this.correctStreak = 0;
        }
        
        return {
            isCorrect: isCorrect,
            correctAnswer: this.currentQuestion.correctAnswer,
            points: isCorrect ? this.currentQuestion.getPoints() : 0
        };
    }

    /**
     * إعادة تعيين
     */
    reset() {
        this.level = 1;
        this.correctStreak = 0;
        this.totalCorrect = 0;
        this.totalWrong = 0;
        this.currentQuestion = null;
    }

    /**
     * الحصول على الإحصائيات
     */
    getStats() {
        const total = this.totalCorrect + this.totalWrong;
        const accuracy = total > 0 ? Math.round((this.totalCorrect / total) * 100) : 0;
        
        return {
            level: this.level,
            correctStreak: this.correctStreak,
            totalCorrect: this.totalCorrect,
            totalWrong: this.totalWrong,
            accuracy: accuracy
        };
    }
}