// themes.js - 遊戲主題配置檔案

// 導出主題配置物件
const ThemeConfig = {
    // 文字主題
    textThemes: {
      default: ["ㄅ", "ㄆ", "ㄇ", "ㄈ", "ㄉ", "ㄊ", "ㄋ", "ㄌ", "ㄍ", "ㄎ", "ㄏ", "ㄐ", "ㄑ", "ㄒ", "ㄓ", "ㄔ", "ㄕ", "ㄖ", "ㄗ", "ㄘ", "ㄙ"],
      numbers: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
      english: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
      mixed: ["a1", "b2", "c3", "d4", "e5", "f6", "g7", "h8", "i9", "j0"]
    },
    
    // 額外的輸入映射（針對難以輸入的字符）
    inputMapping: {
      // 已移除ㄧㄨㄩ的映射
    },
    
    // 怪獸顏色（預設顏色，現在只保留一種）
    monsterColor: "#4F4F8F", // 深紫色，可以根據需要調整
    
    // 圖片主題（圖片檔名，不包括路徑）
    imageThemes: {
      monsters: ["Monster256.png"]
    },
    
    // 底部欄主題
    bottomBarTheme: {
      color: "#8B4513",
      textColor: "white",
      fontSize: "24px",
      fontFamily: "Arial"
    },
    
    // 當前主題設置
    current: {
      textTheme: "default"
    },
    
    // 獲取當前文字主題
    getCurrentTextTheme() {
      return this.textThemes[this.current.textTheme];
    },
    
    // 獲取怪獸顏色
    getMonsterColor() {
      return this.monsterColor;
    },
    
    // 獲取當前圖片主題
    getCurrentImageTheme() {
      return this.imageThemes.monsters;
    },
    
    // 獲取當前底部欄主題
    getCurrentBottomBarTheme() {
      return this.bottomBarTheme;
    },
    
    // 設置當前文字主題
    setTextTheme(themeName) {
      try {
        if (this.textThemes[themeName]) {
          this.current.textTheme = themeName;
          console.log(`主題已設置為: ${themeName}`);
        } else {
          console.error(`文字主題 ${themeName} 不存在`);
        }
      } catch (error) {
        console.error(`設置主題時發生錯誤: ${error.message}`);
      }
    },
    
    // 新增獲取怪獸屬性的方法
    getMonsterSize() {
      return 30; // 預設怪獸大小
    },
    
    // 獲取怪獸速度
    getMonsterSpeed() {
      return 0.5; // 預設怪獸速度
    }
  };
  
  // 如果在瀏覽器環境中使用
  if (typeof window !== 'undefined') {
    window.ThemeConfig = ThemeConfig;
  }
  
  // 如果在Node.js環境中使用
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeConfig;
  }