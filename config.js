/**
 * config.js - 遊戲配置與主題設定
 * 包含遊戲中所有可配置的選項，如文字主題、怪獸外觀、遊戲關卡等
 */

// 遊戲配置物件
const GameConfig = {
  // 文字主題
  textThemes: {
    default: ["ㄚ", "ㄧ", "ㄨ", "ㄩ", "ㄛ", "ㄜ", "ㄝ", "ㄞ", "ㄟ", "ㄠ", "ㄡ", "ㄢ", "ㄣ", "ㄤ", "ㄥ", "ㄦ", "ㄕ", "ㄖ", "ㄗ", "ㄘ", "ㄙ"],
    numbers: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    english: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
    mixed: ["a1", "b2", "c3", "d4", "e5", "f6", "g7", "h8", "i9", "j0"],
    // 複合注音主題
    compound: ["ㄉㄚˇ", "ㄗˋ", "ㄅㄚ", "ㄘㄜˋ", "ㄇㄚˇ", "ㄇㄚ", "ㄉㄨㄥ", "ㄒㄧㄚˋ", "ㄒㄩㄝˊ", "ㄆㄧㄣˋ", "ㄧㄣ", "ㄉㄚˇㄗˋ"]
  },

  // 怪獸外觀設定
  monsters: {
    defaultColor: "#4F4F8F", // 預設顏色
    defaultSize: 30, // 預設大小
    
    // 怪獸圖片 (可以增加更多)
    images: ["Monster256.png"],
    
    // 關卡設定 (整合了原本的難度設定)
    levels: {
      1: { // 入門
        speed: 0.35,   // 速度
        count: 6,      // 怪獸數量
        size: 35,      // 怪獸大小
        scoreFactor: 0.8, // 分數係數
        difficultyIncrease: 0.1 // 難度增加幅度
      },
      2: { // 基礎
        speed: 0.7,
        count: 10,
        size: 30,
        scoreFactor: 1.0,
        difficultyIncrease: 0.15
      },
      3: { // 進階
        speed: 1.0,
        count: 12,
        size: 25,
        scoreFactor: 1.0,
        difficultyIncrease: 0.15
      },
      4: { // 專家
        speed: 1.3,
        count: 15,
        size: 20,
        scoreFactor: 1.2,
        difficultyIncrease: 0.2
      },
      5: { // 大師
        speed: 1.5,
        count: 20,
        size: 15,
        scoreFactor: 1.5,
        difficultyIncrease: 0.25
      }
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

  // 打字速度統計
  stats: {
    typingSpeed: 0,          // 當前打字速度 (字符/分鐘)
    totalCharsTyped: 0,      // 總共輸入的字符數
    startTime: 0,            // 遊戲開始時間
    lastUpdateTime: 0,       // 上次更新速度的時間
    updateInterval: 2000     // 更新速度的間隔 (毫秒)
  },

  // 重置打字速度統計
  resetTypingStats() {
    this.stats.typingSpeed = 0;
    this.stats.totalCharsTyped = 0;
    this.stats.startTime = Date.now();
    this.stats.lastUpdateTime = Date.now();
  },

  // 更新打字速度
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
  
  // 獲取當前關卡設定
  getCurrentLevel() {
    return this.monsters.levels[this.current.level];
  },
  
  // 獲取當前遊戲速度
  getGameSpeed() {
    return this.getCurrentLevel().speed;
  },
  
  // 獲取分數係數
  getScoreFactor() {
    return this.getCurrentLevel().scoreFactor;
  },
  
  // 獲取難度增加因子
  getDifficultyIncreaseFactor() {
    return this.getCurrentLevel().difficultyIncrease;
  }
};