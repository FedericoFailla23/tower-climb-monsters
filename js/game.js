// Enhanced game.js with evolution support and capture history

// Main game state and core logic
const game = {
    player: {
        money: 100,
        pokeballs: 3
    },
    currentFloor: 1,
    battlesThisBlock: 0,
    monsters: [],
    currentMonster: null,
    captureHistory: new Set(), // Track all monsters ever caught (for counter)
    battle: {
        active: false,
        playerMonster: null,
        enemyMonster: null,
        playerHP: 0,
        enemyHP: 0,
        turn: 'player',
        selectedMonster: null
    }
};

// Initialize game
function initGame() {
    // Ensure player values are valid numbers
    game.player.money = Math.max(0, parseInt(game.player.money) || 100);
    game.player.pokeballs = Math.max(0, parseInt(game.player.pokeballs) || 3);
    game.currentFloor = Math.max(1, parseInt(game.currentFloor) || 1);
    
    // Initialize capture history if not exists
    if (!game.captureHistory) {
        game.captureHistory = new Set();
    }
    
    // Fix any existing monsters with incorrect stats
    fixMonsterStats();
    
    // Add existing monsters to capture history
    game.monsters.forEach(monster => {
        if (game.captureHistory) {
            game.captureHistory.add(monster.name);
        }
    });
    
    updateDisplay();
    addLog("🚀 Torre dei Mostri caricata! Inizia la tua scalata!");
}

// Fix monsters that don't have proper maxHP calculated
function fixMonsterStats() {
    let fixedCount = 0;
    
    game.monsters.forEach(monster => {
        let needsFix = false;
        
        // Ensure monster has all required properties
        if (!monster.level) {
            monster.level = 1;
            needsFix = true;
        }
        
        if (!monster.exp) {
            monster.exp = 0;
            needsFix = true;
        }
        
        if (!monster.expToNext) {
            monster.expToNext = Math.floor(50 * Math.pow(1.2, (monster.level || 1) - 1));
            needsFix = true;
        }
        
        // Add evolution properties if missing
        if (!monster.evolutionLine) {
            // Try to match with monster data
            const matchingMonster = monsterData.find(m => m.name === monster.name);
            if (matchingMonster) {
                monster.evolutionLine = matchingMonster.evolutionLine;
                monster.stage = matchingMonster.stage || 1;
                monster.evolutionLevel = matchingMonster.evolutionLevel;
                monster.evolutionName = matchingMonster.evolutionName;
                monster.preEvolution = matchingMonster.preEvolution;
                needsFix = true;
            }
        }
        
        // Fix maxHP calculation if it's missing or incorrect
        if (!monster.maxHP || monster.maxHP === monster.baseHP) {
            const level = parseInt(monster.level) || 1;
            const levelBonus = level - 1;
            const baseHP = parseInt(monster.baseHP) || 30;
            
            monster.maxHP = baseHP + Math.floor(levelBonus * (baseHP * 0.1));
            needsFix = true;
        }
        
        // Fix attack and defense if they're missing
        if (!monster.attack) {
            const level = parseInt(monster.level) || 1;
            const levelBonus = level - 1;
            const baseAttack = parseInt(monster.baseAttack) || 20;
            monster.attack = baseAttack + Math.floor(levelBonus * (baseAttack * 0.15));
            needsFix = true;
        }
        
        if (!monster.defense) {
            const level = parseInt(monster.level) || 1;
            const levelBonus = level - 1;
            const baseDefense = parseInt(monster.baseDefense) || 15;
            monster.defense = baseDefense + Math.floor(levelBonus * (baseDefense * 0.1));
            needsFix = true;
        }
        
        // Ensure HP doesn't exceed maxHP
        if (parseInt(monster.hp) > parseInt(monster.maxHP)) {
            monster.hp = monster.maxHP;
            needsFix = true;
        }
        
        // Ensure HP is never negative
        if (parseInt(monster.hp) < 0) {
            monster.hp = 0;
            needsFix = true;
        }
        
        if (needsFix) {
            fixedCount++;
        }
    });
    
    if (fixedCount > 0) {
        addLog(`🔧 Riparati ${fixedCount} mostri con statistiche errate!`);
        updateDisplay(); // Refresh the display to show correct values
    }
}

// Main exploration function
function explore() {
    console.log(`Exploring floor ${game.currentFloor}...`); // Debug log
    
    if (game.currentMonster) {
        addLog("⚠️ Devi prima gestire l'incontro attuale!");
        return;
    }

    const floorType = getFloorType(game.currentFloor);
    addLog(`🏢 Piano ${game.currentFloor} - ${floorType.description}`);
    
    console.log(`Floor type: ${floorType.type}`); // Debug log
    
    switch(floorType.type) {
        case 'guaranteed_catch':
            console.log("Spawning guaranteed catch..."); // Debug log
            spawnGuaranteedCatch();
            break;
        case 'boss':
            spawnBoss();
            break;
        case 'shop':
            spawnShop();
            break;
        case 'battle_or_event':
            // IMPROVED LOGIC: More monsters, fewer events
            const blockStart = Math.floor((game.currentFloor - 1) / 10) * 10 + 1;
            const positionInBlock = game.currentFloor - blockStart + 1;
            
            // Different logic based on position in block
            if (positionInBlock <= 7) {
                // First 7 floors of each block: Prioritize monsters
                if (Math.random() < 0.8) { // 80% chance for monster
                    spawnMonster();
                } else {
                    spawnEvent();
                }
            } else {
                // Last 2 floors before boss: More events for preparation
                if (Math.random() < 0.6) { // 60% chance for monster
                    spawnMonster();
                } else {
                    spawnEvent();
                }
            }
            break;
    }
    
    updateDisplay();
}

// Determine what type of floor this is
function getFloorType(floor) {
    if (floor === 1) {
        return { type: 'guaranteed_catch', description: 'Primo Incontro Garantito' };
    } else if (floor % 10 === 0) {
        return { type: 'boss', description: 'Boss Battle!' };
    } else if (floor % 10 === 5) {
        return { type: 'shop', description: 'Negozio' };
    } else {
        return { type: 'battle_or_event', description: 'Esplorazione' };
    }
}

// Floor advancement
function advanceFloor() {
    game.currentFloor++;
    
    // Reset battle counter for new 10-floor block
    if ((game.currentFloor - 1) % 10 === 0) {
        game.battlesThisBlock = 0;
        addLog(`🎯 Nuovo blocco di piani! Preparati per sfide più difficili!`);
    }
    
    clearEncounter();
    addLog(`🏢 Sei avanzato al piano ${game.currentFloor}!`);
    
    // Automatically show the next encounter
    setTimeout(() => {
        explore();
    }, 500);
}

// Clear current encounter but maintain the encounter area
function clearEncounter() {
    game.currentMonster = null;
    
    // Show a transition message while preparing next encounter
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter">
            <h3>🔄 Avanzando...</h3>
            <span class="monster-sprite">⬆️</span>
            <h4>Piano ${game.currentFloor}</h4>
            <p style="margin: 15px 0;">Stai salendo al piano successivo...</p>
        </div>
    `;
    
    updateDisplay();
}

// Help system with evolution information
function showHelp() {
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter help-encounter">
            <h3 style="color: #2196F3;">❓ Come Giocare</h3>
            <span class="monster-sprite">📖</span>
            <div style="text-align: left; margin: 20px 0;">
                <p><strong>🎯 Obiettivo:</strong> Sali il più in alto possibile nella Torre dei Mostri!</p>
                <p><strong>🏢 Piano 1:</strong> Primo mostro garantito facile da catturare</p>
                <p><strong>🏪 Piano 5,15,25...:</strong> Negozi per comprare Pokeball e curare mostri</p>
                <p><strong>👑 Piano 10,20,30...:</strong> Boss battle con mostri potenti</p>
                <p><strong>✨ Evoluzioni:</strong> I mostri evolvono automaticamente a certi livelli:</p>
                <p style="margin-left: 20px;">• Comuni: Livello 10 | Non Comuni: Livello 15 | Rari: Livello 20</p>
                <p><strong>🔄 Fusione:</strong> I duplicati nella stessa linea evolutiva si fondono</p>
                <p><strong>💰 Economia:</strong> Guadagna monete catturando e vincendo battaglie</p>
                <p><strong>⚔️ Strategia:</strong> Usa le battaglie per indebolire i mostri prima di catturarli</p>
                <p><strong>🔄 Cambio Mostri:</strong> Se un mostro sviene, puoi mandarne un altro in battaglia</p>
                <p><strong>💀 Game Over:</strong> Se tutti i mostri sono KO, il gioco ricomincia!</p>
                <p><strong>📊 Probabilità:</strong> 80% mostri, 20% eventi nei primi 7 piani di ogni blocco</p>
                <p><strong>🌟 Forme Evolute:</strong> Dopo il piano 20 puoi trovare mostri già evoluti!</p>
            </div>
            <div class="buttons">
                <button onclick="showWelcomeEncounter()">✅ Ho Capito</button>
            </div>
        </div>
    `;
}

// Show welcome encounter for new players
function showWelcomeEncounter() {
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter">
            <h3>🌟 Benvenuto nella Torre!</h3>
            <span class="monster-sprite">🗼</span>
            <h4>Inizia la tua avventura</h4>
            <p style="margin: 15px 0;">Benvenuto nella Torre dei Mostri! Sei pronto per iniziare la tua scalata epica?</p>
            <p style="color: #ffd700; font-size: 0.9em;">💡 Piano 1: Il tuo primo mostro ti aspetta!</p>
            <p style="color: #ffd700; font-size: 0.9em;">✨ Nuovo: Sistema di evoluzione automatica!</p>
            <div class="buttons">
                <button onclick="startFirstEncounter()">🌟 Inizia al Piano 1</button>
                <button onclick="showHelp()">❓ Aiuto</button>
            </div>
        </div>
    `;
}

// Start the first encounter specifically
function startFirstEncounter() {
    console.log("Starting first encounter..."); // Debug log
    
    // Ensure we're at floor 1 and trigger the guaranteed catch
    game.currentFloor = 1;
    game.currentMonster = null;
    game.battlesThisBlock = 0;
    
    // Make sure the game state is properly initialized
    if (!game.player) {
        game.player = { money: 100, pokeballs: 3 };
    }
    if (!game.monsters) {
        game.monsters = [];
    }
    if (!game.captureHistory) {
        game.captureHistory = new Set();
    }
    
    addLog("🚀 Iniziando la scalata della torre!");
    
    // Clear any existing encounter
    clearEncounter();
    
    // Start exploration immediately
    setTimeout(() => {
        console.log("Triggering explore..."); // Debug log
        explore();
    }, 100);
}

// Enhanced reset function with capture history clearing
function resetGame() {
    // Reset all game state to initial values
    game.player.money = 100;
    game.player.pokeballs = 3;
    game.currentFloor = 1;
    game.battlesThisBlock = 0;
    game.monsters = [];
    game.currentMonster = null;
    game.captureHistory = new Set(); // Clear capture history
    game.battle = {
        active: false,
        playerMonster: null,
        enemyMonster: null,
        playerHP: 0,
        enemyHP: 0,
        turn: 'player',
        selectedMonster: null
    };
    
    // Clear and reset UI
    clearUI();
    updateDisplay();
    
    // Show welcome screen
    showWelcomeEncounter();
    
    addLog("🔄 Gioco resettato! Benvenuto di nuovo nella Torre dei Mostri!");
    addLog("🎯 Obiettivo: Sali il più in alto possibile!");
    addLog("💡 Piano 1: Primo mostro garantito");
    addLog("🏪 Piano 5,15,25...: Negozi");
    addLog("👑 Piano 10,20,30...: Boss");
    addLog("✨ Evoluzioni: Livello 10/15/20 a seconda della rarità!");
}

// Run away from encounter
function runAway() {
    addLog("🏃 Sei scappato dall'incontro.");
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter">
            <h3 style="color: #888;">🏃 Ritirata</h3>
            <span class="monster-sprite">💨</span>
            <h4 style="color: #ccc;">Sei scappato...</h4>
            <p style="margin: 15px 0; color: #888;">Hai deciso di non rischiare e sei scappato via!</p>
            <div class="buttons">
                <button onclick="advanceFloor()">➡️ Avanza Piano ${game.currentFloor + 1}</button>
            </div>
        </div>
    `;
    game.currentMonster = null;
    updateDisplay();
}

// Check if all monsters are defeated (for game over condition)
function areAllMonstersDefeated() {
    if (game.monsters.length === 0) return false; // No monsters means not defeated, just empty
    return game.monsters.every(monster => (parseInt(monster.hp) || 0) <= 0);
}

// Get count of available (non-KO) monsters
function getAvailableMonsterCount() {
    return game.monsters.filter(monster => (parseInt(monster.hp) || 0) > 0).length;
}

// Enhanced game over function with evolution stats
function gameOver() {
    game.battle.active = false;
    
    const uniqueCaught = getUniqueMonsterschaught();
    const totalAvailable = getTotalAvailableMonsters();
    const completionRate = ((uniqueCaught / totalAvailable) * 100).toFixed(1);
    
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter">
            <h3 style="color: #f44336;">💀 GAME OVER</h3>
            <span class="monster-sprite" style="opacity: 0.5; filter: grayscale(100%);">☠️</span>
            <h4 style="color: #f44336;">Tutti i tuoi mostri sono stati sconfitti!</h4>
            <p style="color: #ff6b6b; margin: 20px 0; line-height: 1.6;">
                La tua avventura nella Torre dei Mostri si conclude al piano ${game.currentFloor}.<br>
                Non disperare! Ogni scalata è un'opportunità per migliorare le tue strategie.
            </p>
            <div style="background: rgba(244, 67, 54, 0.1); padding: 15px; border-radius: 10px; margin: 20px 0;">
                <h4 style="color: #ffd700; margin-bottom: 10px;">📊 Statistiche Finali:</h4>
                <p>🏢 Piano Raggiunto: <strong>${game.currentFloor}</strong></p>
                <p>👹 Mostri Attivi: <strong>${game.monsters.length}</strong></p>
                <p>🎯 Specie Scoperte: <strong>${uniqueCaught}/${totalAvailable} (${completionRate}%)</strong></p>
                <p>💰 Monete Guadagnate: <strong>${game.player.money}</strong></p>
                ${uniqueCaught >= totalAvailable ? '<p style="color: #ffd700;">🏆 <strong>COLLEZIONE COMPLETA!</strong></p>' : ''}
            </div>
            <div class="buttons">
                <button onclick="resetGame()" style="background: linear-gradient(45deg, #4CAF50, #2E7D32);">
                    🔄 Ricomincia Avventura
                </button>
            </div>
        </div>
    `;
    
    addLog(`💀 GAME OVER! Piano ${game.currentFloor}, ${uniqueCaught}/${totalAvailable} specie scoperte!`);
    
    // Show enhanced game over notification
    showGameOverNotification(game.currentFloor, game.monsters.length, uniqueCaught, totalAvailable);
}

// Start the game when page loads
window.addEventListener('load', initGame);