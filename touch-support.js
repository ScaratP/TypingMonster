/**
 * 為遊戲添加觸控螢幕支援的實現方案
 */

/**
 * 初始化觸控支援
 */
function initTouchSupport() {
    // 檢測是否是觸控設備
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice) {
      console.log('檢測到觸控設備，啟用觸控模式');
      enableTouchMode();
    }
  }
  
  /**
   * 啟用觸控模式
   */
  function enableTouchMode() {
    // 獲取遊戲容器
    const gameContainer = document.querySelector('.game-container');
    
    // 添加觸控屏幕虛擬鍵盤按鈕
    createVirtualKeyboard();
    
    // 阻止觸控時的縮放和滾動
    gameContainer.addEventListener('touchmove', function(e) {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });
    
    // 調整UI元素大小和間距，使其更適合觸控
    adjustUIForTouch();
  }
  
  /**
   * 創建虛擬鍵盤
   */
  function createVirtualKeyboard() {
    // 創建虛擬鍵盤容器
    const keyboardContainer = document.createElement('div');
    keyboardContainer.className = 'virtual-keyboard';
    keyboardContainer.style.cssText = `
      position: absolute;
      bottom: 120px;
      left: 50%;
      transform: translateX(-50%);
      width: 90%;
      max-width: 600px;
      background-color: rgba(255, 255, 255, 0.85);
      border-radius: 10px;
      padding: 10px;
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
      display: none;
      z-index: 30;
      flex-wrap: wrap;
      justify-content: center;
      gap: 5px;
    `;
    
    // 添加到遊戲容器
    document.querySelector('.game-container').appendChild(keyboardContainer);
    
    // 創建切換鍵盤按鈕
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggle-keyboard-btn';
    toggleBtn.textContent = '顯示虛擬鍵盤';
    toggleBtn.style.cssText = `
      position: absolute;
      bottom: 70px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 30;
      padding: 8px 15px;
      background-color: #4e7ddb;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 14px;
      display: none;
    `;
    
    // 添加切換鍵盤事件
    toggleBtn.addEventListener('click', function() {
      const isVisible = keyboardContainer.style.display === 'flex';
      keyboardContainer.style.display = isVisible ? 'none' : 'flex';
      this.textContent = isVisible ? '顯示虛擬鍵盤' : '隱藏虛擬鍵盤';
      
      // 如果隱藏鍵盤，聚焦到輸入框
      if (isVisible) {
        document.getElementById('typing-input').focus();
      }
    });
    
    // 添加到遊戲容器
    document.querySelector('.game-container').appendChild(toggleBtn);
    
    // 當遊戲開始時顯示按鈕
    const originalShowInputContainer = window.showInputContainer;
    window.showInputContainer = function() {
      originalShowInputContainer();
      toggleBtn.style.display = 'block';
    };
    
    // 當遊戲結束時隱藏按鈕和鍵盤
    const originalHideInputContainer = window.hideInputContainer;
    window.hideInputContainer = function() {
      originalHideInputContainer();
      toggleBtn.style.display = 'none';
      keyboardContainer.style.display = 'none';
    };
    
    // 根據當前主題創建虛擬按鍵
    updateVirtualKeyboard();
  }
  
  /**
   * 更新虛擬鍵盤按鍵
   */
  function updateVirtualKeyboard() {
    const keyboardContainer = document.querySelector('.virtual-keyboard');
    if (!keyboardContainer) return;
    
    // 清空當前按鍵
    keyboardContainer.innerHTML = '';
    
    // 獲取當前文字主題
    const currentTheme = GameConfig.current.textTheme;
    let keys = [];
    
    // 根據主題設置按鍵
    switch (currentTheme) {
      case 'default':
        // 注音符號主題
        keys = ['ㄅ', 'ㄆ', 'ㄇ', 'ㄈ', 'ㄉ', 'ㄊ', 'ㄋ', 'ㄌ', 'ㄍ', 'ㄎ', 'ㄏ', 
                'ㄐ', 'ㄑ', 'ㄒ', 'ㄓ', 'ㄔ', 'ㄕ', 'ㄖ', 'ㄗ', 'ㄘ', 'ㄙ', 
                'ㄧ', 'ㄨ', 'ㄩ', 'ㄚ', 'ㄛ', 'ㄜ', 'ㄝ', 'ㄞ', 'ㄟ', 'ㄠ', 'ㄡ', 
                'ㄢ', 'ㄣ', 'ㄤ', 'ㄥ', 'ㄦ', 'ˊ', 'ˇ', 'ˋ', '˙'];
        break;
      case 'numbers':
        // 數字主題
        keys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        break;
      case 'english':
        // 英文字母主題
        keys = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 
                'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
                'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
                'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        break;
      case 'mixed':
        // 混合主題
        keys = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
                '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        break;
      case 'compound':
        // 複合注音主題
        keys = ['ㄅ', 'ㄆ', 'ㄇ', 'ㄈ', 'ㄉ', 'ㄊ', 'ㄋ', 'ㄌ', 'ㄍ', 'ㄎ', 'ㄏ', 
                'ㄐ', 'ㄑ', 'ㄒ', 'ㄓ', 'ㄔ', 'ㄕ', 'ㄖ', 'ㄗ', 'ㄘ', 'ㄙ', 
                'ㄧ', 'ㄨ', 'ㄩ', 'ㄚ', 'ㄛ', 'ㄜ', 'ㄝ', 'ㄞ', 'ㄟ', 'ㄠ', 'ㄡ', 
                'ㄢ', 'ㄣ', 'ㄤ', 'ㄥ', 'ㄦ', 'ˊ', 'ˇ', 'ˋ', '˙'];
        break;
      default:
        // 默認使用注音符號
        keys = ['ㄅ', 'ㄆ', 'ㄇ', 'ㄈ', 'ㄉ', 'ㄊ', 'ㄋ', 'ㄌ', 'ㄍ', 'ㄎ', 'ㄏ', 
                'ㄐ', 'ㄑ', 'ㄒ', 'ㄓ', 'ㄔ', 'ㄕ', 'ㄖ', 'ㄗ', 'ㄘ', 'ㄙ', 
                'ㄧ', 'ㄨ', 'ㄩ', 'ㄚ', 'ㄛ', 'ㄜ', 'ㄝ', 'ㄞ', 'ㄟ', 'ㄠ', 'ㄡ', 
                'ㄢ', 'ㄣ', 'ㄤ', 'ㄥ', 'ㄦ', 'ˊ', 'ˇ', 'ˋ', '˙'];
    }
    
    // 創建虛擬按鍵
    keys.forEach(key => {
      const keyButton = document.createElement('button');
      keyButton.className = 'virtual-key';
      keyButton.textContent = key;
      keyButton.style.cssText = `
        padding: 10px;
        margin: 3px;
        background-color: #f0f0f0;
        border: 1px solid #ccc;
        border-radius: 5px;
        font-size: 16px;
        min-width: 40px;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        user-select: none;
        -webkit-user-select: none;
      `;
      
      // 添加點擊事件
      keyButton.addEventListener('click', function() {
        const typingInput = document.getElementById('typing-input');
        
        // 模擬按鍵輸入
        typingInput.value = key;
        
        // 觸發輸入事件
        const inputEvent = new Event('input', {bubbles: true});
        typingInput.dispatchEvent(inputEvent);
        
        // 清空輸入框，準備下一次輸入
        setTimeout(() => {
          typingInput.value = '';
        }, 100);
        
        // 顯示按下效果
        this.style.backgroundColor = '#ddd';
        setTimeout(() => {
          this.style.backgroundColor = '#f0f0f0';
        }, 200);
      });
      
      // 添加到鍵盤容器
      keyboardContainer.appendChild(keyButton);
    });
  }
  
  /**
   * 為觸控設備調整UI元素
   */
  function adjustUIForTouch() {
    // 調整按鈕大小
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      if (!button.classList.contains('virtual-key')) {
        button.style.padding = '12px 20px';
        button.style.fontSize = '16px';
      }
    });
    
    // 調整輸入框
    const typingInput = document.getElementById('typing-input');
    if (typingInput) {
      typingInput.style.padding = '15px';
      typingInput.style.fontSize = '20px';
    }
    
    // 添加觸控相關的CSS
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 768px) {
        button {
          min-height: 44px;
          min-width: 44px;
        }
        
        .control-panel {
          gap: 15px;
        }
        
        .setting-item select {
          padding: 12px;
          font-size: 16px;
        }
        
        #typing-input {
          font-size: 20px;
          padding: 15px;
        }
        
        .arrow-hint {
          font-size: 18px;
        }
      }
    `;
    document.head.appendChild(style);
    
    // 移動端隱藏原生鍵盤
    const inputContainer = document.getElementById('input-container');
    if (inputContainer) {
      inputContainer.addEventListener('click', function(e) {
        // 如果點擊的是輸入框，阻止顯示原生鍵盤
        if (e.target === typingInput) {
          e.preventDefault();
          // 顯示虛擬鍵盤
          const keyboardContainer = document.querySelector('.virtual-keyboard');
          if (keyboardContainer) {
            keyboardContainer.style.display = 'flex';
            document.querySelector('.toggle-keyboard-btn').textContent = '隱藏虛擬鍵盤';
          }
        }
      }, { passive: false });
      
      // 阻止輸入框顯示原生鍵盤
      typingInput.addEventListener('focus', function(e) {
        this.blur();
      });
    }
  }
  
  // 當主題變更時更新虛擬鍵盤
  function onThemeChanged() {
    updateVirtualKeyboard();
  }