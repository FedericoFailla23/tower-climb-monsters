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
        
        // Rarity color
        let rarityColor = '#888';
        switch(monster.rarity) {
            case 'Comune': rarityColor = '#4CAF50'; break;
            case 'Non Comune': rarityColor = '#2196F3'; break;
            case 'Raro': rarityColor = '#9C27B0'; break;
            case 'Leggendario': rarityColor = '#FF9800'; break;
        }
        
        // Evolution indicator
        const stage = monster.stage || 1;
        const stageIndicator = stage === 2 ? '⭐' : '';
        const evolutionInfo = canEvolve(monster) ? 
            `<span style="color: #ffd700; font-size: 0.8em; margin-left: 5px;">🔄 Può evolversi!</span>` : '';
        
        div.style.opacity = monsterOpacity;
        div.style.border = monsterBorder;
        
        div.innerHTML = `
            <span class="monster-sprite-small" style="filter: ${isKO ? 'grayscale(100%)' : 'none'};">${monster.sprite}</span>
            <div class="monster-info">
                <div class="monster-header">
                    <strong>${monster.name}</strong> ${stageIndicator}
                    <span class="monster-level">Lv.${level}</span>
                    ${isKO ? '<span style="color: #f44336; font-size: 0.8em; margin-left: 5px;">💀 KO</span>' : ''}
                    ${evolutionInfo}
                </div>
                <div class="monster-details">
                    <small style="color: ${rarityColor};">${monster.rarity}${stage === 2 ? ' (Evoluto)' : ''}</small>
                    <div class="hp-bar-container">
                        <span class="hp-text">HP: ${hp}/${actualMaxHP}</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${hpPercentage}%; background-color: ${hpColor};"></div>
                        </div>
                    </div>
                    <div class="exp-bar-container">
                        <span class="exp-text">EXP: ${exp}/${expToNext}</span>
                        <div class="progress-bar exp-bar">
                            <div class="progress-fill" style="width: ${expPercentage}%; background-color: #2196F3;"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="monster-actions">
                ${hp <= 0 ? '<span class="status-indicator defeated">💀</span>' : 
                  hp < maxHP ? '<span class="status-indicator injured">🩹</span>' : 
                  '<span class="status-indicator healthy">💚</span>'}
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

// Show evolution notification
function showEvolutionNotification(oldName, newName) {
    showNotification(`✨ ${oldName} si è evoluto in ${newName}!`, 'evolution', 4000);
}

// Animate stat changes (enhanced for reset scenarios)
function animateStatChange(elementId, newValue, oldValue = null) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Special animation for reset
    if (oldValue !== null && newValue < oldValue) {
        element.style.color = '#f44336'; // Red for decrease
    } else if (oldValue !== null && newValue > oldValue) {
        element.style.color = '#4CAF50'; // Green for increase
    }
    
    // Simple pulse animation for changes
    element.style.transform = 'scale(1.1)';
    element.style.transition = 'transform 0.2s ease, color 0.5s ease';
    
    setTimeout(() => {
        element.textContent = newValue;
        element.style.transform = 'scale(1)';
    }, 100);
    
    // Reset color after animation
    setTimeout(() => {
        element.style.color = ''; // Reset to default
    }, 1500);
}

// Format numbers with separators for large values
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Show monster status summary (useful for battle preparation)
function showMonsterStatusSummary() {
    const healthyCount = game.monsters.filter(m => m.hp === m.maxHP).length;
    const injuredCount = game.monsters.filter(m => m.hp > 0 && m.hp < m.maxHP).length;
    const koCount = game.monsters.filter(m => m.hp <= 0).length;
    
    if (game.monsters.length === 0) return;
    
    let statusMessage = `Squadra: `;
    if (healthyCount > 0) statusMessage += `${healthyCount} 💚 `;
    if (injuredCount > 0) statusMessage += `${injuredCount} 🩹 `;
    if (koCount > 0) statusMessage += `${koCount} 💀`;
    
    addLog(`📊 ${statusMessage}`);
}

// Show detailed evolution information in shop
function showEvolutionGuide() {
    const evolutionLines = {};
    
    // Group monsters by evolution line
    monsterData.forEach(monster => {
        if (!evolutionLines[monster.evolutionLine]) {
            evolutionLines[monster.evolutionLine] = [];
        }
        evolutionLines[monster.evolutionLine].push(monster);
    });
    
    let evolutionHtml = '';
    Object.keys(evolutionLines).forEach(line => {
        const monsters = evolutionLines[line].sort((a, b) => (a.stage || 1) - (b.stage || 1));
        
        if (monsters.length > 1) {
            evolutionHtml += `
                <div style="margin: 15px 0; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        ${monsters.map((monster, index) => `
                            <div style="text-align: center;">
                                <span style="font-size: 2em;">${monster.sprite}</span>
                                <p style="font-size: 0.9em; margin: 5px 0;">${monster.name}</p>
                                <small style="color: #ccc;">
                                    ${monster.stage === 1 && monster.evolutionLevel ? 
                                        `Evolve Lv.${monster.evolutionLevel}` : 
                                        monster.stage === 2 ? 'Evoluto' : 'Finale'}
                                </small>
                            </div>
                            ${index < monsters.length - 1 ? '<span style="font-size: 1.5em; color: #ffd700;">➡️</span>' : ''}
                        `).join('')}
                    </div>
                </div>
            `;
        }
    });
    
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter">
            <h3 style="color: #ffd700;">✨ Guida alle Evoluzioni</h3>
            <span class="monster-sprite">📚</span>
            
            <div style="margin: 20px 0; padding: 15px; background: rgba(255, 215, 0, 0.1); border-radius: 8px;">
                <h4 style="color: #ffd700; margin-bottom: 10px;">🔄 Come Funzionano le Evoluzioni</h4>
                <p style="font-size: 0.9em; line-height: 1.4; color: #ccc;">
                    • I mostri evolvono automaticamente raggiungendo certi livelli<br>
                    • <strong>Comuni:</strong> Evolvono al livello 10<br>
                    • <strong>Non Comuni:</strong> Evolvono al livello 15<br>
                    • <strong>Rari:</strong> Evolvono al livello 20<br>
                    • Le fusioni funzionano su tutta la linea evolutiva<br>
                    • Dopo il piano 20 puoi trovare forme evolute in natura
                </p>
            </div>
            
            <div style="max-height: 300px; overflow-y: auto;">
                <h4 style="color: #2196F3; margin-bottom: 15px;">🔗 Linee Evolutive</h4>
                ${evolutionHtml}
            </div>
            
            <div class="buttons">
                <button onclick="spawnShop()">↩️ Torna al Negozio</button>
            </div>
        </div>
    `;
    
    addLog(`✨ Guida alle evoluzioni visualizzata!`);
}

// Show loading state during async operations
function showLoading(show = true) {
    // Function kept for compatibility - not currently used
}