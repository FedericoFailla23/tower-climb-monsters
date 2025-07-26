// Enhanced ui.js with evolution support and proper monster counter

// Add a log message to the game log
function addLog(message) {
    const log = document.getElementById('game-log');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = message;
    log.appendChild(entry);
    
    // Keep only last 50 messages to prevent memory issues
    while (log.children.length > 50) {
        log.removeChild(log.firstChild);
    }
    
    // Auto-scroll to bottom
    log.scrollTop = log.scrollHeight;
}

// Update all UI elements
function updateDisplay() {
    updatePlayerStats();
    updateCollection();
}

// Update player statistics display with evolution-aware counter
function updatePlayerStats() {
    document.getElementById('floor').textContent = game.currentFloor;
    document.getElementById('money').textContent = game.player.money;
    document.getElementById('pokeballs').textContent = game.player.pokeballs;
    
    // Enhanced monster counter with evolution tracking
    const uniqueCaught = getUniqueMonsterschaught();
    const totalAvailable = getTotalAvailableMonsters();
    document.getElementById('caught').textContent = `${uniqueCaught}/${totalAvailable}`;
    
    // Add warning colors for low resources
    const pokeballElement = document.getElementById('pokeballs');
    if (game.player.pokeballs <= 1) {
        pokeballElement.style.color = '#f44336'; // Red
        pokeballElement.style.fontWeight = 'bold';
    } else if (game.player.pokeballs <= 3) {
        pokeballElement.style.color = '#FF9800'; // Orange
        pokeballElement.style.fontWeight = 'bold';
    } else {
        pokeballElement.style.color = 'white'; // Default
        pokeballElement.style.fontWeight = 'bold';
    }
    
    const moneyElement = document.getElementById('money');
    if (game.player.money <= 20) {
        moneyElement.style.color = '#f44336'; // Red
        moneyElement.style.fontWeight = 'bold';
    } else if (game.player.money <= 50) {
        moneyElement.style.color = '#FF9800'; // Orange
        moneyElement.style.fontWeight = 'bold';
    } else {
        moneyElement.style.color = 'white'; // Default
        moneyElement.style.fontWeight = 'bold';
    }
    
    // Color for caught monsters with completion progress
    const caughtElement = document.getElementById('caught');
    const completionRate = uniqueCaught / totalAvailable;
    if (completionRate >= 1.0) {
        caughtElement.style.color = '#ffd700'; // Gold for 100%
    } else if (completionRate >= 0.8) {
        caughtElement.style.color = '#4CAF50'; // Green for 80%+
    } else if (completionRate >= 0.5) {
        caughtElement.style.color = '#2196F3'; // Blue for 50%+
    } else {
        caughtElement.style.color = '#FF9800'; // Orange for less than 50%
    }
    caughtElement.style.fontWeight = 'bold';
}

// Enhanced update collection display with evolution information
function updateCollection() {
    const collection = document.getElementById('monster-collection');
    const countElement = document.getElementById('collection-count');
    
    if (!collection || !countElement) return;
    
    countElement.textContent = game.monsters.length;
    
    if (game.monsters.length === 0) {
        collection.innerHTML = `
            <div class="empty-collection">
                <p style="text-align: center; color: #888; padding: 20px;">
                    Nessun mostro nella squadra...<br>
                    <small>Inizia salendo al Piano 1!</small>
                </p>
            </div>
        `;
        return;
    }

    // Sort monsters by evolution line, then by stage, then by level
    const sortedMonsters = [...game.monsters].sort((a, b) => {
        // First sort by evolution line
        if (a.evolutionLine !== b.evolutionLine) {
            return a.evolutionLine.localeCompare(b.evolutionLine);
        }
        // Then by stage (higher stage first)
        const stageA = a.stage || 1;
        const stageB = b.stage || 1;
        if (stageA !== stageB) return stageB - stageA;
        // Finally by level (highest first)
        const levelA = a.level || 1;
        const levelB = b.level || 1;
        return levelB - levelA;
    });

    collection.innerHTML = '';
    sortedMonsters.forEach((monster, index) => {
        const div = document.createElement('div');
        div.className = 'monster-item';
        div.onclick = () => showMonsterInfoPopup(monster);
        div.style.cursor = 'pointer';
        
        const level = monster.level || 1;
        const hp = Math.max(0, parseInt(monster.hp) || 0);
        const maxHP = parseInt(monster.maxHP) || parseInt(monster.baseHP) || 0;
        const exp = monster.exp || 0;
        const expToNext = monster.expToNext || 50;
        
        // CRITICAL FIX: Ensure maxHP is properly calculated for monsters that don't have it set
        // This happens with older monsters or monsters that weren't properly initialized
        let actualMaxHP = maxHP;
        if (!monster.maxHP && monster.baseHP) {
            // Recalculate maxHP based on level if it's missing
            const levelBonus = level - 1;
            actualMaxHP = parseInt(monster.baseHP) + Math.floor(levelBonus * (parseInt(monster.baseHP) * 0.1));
            // Update the monster object to prevent future issues
            monster.maxHP = actualMaxHP;
        }
        
        // Calculate percentages for visual indicators using the corrected maxHP
        const hpPercentage = actualMaxHP > 0 ? (hp / actualMaxHP) * 100 : 100;
        const expPercentage = expToNext > 0 ? (exp / expToNext) * 100 : 0;
        
        // Determine HP color
        let hpColor = '#4CAF50'; // Green
        if (hpPercentage <= 25) hpColor = '#f44336'; // Red
        else if (hpPercentage <= 50) hpColor = '#FF9800'; // Orange
        else if (hpPercentage <= 75) hpColor = '#FFC107'; // Yellow
        
        // Special styling for KO monsters
        const isKO = hp <= 0;
        const monsterOpacity = isKO ? '0.6' : '1';
        const monsterBorder = isKO ? '2px solid #f44336' : '';
        
        // Evolution indicator
        const stage = monster.stage || 1;
        const stageIndicator = stage === 2 ? '⭐' : '';
        
        div.style.opacity = monsterOpacity;
        div.style.border = monsterBorder;
        
        div.innerHTML = `
            <span class="monster-sprite-small" style="filter: ${isKO ? 'grayscale(100%)' : 'none'};">${monster.sprite}</span>
            <div class="monster-info">
                <div class="monster-header">
                    <strong>${monster.name}</strong> ${stageIndicator}
                    <span class="monster-level">Lv.${level}</span>
                    ${isKO ? '<span style="color: #f44336; font-size: 0.8em; margin-left: 5px;">💀 KO</span>' : ''}
                </div>
                <div class="monster-details">
                    <div class="hp-bar-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${hpPercentage}%; background-color: ${hpColor};"></div>
                        </div>
                    </div>
                    <div class="exp-bar-container">
                        <div class="progress-bar exp-bar">
                            <div class="progress-fill" style="width: ${expPercentage}%; background-color: #2196F3;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        collection.appendChild(div);
    });
}

// Enhanced clear UI function for reset functionality
function clearUI() {
    const encounterArea = document.getElementById('encounter-area');
    if (encounterArea) {
        encounterArea.innerHTML = '';
    }
    
    const gameLog = document.getElementById('game-log');
    if (gameLog) {
        gameLog.innerHTML = `
            <div class="log-entry">🌟 Benvenuto nella Torre dei Mostri!</div>
            <div class="log-entry">🎯 Obiettivo: Sali il più in alto possibile!</div>
            <div class="log-entry">💡 Piano 1: Primo mostro garantito</div>
            <div class="log-entry">🏪 Piano 5,15,25...: Negozi</div>
            <div class="log-entry">👑 Piano 10,20,30...: Boss</div>
            <div class="log-entry">✨ Evoluzioni: Livello 10/15/20 a seconda della rarità!</div>
        `;
    }
    
    // Reset collection display
    const collection = document.getElementById('monster-collection');
    if (collection) {
        collection.innerHTML = `
            <p style="text-align: center; color: #888; padding: 20px;">
                Nessun mostro nella squadra...<br>
                Inizia salendo al Piano 1!
            </p>
        `;
    }
    
    // Reset collection count
    const countElement = document.getElementById('collection-count');
    if (countElement) {
        countElement.textContent = '0';
    }
}

// Show enhanced notification with game over context
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // Set background color based on type
    switch(type) {
        case 'success':
            notification.style.backgroundColor = '#4CAF50';
            break;
        case 'error':
            notification.style.backgroundColor = '#f44336';
            break;
        case 'warning':
            notification.style.backgroundColor = '#FF9800';
            break;
        case 'gameover':
            notification.style.backgroundColor = '#9C27B0';
            notification.style.border = '2px solid #f44336';
            break;
        case 'evolution':
            notification.style.backgroundColor = '#ffd700';
            notification.style.color = '#000';
            break;
        default:
            notification.style.backgroundColor = '#2196F3';
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// Show game over notification with evolution stats
function showGameOverNotification(floor, monstersCount, uniqueCaught, totalAvailable) {
    const completionRate = ((uniqueCaught / totalAvailable) * 100).toFixed(1);
    showNotification(
        `Game Over! Piano ${floor}, ${monstersCount} mostri attivi, ${uniqueCaught}/${totalAvailable} specie scoperte (${completionRate}%)`, 
        'gameover', 
        6000
    );
}

// Show monster info popup with detailed information
function showMonsterInfoPopup(monster) {
    const level = monster.level || 1;
    const hp = Math.max(0, parseInt(monster.hp) || 0);
    const maxHP = parseInt(monster.maxHP) || parseInt(monster.baseHP) || 0;
    const exp = monster.exp || 0;
    const expToNext = monster.expToNext || 50;
    const attack = parseInt(monster.attack) || parseInt(monster.baseAttack) || 20;
    const defense = parseInt(monster.defense) || parseInt(monster.baseDefense) || 15;
    const stage = monster.stage || 1;
    
    // Calculate percentages
    const hpPercentage = maxHP > 0 ? (hp / maxHP) * 100 : 100;
    const expPercentage = expToNext > 0 ? (exp / expToNext) * 100 : 0;
    
    // Determine HP color
    let hpColor = '#4CAF50'; // Green
    if (hpPercentage <= 25) hpColor = '#f44336'; // Red
    else if (hpPercentage <= 50) hpColor = '#FF9800'; // Orange
    else if (hpPercentage <= 75) hpColor = '#FFC107'; // Yellow
    
    // Rarity color
    let rarityColor = '#888';
    switch(monster.rarity) {
        case 'Comune': rarityColor = '#4CAF50'; break;
        case 'Non Comune': rarityColor = '#2196F3'; break;
        case 'Raro': rarityColor = '#9C27B0'; break;
        case 'Leggendario': rarityColor = '#FF9800'; break;
    }
    
    // Stage information
    let stageInfo = '';
    if (canEvolve(monster)) {
        stageInfo = `Stage ${stage} (può evolversi)`;
    } else if (monster.evolutionName) {
        stageInfo = `Stage ${stage} (può evolversi in ${monster.evolutionName})`;
    } else {
        stageInfo = 'Stage finale (non può evolversi)';
    }
    
    // Evolution info
    const evolutionInfo = canEvolve(monster) ? 
        `<p style="color: #ffd700; font-size: 0.9em;">🔄 Può evolversi al livello ${monster.evolutionLevel}!</p>` : '';
    
    // Create popup
    const popup = document.createElement('div');
    popup.id = 'monster-info-popup';
    popup.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease-in;
    `;
    
    popup.innerHTML = `
        <div style="
            background: linear-gradient(135deg, rgba(50, 50, 50, 0.95), rgba(30, 30, 30, 0.95));
            border: 2px solid ${rarityColor};
            border-radius: 15px;
            padding: 25px;
            max-width: 500px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            animation: scaleIn 0.3s ease-out;
        ">
            <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 20px;">
                <span style="font-size: 3em;">${monster.sprite}</span>
                <div style="text-align: left;">
                    <h3 style="color: white; margin: 0;">${monster.name}</h3>
                    <p style="color: ${rarityColor}; margin: 5px 0;">${monster.rarity} - ${stageInfo}</p>
                    <p style="color: #ffd700; margin: 0;">Lv.${level}</p>
                </div>
            </div>
            
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; margin: 15px 0;">
                <h4 style="color: #4CAF50; margin-bottom: 10px;">❤️ HP</h4>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <div style="flex: 1; background: rgba(255,255,255,0.2); height: 8px; border-radius: 4px; overflow: hidden;">
                        <div style="width: ${hpPercentage}%; height: 100%; background-color: ${hpColor};"></div>
                    </div>
                    <span style="color: white; font-size: 0.9em;">${hp}/${maxHP}</span>
                </div>
                
                <h4 style="color: #2196F3; margin-bottom: 10px;">🌟 EXP</h4>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                    <div style="flex: 1; background: rgba(255,255,255,0.2); height: 8px; border-radius: 4px; overflow: hidden;">
                        <div style="width: ${expPercentage}%; height: 100%; background-color: #2196F3;"></div>
                    </div>
                    <span style="color: white; font-size: 0.9em;">${exp}/${expToNext}</span>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; text-align: center;">
                    <div>
                        <strong style="color: #f44336;">⚔️ ATK</strong><br>
                        <span style="font-size: 1.2em; color: white;">${attack}</span>
                    </div>
                    <div>
                        <strong style="color: #2196F3;">🛡️ DEF</strong><br>
                        <span style="font-size: 1.2em; color: white;">${defense}</span>
                    </div>
                </div>
            </div>
            
            ${evolutionInfo}
            
            <p style="color: #ccc; font-size: 0.9em; margin: 15px 0;">
                Catturato: ${new Date(monster.captureDate).toLocaleDateString()}
            </p>
            
            <button onclick="closeMonsterInfoPopup()" 
                    style="
                        background: linear-gradient(45deg, #4CAF50, #2E7D32);
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        color: white;
                        font-weight: bold;
                        cursor: pointer;
                        font-size: 1.1em;
                    ">
                ✨ Chiudi
            </button>
        </div>
    `;
    
    // Add CSS animations if not already present
    if (!document.getElementById('monster-popup-styles')) {
        const style = document.createElement('style');
        style.id = 'monster-popup-styles';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes scaleIn {
                from { transform: scale(0.8); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(popup);
    
    // Close on background click
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            closeMonsterInfoPopup();
        }
    });
}

// Close monster info popup
function closeMonsterInfoPopup() {
    const popup = document.getElementById('monster-info-popup');
    if (popup) {
        popup.style.animation = 'fadeIn 0.3s ease-in reverse';
        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 300);
    }
}