// Enhanced monster database with evolution system
const monsterData = [
    // Stage 1 monsters
    { 
        name: "Fiammella", 
        sprite: "🔥", 
        rarity: "Comune", 
        catchRate: 75, 
        expValue: 30, 
        baseHP: 45, 
        baseAttack: 35, 
        baseDefense: 25,
        stage: 1,
        evolutionLevel: 10,
        evolutionName: "Inferno",
        evolutionLine: "fire"
    },
    { 
        name: "Gocciolina", 
        sprite: "💧", 
        rarity: "Comune", 
        catchRate: 75, 
        expValue: 30, 
        baseHP: 50, 
        baseAttack: 30, 
        baseDefense: 30,
        stage: 1,
        evolutionLevel: 10,
        evolutionName: "Maremoto",
        evolutionLine: "water"
    },
    { 
        name: "Fogliolino", 
        sprite: "🌿", 
        rarity: "Comune", 
        catchRate: 75, 
        expValue: 30, 
        baseHP: 55, 
        baseAttack: 25, 
        baseDefense: 35,
        stage: 1,
        evolutionLevel: 10,
        evolutionName: "Foresta",
        evolutionLine: "grass"
    },
    { 
        name: "Sassetto", 
        sprite: "🗿", 
        rarity: "Non Comune", 
        catchRate: 55, 
        expValue: 60, 
        baseHP: 60, 
        baseAttack: 40, 
        baseDefense: 45,
        stage: 1,
        evolutionLevel: 15,
        evolutionName: "Montagna",
        evolutionLine: "rock"
    },
    { 
        name: "Scintilla", 
        sprite: "⚡", 
        rarity: "Non Comune", 
        catchRate: 55, 
        expValue: 60, 
        baseHP: 55, 
        baseAttack: 50, 
        baseDefense: 30,
        stage: 1,
        evolutionLevel: 15,
        evolutionName: "Tempesta",
        evolutionLine: "electric"
    },
    { 
        name: "Cristallo", 
        sprite: "❄️", 
        rarity: "Non Comune", 
        catchRate: 55, 
        expValue: 60, 
        baseHP: 60, 
        baseAttack: 45, 
        baseDefense: 40,
        stage: 1,
        evolutionLevel: 15,
        evolutionName: "Blizzard",
        evolutionLine: "ice"
    },
    { 
        name: "Fantasma", 
        sprite: "👻", 
        rarity: "Raro", 
        catchRate: 35, 
        expValue: 120, 
        baseHP: 70, 
        baseAttack: 60, 
        baseDefense: 35,
        stage: 1,
        evolutionLevel: 20,
        evolutionName: "Spettro",
        evolutionLine: "ghost"
    },
    
    // Stage 2 monsters (evolutions)
    { 
        name: "Inferno", 
        sprite: "🌋", 
        rarity: "Non Comune", 
        catchRate: 45, 
        expValue: 80, 
        baseHP: 65, 
        baseAttack: 55, 
        baseDefense: 35,
        stage: 2,
        evolutionLine: "fire",
        preEvolution: "Fiammella"
    },
    { 
        name: "Maremoto", 
        sprite: "🌊", 
        rarity: "Non Comune", 
        catchRate: 45, 
        expValue: 80, 
        baseHP: 75, 
        baseAttack: 50, 
        baseDefense: 45,
        stage: 2,
        evolutionLine: "water",
        preEvolution: "Gocciolina"
    },
    { 
        name: "Foresta", 
        sprite: "🌳", 
        rarity: "Non Comune", 
        catchRate: 45, 
        expValue: 80, 
        baseHP: 80, 
        baseAttack: 40, 
        baseDefense: 55,
        stage: 2,
        evolutionLine: "grass",
        preEvolution: "Fogliolino"
    },
    { 
        name: "Montagna", 
        sprite: "🏔️", 
        rarity: "Raro", 
        catchRate: 25, 
        expValue: 150, 
        baseHP: 95, 
        baseAttack: 65, 
        baseDefense: 75,
        stage: 2,
        evolutionLine: "rock",
        preEvolution: "Sassetto"
    },
    { 
        name: "Tempesta", 
        sprite: "🌩️", 
        rarity: "Raro", 
        catchRate: 25, 
        expValue: 150, 
        baseHP: 85, 
        baseAttack: 80, 
        baseDefense: 50,
        stage: 2,
        evolutionLine: "electric",
        preEvolution: "Scintilla"
    },
    { 
        name: "Blizzard", 
        sprite: "🌨️", 
        rarity: "Raro", 
        catchRate: 25, 
        expValue: 150, 
        baseHP: 90, 
        baseAttack: 70, 
        baseDefense: 65,
        stage: 2,
        evolutionLine: "ice",
        preEvolution: "Cristallo"
    },
    { 
        name: "Spettro", 
        sprite: "🌙", 
        rarity: "Leggendario", 
        catchRate: 10, 
        expValue: 300, 
        baseHP: 110, 
        baseAttack: 95, 
        baseDefense: 60,
        stage: 2,
        evolutionLine: "ghost",
        preEvolution: "Fantasma"
    },
    
    // Drago Stellare (no evolution, legendary)
    { 
        name: "Drago Stellare", 
        sprite: "🐉", 
        rarity: "Leggendario", 
        catchRate: 15, 
        expValue: 250, 
        baseHP: 105, 
        baseAttack: 85, 
        baseDefense: 70,
        stage: 1,
        evolutionLine: "dragon"
    }
];

// Get monster data by name
function getMonsterByName(name) {
    return monsterData.find(m => m.name === name);
}

// Get all monsters in an evolution line
function getEvolutionLine(evolutionLine) {
    return monsterData.filter(m => m.evolutionLine === evolutionLine);
}

// Get pre-evolution of a monster
function getPreEvolution(monster) {
    if (monster.preEvolution) {
        return getMonsterByName(monster.preEvolution);
    }
    return null;
}

// Get evolution of a monster
function getEvolution(monster) {
    if (monster.evolutionName) {
        return getMonsterByName(monster.evolutionName);
    }
    return null;
}

// Check if monster can evolve at current level
function canEvolve(monster) {
    if (!monster.evolutionLevel || !monster.evolutionName) return false;
    const currentLevel = parseInt(monster.level) || 1;
    return currentLevel >= monster.evolutionLevel;
}

// Evolve a monster
function evolveMonster(monster) {
    if (!canEvolve(monster)) return false;
    
    const evolution = getEvolution(monster);
    if (!evolution) return false;
    
    const oldName = monster.name;
    const oldSprite = monster.sprite;
    
    // Update monster to evolved form
    monster.name = evolution.name;
    monster.sprite = evolution.sprite;
    monster.rarity = evolution.rarity;
    monster.catchRate = evolution.catchRate;
    monster.expValue = evolution.expValue;
    monster.baseHP = evolution.baseHP;
    monster.baseAttack = evolution.baseAttack;
    monster.baseDefense = evolution.baseDefense;
    monster.stage = evolution.stage;
    monster.evolutionLevel = evolution.evolutionLevel;
    monster.evolutionName = evolution.evolutionName;
    monster.preEvolution = evolution.preEvolution;
    
    // Recalculate stats based on current level
    const currentLevel = parseInt(monster.level) || 1;
    const levelBonus = currentLevel - 1;
    const oldMaxHP = parseInt(monster.maxHP) || 0;
    const wasFullHP = (parseInt(monster.hp) || 0) >= oldMaxHP;
    
    monster.maxHP = monster.baseHP + Math.floor(levelBonus * (monster.baseHP * 0.1));
    monster.attack = monster.baseAttack + Math.floor(levelBonus * (monster.baseAttack * 0.15));
    monster.defense = monster.baseDefense + Math.floor(levelBonus * (monster.baseDefense * 0.1));
    
    // If monster was at full health, keep it at full health with new maxHP
    if (wasFullHP) {
        monster.hp = monster.maxHP;
    } else {
        // Scale current HP proportionally
        const hpRatio = (parseInt(monster.hp) || 0) / oldMaxHP;
        monster.hp = Math.floor(monster.maxHP * hpRatio);
    }
    
    addLog(`🎊 ${oldName} ${oldSprite} si è evoluto in ${monster.name} ${monster.sprite}!`);
    
    // Show evolution animation
    showEvolutionScreen(oldName, oldSprite, monster);
    
    return true;
}

// Evolution popup queue
window.evolutionPopupQueue = window.evolutionPopupQueue || [];
window.evolutionPopupActive = window.evolutionPopupActive || false;

function showEvolutionScreen(oldName, oldSprite, newMonster) {
    // Add this evolution to the queue
    window.evolutionPopupQueue.push({ oldName, oldSprite, newMonster });
    processEvolutionQueue();
}

function processEvolutionQueue() {
    if (window.evolutionPopupActive) return;
    if (window.evolutionPopupQueue.length === 0) return;
    window.evolutionPopupActive = true;
    const { oldName, oldSprite, newMonster } = window.evolutionPopupQueue.shift();

    // Create popup overlay
    const popup = document.createElement('div');
    popup.id = 'evolution-popup';
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
            background: linear-gradient(135deg, rgba(255, 215, 0, 0.95), rgba(255, 140, 0, 0.95));
            border: 3px solid #ffd700;
            border-radius: 15px;
            padding: 30px;
            max-width: 500px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            animation: scaleIn 0.3s ease-out;
        ">
            <h3 style="color: #ffd700; margin-bottom: 20px; font-size: 1.5em;">✨ EVOLUZIONE! ✨</h3>
            <div style="display: flex; justify-content: center; align-items: center; gap: 30px; margin: 30px 0;">
                <div style="text-align: center;">
                    <span style="font-size: 4em; opacity: 0.7;">${oldSprite}</span>
                    <p style="color: #333; margin-top: 10px; font-weight: bold;">${oldName}</p>
                </div>
                <div style="text-align: center;">
                    <span style="font-size: 3em; color: #ffd700; animation: pulse 1s infinite;">➡️</span>
                </div>
                <div style="text-align: center;">
                    <span style="font-size: 4em; animation: float 2s ease-in-out infinite;">${newMonster.sprite}</span>
                    <p style="color: #ffd700; font-weight: bold; margin-top: 10px;">${newMonster.name}</p>
                </div>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; margin: 20px 0;">
                <h4 style="color: #ffd700; margin-bottom: 10px;">📊 Nuove Statistiche</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; text-align: center;">
                    <div>
                        <strong style="color: #4CAF50;">❤️ HP</strong><br>
                        <span style="font-size: 1.2em;">${newMonster.maxHP}</span>
                    </div>
                    <div>
                        <strong style="color: #f44336;">⚔️ ATK</strong><br>
                        <span style="font-size: 1.2em;">${newMonster.attack}</span>
                    </div>
                    <div>
                        <strong style="color: #2196F3;">🛡️ DEF</strong><br>
                        <span style="font-size: 1.2em;">${newMonster.defense}</span>
                    </div>
                </div>
            </div>
            <p style="color: #ffd700; font-style: italic; margin-bottom: 20px;">Il tuo ${oldName} è cresciuto più forte!</p>
            <button onclick="closeEvolutionPopup()" 
                    style="
                        background: linear-gradient(45deg, #ffd700, #ff8c00);
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        color: #333;
                        font-weight: bold;
                        cursor: pointer;
                        font-size: 1.1em;
                    ">
                ✨ Fantastico!
            </button>
        </div>
    `;
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes scaleIn {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(popup);
    setTimeout(() => {
        closeEvolutionPopup();
    }, 4000);
}

function closeEvolutionPopup() {
    const popup = document.getElementById('evolution-popup');
    if (popup) {
        popup.style.animation = 'fadeIn 0.3s ease-in reverse';
        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
            window.evolutionPopupActive = false;
            processEvolutionQueue(); // Show next popup if any
        }, 300);
    } else {
        window.evolutionPopupActive = false;
        processEvolutionQueue();
    }
}

// Enhanced give experience function with evolution check
function giveMonsterExp(monster, expAmount) {
    // Ensure expAmount is a valid number
    const safeExpAmount = Math.max(0, parseInt(expAmount) || 0);
    
    // Fix old monsters that don't have proper leveling data
    if (!monster.hasOwnProperty('level')) {
        monster.level = 1;
        monster.exp = 0;
        monster.expToNext = 50;
        monster.maxHP = monster.hp || monster.baseHP;
        monster.attack = monster.baseAttack;
        monster.defense = monster.baseDefense;
        monster.captureDate = Date.now();
    }
    
    // Ensure all monster properties are numbers
    monster.exp = Math.max(0, parseInt(monster.exp) || 0);
    monster.level = Math.max(1, parseInt(monster.level) || 1);
    monster.expToNext = Math.max(1, parseInt(monster.expToNext) || 50);
    
    monster.exp += safeExpAmount;
    
    // Level up loop
    let evolved = false;
    while (monster.exp >= monster.expToNext) {
        monster.exp -= monster.expToNext;
        monster.level++;
        monster.expToNext = Math.floor(monster.expToNext * 1.2);
        
        // Calculate new stats - ensure all are numbers
        const levelBonus = monster.level - 1;
        const oldMaxHP = parseInt(monster.maxHP) || parseInt(monster.baseHP) || 30;
        const wasFullHP = (monster.hp === oldMaxHP);
        
        monster.maxHP = monster.baseHP + Math.floor(levelBonus * (monster.baseHP * 0.1));
        monster.attack = monster.baseAttack + Math.floor(levelBonus * (monster.baseAttack * 0.15));
        monster.defense = monster.baseDefense + Math.floor(levelBonus * (monster.baseDefense * 0.1));
        
        // If monster was at full health, keep it at full health
        if (wasFullHP) {
            monster.hp = monster.maxHP;
        }
        
        addLog(`🎊 ${monster.name} è salito al livello ${monster.level}!`);
        
        // Check for evolution after level up
        if (canEvolve(monster) && !evolved) {
            evolved = true;
            setTimeout(() => {
                evolveMonster(monster);
                updateDisplay(); // Update display after evolution
            }, 1000);
        }
    }
}

// Get total number of unique monsters available in the game
function getTotalAvailableMonsters() {
    return monsterData.length;
}

// Get count of unique monsters caught (including evolutions obtained through evolution)
function getUniqueMonsterschaught() {
    const caughtNames = new Set();
    
    game.monsters.forEach(monster => {
        // Add the current monster
        caughtNames.add(monster.name);
        
        // If this is an evolved form, also count the pre-evolution as "obtained"
        const preEvo = getPreEvolution(monster);
        if (preEvo) {
            caughtNames.add(preEvo.name);
        }
    });
    
    // Also check our capture history for any monsters we caught but evolved/merged
    if (game.captureHistory) {
        game.captureHistory.forEach(name => {
            caughtNames.add(name);
            
            // If we caught an evolution, also count pre-evolution
            const monster = getMonsterByName(name);
            if (monster) {
                const preEvo = getPreEvolution(monster);
                if (preEvo) {
                    caughtNames.add(preEvo.name);
                }
            }
        });
    }
    
    return caughtNames.size;
}

// Initialize capture history if it doesn't exist
function initializeCaptureHistory() {
    if (!game.captureHistory) {
        game.captureHistory = new Set();
        
        // Add existing monsters to history
        game.monsters.forEach(monster => {
            game.captureHistory.add(monster.name);
        });
    }
}

// Enhanced monster spawning with evolution forms after floor 20
function spawnMonster() {
    // Determine level based on current floor
    const floorBlock = Math.floor((game.currentFloor - 1) / 10) + 1;
    // Granular scaling: as you go up each floor, min/max level increases
    const blockStart = (floorBlock - 1) * 10 + 1;
    const blockEnd = floorBlock * 10;
    const floorsIntoBlock = game.currentFloor - blockStart;
    // Base min/max for the block
    let minLevel = Math.max(1, floorBlock * 2 - 1 + Math.floor(floorsIntoBlock / 3));
    let maxLevel = floorBlock * 2 + 1 + Math.floor(floorsIntoBlock / 2);
    // Bias: higher floors in block more likely to get higher level
    let wildLevel = minLevel;
    if (maxLevel > minLevel) {
        // Weighted random: higher floors = higher chance for higher level
        const bias = 0.5 + (floorsIntoBlock / 20); // up to +0.5 bias at end of block
        const r = Math.pow(Math.random(), 1 - bias); // skews towards higher
        wildLevel = minLevel + Math.floor(r * (maxLevel - minLevel + 1));
    }
    // Boss boost: every 10th floor
    if (game.currentFloor % 10 === 0) {
        wildLevel += 2 + Math.floor(floorBlock / 2); // +2, more in later blocks
    }
    // Determine rarity and whether to spawn evolved forms
    const rand = Math.random();
    let rarity;
    let allowEvolved = game.currentFloor >= 20;
    if (floorBlock <= 2) {
        // Early floors: mostly common
        if (rand < 0.7) rarity = "Comune";
        else if (rand < 0.95) rarity = "Non Comune";
        else rarity = "Raro";
    } else if (floorBlock <= 4) {
        // Mid floors: more variety
        if (rand < 0.4) rarity = "Comune";
        else if (rand < 0.7) rarity = "Non Comune";
        else if (rand < 0.95) rarity = "Raro";
        else rarity = "Leggendario";
    } else {
        // Late floors: rare monsters more common
        if (rand < 0.3) rarity = "Comune";
        else if (rand < 0.5) rarity = "Non Comune";
        else if (rand < 0.8) rarity = "Raro";
        else rarity = "Leggendario";
    }
    // Get available monsters
    let available = monsterData.filter(m => m.rarity === rarity);
    // If we're past floor 20, maybe spawn evolved forms
    if (allowEvolved && Math.random() < 0.3) { // 30% chance for evolved form
        const evolvedMonsters = available.filter(m => m.stage === 2);
        if (evolvedMonsters.length > 0) {
            available = evolvedMonsters;
        }
    } else {
        // Filter to stage 1 monsters only
        available = available.filter(m => m.stage === 1);
    }
    const monster = available[Math.floor(Math.random() * available.length)];
    game.currentMonster = createScaledMonster(monster, wildLevel);
    game.battlesThisBlock++; // Count this battle
    const stageText = game.currentMonster.stage === 2 ? " (Evoluto)" : "";
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter">
            <h3>🚨 Mostro Selvaggio - Piano ${game.currentFloor}</h3>
            <span class="monster-sprite">${monster.sprite}</span>
            <h4>${monster.name} Lv.${wildLevel}${stageText}</h4>
            <p><strong>Rarità:</strong> ${monster.rarity}</p>
            <p style="font-size: 0.9em; color: #ccc;">HP: ${game.currentMonster.hp} | ATK: ${game.currentMonster.attack} | DEF: ${game.currentMonster.defense}</p>
            <p style="color: #ffd700; font-size: 0.9em;">💰 Ricompensa: ${game.currentMonster.expValue} monete</p>
            <div class="buttons">
                ${game.monsters.length > 0 ? '<button onclick="showMonsterSelection()">⚔️ Combatti</button>' : ''}
                <button onclick="attemptCatch()">🎯 Lancia Pokeball</button>
                <button onclick="runAway()">🏃 Scappa</button>
            </div>
        </div>
    `;
    addLog(`🎯 Piano ${game.currentFloor}: ${monster.name} Lv.${wildLevel} (${monster.rarity})${stageText}`);
}

// Calculate catch chance for display
function calculateCatchChance(monster) {
    let chance = parseInt(monster.catchRate) || 50;
    
    // Special case: Floor 1 guaranteed catch should always be 100%
    if (game.currentFloor === 1 && monster.catchRate === 100) {
        return 100;
    } else {
        // Find existing monster in same evolution line for duplicate penalty
        const sameLineMonsters = game.monsters.filter(m => m.evolutionLine === monster.evolutionLine);
        chance -= sameLineMonsters.length * 8;
        return Math.max(10, Math.min(95, chance));
    }
}

// Enhanced attempt catch with evolution line merging
function attemptCatch() {
    console.log("attemptCatch called"); // Debug log
    
    try {
        if (game.player.pokeballs <= 0) {
            addLog("❌ Non hai Pokeball! Vai al prossimo negozio!");
            return;
        }
        
        game.player.pokeballs--;
        const monster = game.currentMonster;
        
        if (!monster) {
            console.error("No current monster to catch!");
            addLog("❌ Nessun mostro da catturare!");
            return;
        }
        
        console.log("Attempting to catch:", monster.name); // Debug log
        
        // Initialize capture history
        initializeCaptureHistory();
        
        // Calculate catch chance
        let chance = calculateCatchChance(monster);
        
        console.log("Catch chance:", chance); // Debug log
        
        if (Math.random() * 100 < chance) {
            // Successful catch
            let moneyReward = Math.floor((parseInt(monster.expValue) || 10) * 0.5);
            let showMoney = true;
            // If the monster was just defeated in battle, don't give extra money
            if (monster._defeatedInBattle) {
                moneyReward = 0;
                showMoney = false;
            }
            // Ensure money is a valid number before adding
            game.player.money = Math.max(0, parseInt(game.player.money) || 0);
            game.player.money += moneyReward;
            // Add to capture history
            game.captureHistory.add(monster.name);
            // Find existing monster in same evolution line
            const existingMonster = game.monsters.find(m => m.evolutionLine === monster.evolutionLine);
            if (existingMonster) {
                // MERGE: Convert caught monster to EXP for existing monster with level-based penalties
                const caughtLevel = parseInt(monster.level) || 1;
                const existingLevel = parseInt(existingMonster.level) || 1;
                const levelDiff = existingLevel - caughtLevel;
                
                // New base merge EXP: scales with caught monster's level
                let baseMergeExp = (parseInt(monster.expValue) || 10) * caughtLevel;
                
                // Heavier penalty for lower-level merges: 30% per level difference, minimum 10% of base value
                let levelPenalty = 1.0;
                if (levelDiff > 0) {
                    levelPenalty = Math.max(0.1, 1.0 - (levelDiff * 0.3));
                }
                // No bonus for higher-level merges (levelDiff < 0)
                const mergeExp = Math.floor(baseMergeExp * levelPenalty);
                
                // Store original level before merging
                const originalLevel = existingMonster.level;
                giveMonsterExp(existingMonster, mergeExp);
                
                const penaltyText = levelDiff > 0 ? ` (penalità livello: -${Math.round((1-levelPenalty)*100)}%)` : '';
                addLog(`🔄 ${monster.name} Lv.${monster.level} catturato e fuso con ${existingMonster.name}!${showMoney ? ` (+${moneyReward} monete)` : ''}`);
                addLog(`💫 ${existingMonster.name} ha guadagnato ${mergeExp} EXP dalla fusione${penaltyText}!`);
                showMergeSuccess(monster, existingMonster, mergeExp, originalLevel, showMoney ? moneyReward : null);
            } else {
                // NEW MONSTER: Add to collection - MAINTAIN LEVEL
                const newMonster = initializeMonster(monster);
                game.monsters.push(newMonster);
                addLog(`🎉 ${monster.name} Lv.${monster.level} catturato!${showMoney ? ` (+${moneyReward} monete)` : ''}`);
                
                // Check if the newly caught monster can evolve (e.g., caught at level higher than evolution requirement)
                if (canEvolve(newMonster)) {
                    setTimeout(() => {
                        evolveMonster(newMonster);
                        updateDisplay(); // Update display after evolution
                    }, 1000);
                }
                
                showCaptureSuccess(newMonster);
            }
            game.currentMonster = null;
        } else {
            // Failed catch
            addLog(`💔 ${monster.name} è scappato dalla Pokeball! (${chance}% di successo)`);
            
            // Initialize flee counter if not exists
            if (!monster.fleeCounter) {
                monster.fleeCounter = 0;
            }
            monster.fleeCounter++;
            
            // Calculate flee chance based on failed attempts
            let fleeChance = 0.4; // Base 40% chance
            if (monster.isBoss) {
                // Boss: 100% flee chance after first failed attempt
                fleeChance = 1.0;
            } else {
                // Regular monster: increasing flee chance
                fleeChance = Math.min(0.9, 0.4 + (monster.fleeCounter - 1) * 0.2); // +20% per failed attempt, max 90%
            }
            
            if (Math.random() < fleeChance) {
                showMonsterFled(monster);
                game.currentMonster = null;
            } else {
                showCatchFailed(monster, chance);
            }
        }
        
        updateDisplay();
        console.log("attemptCatch completed"); // Debug log
        
    } catch (error) {
        console.error("Error in attemptCatch:", error);
        addLog("❌ Errore durante la cattura!");
        
        // Fallback: simple successful catch
        if (game.currentMonster) {
            const monster = game.currentMonster;
            const newMonster = {
                name: monster.name,
                sprite: monster.sprite,
                rarity: monster.rarity || "Comune",
                level: 1,
                exp: 0,
                expToNext: 50,
                hp: monster.hp || 45,
                maxHP: monster.maxHP || 45,
                baseHP: monster.baseHP || 45,
                attack: monster.attack || 35,
                baseAttack: monster.baseAttack || 35,
                defense: monster.defense || 25,
                baseDefense: monster.baseDefense || 25,
                evolutionLine: monster.evolutionLine || "fire",
                stage: 1,
                captureDate: Date.now()
            };
            
            game.monsters.push(newMonster);
            game.currentMonster = null;
            
            const encounterArea = document.getElementById('encounter-area');
            if (encounterArea) {
                encounterArea.innerHTML = `
                    <div class="encounter">
                        <h3 style="color: #4CAF50;">✅ Cattura Riuscita!</h3>
                        <span class="monster-sprite">${newMonster.sprite}</span>
                        <h4>${newMonster.name} Lv.1</h4>
                        <p style="color: #4CAF50; margin: 15px 0;"><strong>${newMonster.name}</strong> si è unito alla tua squadra!</p>
                        <div class="buttons">
                            <button onclick="advanceFloor()">➡️ Avanza Piano 2</button>
                        </div>
                    </div>
                `;
            }
            
            addLog(`🎉 ${newMonster.name} catturato con successo!`);
            updateDisplay();
        }
    }
}