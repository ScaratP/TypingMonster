/**
 * 遊戲主循環
 */
function gameLoop() {
  requestAnimationFrame(gameLoop);
  
  // 清除畫布
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 檢查遊戲是否已開始
  if (!gameStarted) {
    // 繪製開始畫面
    drawStartScreen(ctx, canvas.width, canvas.height);
    return;
  }
  
  // 如果遊戲暫停，只繪製當前狀態不更新
  if (isPaused) {
    // 繪製遊戲中的狀態資訊
    drawGameStats(ctx, score, GameConfig.current.textTheme, GameConfig.current.level);
    
    // 繪製底部訊息欄
    drawBottomBar(ctx, canvas.width, canvas.height);
    
    // 繪製所有怪獸
    for (let monster of monsters) {
      if (monster.active && monster.r > 0) {
        monster.draw(ctx);
      }
    }
    
    // 在底部顯示"遊戲暫停"
    ctx.font = "30px Arial";
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.textAlign = "center";
    ctx.fillText("遊戲暫停", canvas.width / 2, canvas.height / 2);
    ctx.textAlign = "start";
    
    return;
  }
  
  // 繪製遊戲中的狀態資訊
  drawGameStats(ctx, score, GameConfig.current.textTheme, GameConfig.current.level);
  
  // 繪製底部訊息欄
  drawBottomBar(ctx, canvas.width, canvas.height);
  
  // 更新目標怪獸指針
  targetMonsterIndex = findTargetMonster(monsters);
  
  // 先繪製所有活躍的怪獸
  for (let monster of monsters) {
    if (monster.active && monster.r > 0) {
      monster.draw(ctx);
    }
  }
  
  // 如果有目標怪獸，繪製指向箭頭
  if (targetMonsterIndex !== -1 && monsters[targetMonsterIndex].active) {
    const targetMonster = monsters[targetMonsterIndex];
    
    // 確保這個怪獸是真的有效的目標（有文字需要輸入）
    if (targetMonster.text.length > 0) {
      // 繪製指向箭頭
      drawTargetArrow(ctx, targetMonster.x, targetMonster.y, canvas.width, canvas.height);
      
      // 高亮顯示目標怪獸（繪製一個輪廓）
      ctx.beginPath();
      ctx.arc(targetMonster.x, targetMonster.y, targetMonster.r + 5, 0, 2 * Math.PI);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.lineWidth = 1;
      
      // 在目標怪獸上顯示下一個要輸入的字符提示
      if (targetMonster.text.length > 0) {
        const nextChar = targetMonster.text.charAt(0);
        
        ctx.font = "bold 20px Arial";
        ctx.fillStyle = "red";
        ctx.textAlign = "center";
        ctx.fillText(nextChar, targetMonster.x, targetMonster.y - targetMonster.r - 10);
        ctx.textAlign = "start"; // 重置文字對齊
      }
    }
  }
  
  // 更新所有活躍的怪獸
  for (let monster of monsters) {
    if (monster.active) {
      monster.update();
      
      // 檢查是否碰到底部
      const bottomBarHeight = 50;
      if (monster.y >= canvas.height - bottomBarHeight && monster.r > 0) {
        endGame();
        return;
      }
    }
  }
}