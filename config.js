
/**
 * config.js - 遊戲配置與主題設定
 * 包含遊戲中所有可配置的選項，如文字主題、怪獸外觀、遊戲難度等
 */



// 遊戲配置物件
const GameConfig = {
    // 文字主題
    // 在 config.js 中的 textThemes 物件中添加以下內容

    textThemes: {
      default: ["ㄚ", "ㄧ", "ㄨ", "ㄩ", "ㄛ", "ㄜ", "ㄝ", "ㄞ", "ㄟ", "ㄠ", "ㄡ", "ㄢ", "ㄣ", "ㄤ", "ㄥ", "ㄦ", "ㄕ", "ㄖ", "ㄗ", "ㄘ", "ㄙ"],
      numbers: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
      english: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
      mixed: ["a1", "b2", "c3", "d4", "e5", "f6", "g7", "h8", "i9", "j0"],
      // 新增複合注音主題
      compound: ["ㄉㄚˇ", "ㄗˋ", "ㄅㄚ", "ㄘㄜˋ", "ㄇㄚˇ", "ㄇㄚ", "ㄉㄨㄥ", "ㄒㄧㄚˋ", "ㄒㄩㄝˊ", "ㄆㄧㄣˋ", "ㄧㄣ", "ㄉㄚˇㄗˋ"]
    },
  
    // 怪獸外觀設定
    monsters: {
      defaultColor: "#4F4F8F", // 預設顏色
      defaultSize: 30, // 預設大小
      
      // 怪獸圖片 (可以增加更多)
      images: ["Monster256.png"],
      
      // 各關卡怪獸設定
      levels: {
        1: {
          speed: 0.5,   // 基礎速度
          count: 8,     // 怪獸數量
          size: 30      // 怪獸大小
        },
        2: {
          speed: 0.7,
          count: 12,
          size: 25
        },
        3: {
          speed: 1.0,
          count: 15,
          size: 20
        }
      }
    },
    
    // 難度設定
    difficulty: {
      easy: {
        speedMultiplier: 0.7,
        scoreFactor: 0.8,
        difficultyIncrease: 0.1  // 每次難度增加乘數
      },
      normal: {
        speedMultiplier: 1.0,
        scoreFactor: 1.0,
        difficultyIncrease: 0.15
      },
      hard: {
        speedMultiplier: 1.3,
        scoreFactor: 1.2,
        difficultyIncrease: 0.2
      }
    },
    
    // 底部訊息欄主題
    bottomBar: {
      color: "#8B4513",
      textColor: "white",
      fontSize: "24px",
      fontFamily: "Arial"
    },
    
    // 遊戲初始設定
    game: {
      updateInterval: 16,    // 遊戲更新頻率 (毫秒)
      difficultyIncreaseTime: 30000,  // 難度提升間隔 (毫秒)
      cleanupInterval: 5000, // 清理無效怪獸間隔 (毫秒)
      safeZoneTop: 60,      // 頂部安全區域
      safeZoneBottom: 120   // 底部安全區域
    },

    // 在 GameConfig 中添加
    stats: {
      typingSpeed: 0,          // 當前打字速度 (字符/分鐘)
      totalCharsTyped: 0,      // 總共輸入的字符數
      startTime: 0,            // 遊戲開始時間
      lastUpdateTime: 0,       // 上次更新速度的時間
      updateInterval: 2000     // 更新速度的間隔 (毫秒)
    },

    // 也添加相關方法
    resetTypingStats() {
      this.stats.typingSpeed = 0;
      this.stats.totalCharsTyped = 0;
      this.stats.startTime = Date.now();
      this.stats.lastUpdateTime = Date.now();
    },

    updateTypingSpeed() {
      const now = Date.now();
      const elapsedMinutes = (now - this.stats.startTime) / 60000; // 轉換為分鐘
      
      if (elapsedMinutes > 0) {
        this.stats.typingSpeed = Math.round(this.stats.totalCharsTyped / elapsedMinutes);
      }
      
      this.stats.lastUpdateTime = now;
    },
    
    // 當前配置狀態
    current: {
      textTheme: "default",
      level: 1,
      difficulty: "normal"
    },
    
    // 設置當前文字主題
    setTextTheme(themeName) {
      if (this.textThemes[themeName]) {
        this.current.textTheme = themeName;
        console.log(`主題已設置為: ${themeName}`);
        return true;
      } else {
        console.error(`文字主題 ${themeName} 不存在`);
        return false;
      }
    },
    
    // 設置當前遊戲難度
    setDifficulty(difficultyName) {
      if (this.difficulty[difficultyName]) {
        this.current.difficulty = difficultyName;
        console.log(`難度已設置為: ${difficultyName}`);
        return true;
      } else {
        console.error(`難度選項 ${difficultyName} 不存在`);
        return false;
      }
    },
    
    // 設置當前遊戲關卡
    setLevel(level) {
      const levelNum = parseInt(level);
      if (this.monsters.levels[levelNum]) {
        this.current.level = levelNum;
        console.log(`關卡已設置為: ${levelNum}`);
        return true;
      } else {
        console.error(`關卡 ${levelNum} 不存在`);
        return false;
      }
    },
    
    // 獲取當前文字主題
    getCurrentTextTheme() {
      return this.textThemes[this.current.textTheme];
    },
    
    // 獲取當前難度設定
    getCurrentDifficulty() {
      return this.difficulty[this.current.difficulty];
    },
    
    // 獲取當前關卡設定
    getCurrentLevel() {
      return this.monsters.levels[this.current.level];
    },
    
    // 獲取調整後的遊戲速度
    getGameSpeed() {
      const baseSpeed = this.getCurrentLevel().speed;
      const difficultyMultiplier = this.getCurrentDifficulty().speedMultiplier;
      return baseSpeed * difficultyMultiplier;
    },
    
    // 獲取分數係數
    getScoreFactor() {
      return this.getCurrentDifficulty().scoreFactor;
    },
    
    // 獲取難度增加因子
    getDifficultyIncreaseFactor() {
      return this.getCurrentDifficulty().difficultyIncrease;
    }
  };