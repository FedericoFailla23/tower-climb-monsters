// Enhanced game.js with evolution support and capture history

// Main game state and core logic
const game = {
    player: {
        money: 100,
        pokeballs: 5
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
    game.player.pokeballs = Math.max(0, parseInt(game.player.pokeballs) || 5);
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

// MISSING FUNCTION - Spawn guaranteed catch encounter for floor 1
function spawnGuaranteedCatch() {
    console.log("Spawning guaranteed catch encounter..."); // Debug log
    
    // For floor 1, always spawn a common starter monster at level 1
    const starterMonsters = monsterData.filter(m => m.rarity === "Comune" && m.stage === 1);
    const monster = starterMonsters[Math.floor(Math.random() * starterMonsters.length)];
    
    game.currentMonster = createScaledMonster(monster, 3);
    game.currentMonster.catchRate = 100; // Very high catch rate for first monster
    
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter">
            <h3 style="color: #4CAF50;">🌟 Il Tuo Primo Mostro!</h3>
            <span class="monster-sprite">${monster.sprite}</span>
            <h4>${monster.name} Lv.3</h4>
            <p style="color: #4CAF50;"><strong>Rarità:</strong> ${monster.rarity}</p>
            <p style="margin: 15px 0; color: #4CAF50;">
                Questo mostro è debole e sarà facile da catturare!
            </p>
            <p style="font-size: 0.9em; color: #ccc;">HP: ${game.currentMonster.hp} | ATK: ${game.currentMonster.attack} | DEF: ${game.currentMonster.defense}</p>
            <p style="color: #4CAF50; font-size: 0.9em;">🎯 Probabilità di cattura: 100%</p>
            <div class="buttons">
                <button onclick="attemptCatch()">🎯 Cattura il Tuo Primo Mostro!</button>
                <button onclick="showHelp()">❓ Come si gioca?</button>
            </div>
        </div>
    `;
    
    addLog(`🌟 Piano 1: Il tuo primo ${monster.name} ti aspetta! Cattura garantita!`);
}

// Create a scaled monster based on level
function createScaledMonster(monsterTemplate, level) {
    const scaledLevel = Math.max(1, parseInt(level) || 1);
    const levelBonus = scaledLevel - 1;
    
    return {
        name: monsterTemplate.name,
        sprite: monsterTemplate.sprite,
        rarity: monsterTemplate.rarity,
        level: scaledLevel,
        hp: monsterTemplate.baseHP + Math.floor(levelBonus * (monsterTemplate.baseHP * 0.1)),
        maxHP: monsterTemplate.baseHP + Math.floor(levelBonus * (monsterTemplate.baseHP * 0.1)),
        baseHP: monsterTemplate.baseHP,
        attack: monsterTemplate.baseAttack + Math.floor(levelBonus * (monsterTemplate.baseAttack * 0.15)),
        baseAttack: monsterTemplate.baseAttack,
        defense: monsterTemplate.baseDefense + Math.floor(levelBonus * (monsterTemplate.baseDefense * 0.1)),
        baseDefense: monsterTemplate.baseDefense,
        catchRate: monsterTemplate.catchRate,
        expValue: monsterTemplate.expValue + Math.floor(levelBonus * (monsterTemplate.expValue * 0.2)),
        evolutionLine: monsterTemplate.evolutionLine,
        stage: monsterTemplate.stage || 1,
        evolutionLevel: monsterTemplate.evolutionLevel,
        evolutionName: monsterTemplate.evolutionName,
        preEvolution: monsterTemplate.preEvolution
    };
}

// Initialize a monster when caught (maintains its current level and stats)
function initializeMonster(caughtMonster) {
    const level = parseInt(caughtMonster.level) || 1;
    
    return {
        name: caughtMonster.name,
        sprite: caughtMonster.sprite,
        rarity: caughtMonster.rarity,
        level: level,
        exp: 0,
        expToNext: Math.floor(50 * Math.pow(1.2, level - 1)),
        hp: parseInt(caughtMonster.hp) || parseInt(caughtMonster.baseHP) || 30,
        maxHP: parseInt(caughtMonster.maxHP) || parseInt(caughtMonster.baseHP) || 30,
        baseHP: parseInt(caughtMonster.baseHP) || 30,
        attack: parseInt(caughtMonster.attack) || parseInt(caughtMonster.baseAttack) || 20,
        baseAttack: parseInt(caughtMonster.baseAttack) || 20,
        defense: parseInt(caughtMonster.defense) || parseInt(caughtMonster.baseDefense) || 15,
        baseDefense: parseInt(caughtMonster.baseDefense) || 15,
        evolutionLine: caughtMonster.evolutionLine || "fire",
        stage: caughtMonster.stage || 1,
        evolutionLevel: caughtMonster.evolutionLevel,
        evolutionName: caughtMonster.evolutionName,
        preEvolution: caughtMonster.preEvolution,
        captureDate: Date.now()
    };
}

// Spawn boss encounter - MUST be battled to proceed
function spawnBoss() {
    const floorBlock = Math.floor((game.currentFloor - 1) / 10) + 1;
    const bossLevel = floorBlock * 3 + 2; // Higher level than normal monsters
    
    // Floor-dependent boss rarity selection
    const rand = Math.random();
    let rarity;
    
    if (floorBlock === 1) {
        // Floor 10: Mostly common, some non-common, no rare/legendary
        if (rand < 0.7) rarity = "Comune";
        else rarity = "Non Comune";
    } else if (floorBlock === 2) {
        // Floor 20: Mix of common and non-common, rare possible
        if (rand < 0.5) rarity = "Comune";
        else if (rand < 0.85) rarity = "Non Comune";
        else rarity = "Raro";
    } else if (floorBlock === 3) {
        // Floor 30: Less common, more non-common and rare
        if (rand < 0.3) rarity = "Comune";
        else if (rand < 0.6) rarity = "Non Comune";
        else if (rand < 0.9) rarity = "Raro";
        else rarity = "Leggendario";
    } else {
        // Floor 40+: Rare and legendary become more common
        if (rand < 0.2) rarity = "Comune";
        else if (rand < 0.4) rarity = "Non Comune";
        else if (rand < 0.7) rarity = "Raro";
        else rarity = "Leggendario";
    }
    
    // Force stage 1 only for bosses to maintain balance
    const available = monsterData.filter(m => m.rarity === rarity && m.stage === 1);
    const monster = available[Math.floor(Math.random() * available.length)];
    
    game.currentMonster = createScaledMonster(monster, bossLevel);
    game.currentMonster.catchRate = Math.max(15, game.currentMonster.catchRate - 20); // Harder to catch
    game.currentMonster.isBoss = true; // Mark as boss for special handling
    
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter boss-encounter">
            <h3 style="color: #9C27B0;">👑 BOSS BATTLE - Piano ${game.currentFloor}</h3>
            <span class="monster-sprite">${monster.sprite}</span>
            <h4>${monster.name} Lv.${bossLevel} (BOSS)</h4>
            <p><strong>Rarità:</strong> ${monster.rarity}</p>
            <p style="color: #9C27B0; margin: 15px 0;">
                Un boss potente ti blocca la strada!<br>
                <strong>⚔️ DEVI SCONFIGGERLO PER PASSARE! ⚔️</strong><br>
                <small>Vincendo: squadra curata + possibilità di cattura</small>
            </p>
            <p style="font-size: 0.9em; color: #ccc;">HP: ${game.currentMonster.hp} | ATK: ${game.currentMonster.attack} | DEF: ${game.currentMonster.defense}</p>
            <p style="color: #ffd700; font-size: 0.9em;">💰 Ricompensa: ${game.currentMonster.expValue} monete</p>
            <div class="buttons">
                ${game.monsters.length > 0 ? '<button onclick="showMonsterSelection()">⚔️ COMBATTI BOSS</button>' : ''}
                ${game.monsters.length === 0 ? '<p style="color: #f44336; margin: 10px 0;">❌ Non hai mostri per combattere!</p>' : ''}
            </div>
        </div>
    `;
    
    addLog(`👑 Piano ${game.currentFloor}: Boss ${monster.name} Lv.${bossLevel} (${monster.rarity}) - BATTAGLIA OBBLIGATORIA!`);
}

// Spawn event (help or special encounter)
function spawnEvent() {
    const eventType = Math.random();
    
    if (eventType < 0.25) {
        // Healing event
        spawnHealingEvent();
    } else if (eventType < 0.5) {
        // Money event
        spawnMoneyEvent();
    } else if (eventType < 0.75) {
        // Pokeball event
        spawnPokeballEvent();
    } else {
        // Scenery event
        spawnSceneryEvent();
    }
}

// Spawn healing event
function spawnHealingEvent() {
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter help-encounter">
            <h3 style="color: #2196F3;">🌟 Fonte Curativa</h3>
            <span class="monster-sprite">⛲</span>
            <h4>Acque Magiche</h4>
            <p style="color: #2196F3; margin: 15px 0;">
                Hai trovato una fonte di acque curative!<br>
                Tutti i tuoi mostri possono essere curati gratuitamente.
            </p>
            <div class="buttons">
                <button onclick="freeHeal()">💧 Bevi dalle Acque Curative</button>
                <button onclick="advanceFloor()">➡️ Ignora (Piano ${game.currentFloor + 1})</button>
            </div>
        </div>
    `;
    
    addLog(`⛲ Piano ${game.currentFloor}: Hai trovato una fonte curativa!`);
}

// Spawn money event
function spawnMoneyEvent() {
    const moneyFound = Math.floor(Math.random() * 50) + 25;
    
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter help-encounter">
            <h3 style="color: #ffd700;">💰 Tesoro Nascosto</h3>
            <span class="monster-sprite">💎</span>
            <h4>Cofanetto del Tesoro</h4>
            <p style="color: #ffd700; margin: 15px 0;">
                Hai trovato un cofanetto nascosto!<br>
                Contiene <strong>${moneyFound} monete</strong>!
            </p>
            <div class="buttons">
                <button onclick="collectMoney(${moneyFound})">💰 Raccogli Tesoro</button>
            </div>
        </div>
    `;
    
    addLog(`💎 Piano ${game.currentFloor}: Hai trovato un tesoro da ${moneyFound} monete!`);
}

// Spawn pokeball event
function spawnPokeballEvent() {
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter help-encounter">
            <h3 style="color: #E91E63;">🎾 Pokeball Abbandonata</h3>
            <span class="monster-sprite">🎾</span>
            <h4>Pokeball Trovata</h4>
            <p style="color: #E91E63; margin: 15px 0;">
                Hai trovato una Pokeball abbandonata!<br>
                Sembra ancora in buone condizioni e può essere riutilizzata.
            </p>
            <div class="buttons">
                <button onclick="collectPokeball()">🎾 Raccogli Pokeball</button>
            </div>
        </div>
    `;
    
    addLog(`🎾 Piano ${game.currentFloor}: Hai trovato una Pokeball abbandonata!`);
}

// Spawn scenery event
function spawnSceneryEvent() {
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter help-encounter">
            <h3 style="color: #8BC34A;">🌅 Vista Panoramica</h3>
            <span class="monster-sprite">🏞️</span>
            <h4>Pausa Rilassante</h4>
            <p style="color: #8BC34A; margin: 15px 0;">
                Ti fermi un momento per goderti la vista dalla torre.<br>
                È un momento di pace e tranquillità nella tua scalata.
            </p>
            <div class="buttons">
                <button onclick="advanceFloor()">➡️ Continua al Piano ${game.currentFloor + 1}</button>
            </div>
        </div>
    `;
    
    addLog(`🌅 Piano ${game.currentFloor}: Hai goduto di una pausa rilassante con vista panoramica!`);
}

// Free healing from event
function freeHeal() {
    let healedCount = 0;
    game.monsters.forEach(monster => {
        const currentHP = parseInt(monster.hp) || 0;
        const maxHP = parseInt(monster.maxHP) || parseInt(monster.baseHP) || 30;
        if (currentHP < maxHP) {
            monster.hp = maxHP;
            healedCount++;
        }
    });
    
    if (healedCount > 0) {
        addLog(`💧 ${healedCount} mostri sono stati curati gratuitamente!`);
    } else {
        addLog(`💧 Tutti i mostri erano già in perfetta salute!`);
    }
    
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter help-encounter">
            <h3 style="color: #4CAF50;">✨ Curati!</h3>
            <span class="monster-sprite">💚</span>
            <h4>Acque Curative</h4>
            <p style="color: #4CAF50; margin: 15px 0;">
                ${healedCount > 0 ? 
                    `I tuoi ${healedCount} mostri sono stati curati!` : 
                    `I tuoi mostri erano già in perfetta salute!`}
            </p>
            <div class="buttons">
                <button onclick="advanceFloor()">➡️ Continua al Piano ${game.currentFloor + 1}</button>
            </div>
        </div>
    `;
    
    updateDisplay();
}

// Collect money from event
function collectMoney(amount) {
    const safeAmount = Math.max(0, parseInt(amount) || 0);
    game.player.money = Math.max(0, parseInt(game.player.money) || 0);
    game.player.money += safeAmount;
    
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter help-encounter">
            <h3 style="color: #ffd700;">💰 Tesoro Raccolto!</h3>
            <span class="monster-sprite">💰</span>
            <h4>+${safeAmount} Monete</h4>
            <p style="color: #ffd700; margin: 15px 0;">
                Hai raccolto ${safeAmount} monete!<br>
                Ora hai <strong>${game.player.money} monete</strong> totali.
            </p>
            <div class="buttons">
                <button onclick="advanceFloor()">➡️ Continua al Piano ${game.currentFloor + 1}</button>
            </div>
        </div>
    `;
    
    addLog(`💰 Hai raccolto ${safeAmount} monete! Totale: ${game.player.money}`);
    updateDisplay();
}

// Collect pokeball from event
function collectPokeball() {
    game.player.pokeballs = Math.max(0, parseInt(game.player.pokeballs) || 0);
    const pokeballsFound = Math.floor(Math.random() * 3) + 1; // Random 1-3 pokeballs
    game.player.pokeballs += pokeballsFound;
    
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter help-encounter">
            <h3 style="color: #E91E63;">🎾 Pokeball Raccolte!</h3>
            <span class="monster-sprite">🎾</span>
            <h4>+${pokeballsFound} Pokeball</h4>
            <p style="color: #E91E63; margin: 15px 0;">
                Hai raccolto ${pokeballsFound} Pokeball!<br>
                Ora hai <strong>${game.player.pokeballs} Pokeball</strong> totali.
            </p>
            <div class="buttons">
                <button onclick="advanceFloor()">➡️ Continua al Piano ${game.currentFloor + 1}</button>
            </div>
        </div>
    `;
    
    addLog(`🎾 Hai raccolto ${pokeballsFound} Pokeball! Totale: ${game.player.pokeballs}`);
    updateDisplay();
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
                <p><strong>👑 Piano 10,20,30...:</strong> Boss battle - DEVI sconfiggerli per passare!</p>
                <p><strong>✨ Evoluzioni:</strong> I mostri evolvono automaticamente a certi livelli:</p>
                <p style="margin-left: 20px;">• Comuni: Livello 10 | Non Comuni: Livello 15 | Rari: Livello 20</p>
                <p><strong>🔄 Fusione:</strong> I duplicati nella stessa linea evolutiva si fondono</p>
                <p><strong>💰 Economia:</strong> Guadagna monete catturando e vincendo battaglie</p>
                <p><strong>⚔️ Strategia:</strong> Usa le battaglie per indebolire i mostri prima di catturarli</p>
                <p><strong>🔄 Cambio Mostri:</strong> Se un mostro sviene, puoi mandarne un altro in battaglia</p>
                <p><strong>💀 Game Over:</strong> Se tutti i mostri sono KO, il gioco ricomincia!</p>
                <p><strong>📊 Probabilità:</strong> 80% mostri, 20% eventi nei primi 7 piani di ogni blocco</p>
                <p><strong>🌟 Forme Evolute:</strong> Dopo il piano 30 puoi trovare mostri già evoluti!</p>
                <p><strong>👑 Boss:</strong> I boss devono essere sconfitti prima di poter essere catturati!</p>
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
    addLog("👑 Piano 10,20,30...: Boss (battaglia obbligatoria!)");
    addLog("✨ Evoluzioni: Livello 10/15/20 a seconda della rarità!");
    addLog("🌟 Forme evolute: Disponibili dal piano 30!");
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

// Show capture success screen
function showCaptureSuccess(monster) {
    // Check if monster was defeated in battle (no extra money)
    const wasDefeatedInBattle = game.currentMonster && game.currentMonster._defeatedInBattle;
    
    // Only show money reward if monster wasn't defeated in battle
    const moneyReward = wasDefeatedInBattle ? 0 : Math.floor((parseInt(game.currentMonster.expValue) || 10) * 0.5);
    
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter">
            <h3 style="color: #4CAF50;">🎉 Cattura Riuscita!</h3>
            <span class="monster-sprite">${monster.sprite}</span>
            <h4>${monster.name} Lv.${monster.level}</h4>
            <p style="color: #4CAF50; margin: 15px 0;"><strong>${monster.name}</strong> si è unito alla tua squadra!</p>
            ${moneyReward > 0 ? `<p style="color: #ffd700; font-size: 0.9em;">💰 +${moneyReward} monete</p>` : ''}
            <div class="buttons">
                <button onclick="advanceFloor()">➡️ Avanza Piano ${game.currentFloor + 1}</button>
            </div>
        </div>
    `;
}

// Show merge success screen
function showMergeSuccess(caughtMonster, existingMonster, expGained, originalLevel, moneyReward) {
    // Get the updated monster from the game state to show current level
    const updatedMonster = game.monsters.find(m => m.name === existingMonster.name);
    const finalLevel = updatedMonster ? updatedMonster.level : existingMonster.level;
    
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter">
            <h3 style="color: #2196F3;">🔄 Fusione Riuscita!</h3>
            <div style="display: flex; justify-content: center; align-items: center; gap: 15px; margin: 20px 0;">
                <span style="font-size: 2.5em; opacity: 0.7;">${caughtMonster.sprite}</span>
                <span style="font-size: 2em; color: #2196F3;">➡️</span>
                <span style="font-size: 2.5em;">${existingMonster.sprite}</span>
            </div>
            <h4>${existingMonster.name} Lv.${originalLevel} → Lv.${finalLevel}</h4>
            <p style="color: #2196F3; margin: 15px 0;">
                ${caughtMonster.name} si è fuso con ${existingMonster.name}!<br>
                <strong>+${expGained} EXP guadagnati!</strong>
                ${moneyReward ? `<br><span style='color: #ffd700;'>💰 +${moneyReward} monete</span>` : ''}
            </p>
            <div class="buttons">
                <button onclick="advanceFloor()">➡️ Avanza Piano ${game.currentFloor + 1}</button>
            </div>
        </div>
    `;
}

// Show catch failed screen
function showCatchFailed(monster, chance) {
    const isBoss = monster.isBoss;
    const fleeCounter = monster.fleeCounter || 1;
    
    let warningText = '';
    if (isBoss) {
        warningText = '<p style="color: #f44336; font-weight: bold;">⚠️ Boss! Hai solo una possibilità di cattura!</p>';
    } else if (fleeCounter > 1) {
        warningText = `<p style="color: #FF9800; font-weight: bold;">⚠️ Attenzione! ${monster.name} potrebbe scappare presto!</p>`;
    }
    
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter">
            <h3 style="color: #FF9800;">💔 Cattura Fallita</h3>
            <span class="monster-sprite">${monster.sprite}</span>
            <h4>${monster.name} è scappato!</h4>
            <p style="color: #FF9800; margin: 15px 0;">
                La Pokeball non è riuscita a trattenere ${monster.name}!<br>
                <small>Probabilità di successo: ${chance}%</small>
            </p>
            ${warningText}
            <div class="buttons">
                <button onclick="attemptCatch()">🎯 Riprova</button>
                <button onclick="runAway()">🏃 Scappa</button>
            </div>
        </div>
    `;
}

// Show monster fled screen
function showMonsterFled(monster) {
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter">
            <h3 style="color: #888;">💨 Mostro Fuggito</h3>
            <span class="monster-sprite" style="opacity: 0.6;">${monster.sprite}</span>
            <h4>${monster.name} è scappato via!</h4>
            <p style="color: #888; margin: 15px 0;">
                ${monster.name} è riuscito a scappare dopo aver rotto la Pokeball!
            </p>
            <div class="buttons">
                <button onclick="advanceFloor()">➡️ Avanza Piano ${game.currentFloor + 1}</button>
            </div>
        </div>
    `;
}

// Enhanced monster spawning with evolution forms after floor 30 (BALANCED)
function spawnMonster() {
    // Determine level based on current floor with improved scaling
    const floorBlock = Math.floor((game.currentFloor - 1) / 10) + 1;
    // More aggressive scaling: each 10 floors increases level range more significantly
    const baseLevel = Math.max(1, floorBlock * 3 - 2); // Increased from *2 to *3
    const levelRange = Math.max(2, floorBlock + 1); // Increased range per block
    const minLevel = baseLevel;
    const maxLevel = baseLevel + levelRange;
    const wildLevel = minLevel + Math.floor(Math.random() * (maxLevel - minLevel + 1));
    
    // Determine rarity and whether to spawn evolved forms
    const rand = Math.random();
    let rarity;
    let allowEvolved = game.currentFloor >= 30; // BALANCED: Only after floor 30
    
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
    
    // BALANCED: Only allow evolved forms after floor 30, and reduce chance
    if (allowEvolved && Math.random() < 0.2) { // 20% chance for evolved form (reduced from 30%)
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
            <p style="color: #E91E63; font-size: 0.9em;">🎯 Probabilità di cattura: ${calculateCatchChance(game.currentMonster)}%</p>
            <div class="buttons">
                ${game.monsters.length > 0 ? '<button onclick="showMonsterSelection()">⚔️ Combatti</button>' : ''}
                <button onclick="attemptCatch()">🎯 Lancia Pokeball</button>
                <button onclick="runAway()">🏃 Scappa</button>
            </div>
        </div>
    `;
    
    addLog(`🎯 Piano ${game.currentFloor}: ${monster.name} Lv.${wildLevel} (${monster.rarity})${stageText}`);
}

// Start the game when page loads
window.addEventListener('load', initGame);