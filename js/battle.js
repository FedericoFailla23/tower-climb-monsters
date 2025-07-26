// Enhanced battle.js with monster switching and game over mechanics

// Show monster selection for battle
function showMonsterSelection(isSwitch = false) {
    // First, make sure we update the display to reflect current monster states
    updateDisplay();
    
    // Sort monsters by level (descending), then by rarity, then alphabetically
    const sortedMonsters = [...game.monsters].sort((a, b) => {
        // First sort by level (highest first)
        const levelA = parseInt(a.level) || 1;
        const levelB = parseInt(b.level) || 1;
        if (levelA !== levelB) return levelB - levelA;
        
        // Then by rarity (legendary > rare > non-common > common)
        const rarityOrder = { 'Leggendario': 4, 'Raro': 3, 'Non Comune': 2, 'Comune': 1 };
        const rarityA = rarityOrder[a.rarity] || 0;
        const rarityB = rarityOrder[b.rarity] || 0;
        if (rarityA !== rarityB) return rarityB - rarityA;
        
        // Finally alphabetically by name
        return a.name.localeCompare(b.name);
    });
    
    let monsterOptions = '';
    
    sortedMonsters.forEach((monster) => {
        const index = game.monsters.indexOf(monster); // Get original index for function calls
        const isSelected = game.battle.selectedMonster === index;
        const level = parseInt(monster.level) || 1;
        
        // Make sure we're reading the current HP from the monster object
        // (which should have been updated during battle)
        const hp = Math.max(0, parseInt(monster.hp) || 0);
        const maxHP = parseInt(monster.maxHP) || parseInt(monster.baseHP) || 0;
        const attack = parseInt(monster.attack) || parseInt(monster.baseAttack) || 0;
        const defense = parseInt(monster.defense) || parseInt(monster.baseDefense) || 0;
        
        // Show if monster is unable to fight
        const canFight = hp > 0;
        const statusText = canFight ? 'Pronto' : 'KO';
        const statusColor = canFight ? '#4CAF50' : '#f44336';
        
        // Don't allow selecting the current fighting monster when switching
        const isCurrentFighter = isSwitch && game.battle.playerMonster && 
                                 game.battle.playerMonster.originalIndex === index;
        const isDisabled = !canFight || isCurrentFighter;
        
        monsterOptions += `
            <div onclick="${!isDisabled ? `selectMonster(${index})` : ''}" style="
                cursor: ${!isDisabled ? 'pointer' : 'not-allowed'};
                border: 2px solid ${isSelected ? '#4CAF50' : (canFight ? 'rgba(255,255,255,0.3)' : '#f44336')};
                background: ${isSelected ? 'rgba(76,175,80,0.2)' : (canFight ? 'rgba(255,255,255,0.1)' : 'rgba(244,67,54,0.1)')};
                margin: 8px 0;
                padding: 12px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 15px;
                transition: all 0.3s ease;
                opacity: ${!isDisabled ? '1' : '0.6'};
            ">
                <span style="font-size: 2em;">${monster.sprite}</span>
                <div style="flex: 1;">
                    <strong>${monster.name}</strong> <span style="color: #ffd700;">Lv.${level}</span><br>
                    <small style="color: #ccc;">HP: ${hp}/${maxHP} | ATK: ${attack} | DEF: ${defense}</small>
                    ${isCurrentFighter ? '<br><small style="color: #ff6b6b;">🔄 Attualmente in battaglia</small>' : ''}
                </div>
                ${isSelected ? '<span style="color: #4CAF50;">✓ Selezionato</span>' : 
                  `<span style="color: ${statusColor};">${statusText}</span>`}
            </div>
        `;
    });
    
    const title = isSwitch ? "🔄 Cambia Mostro" : "👥 Scegli il Tuo Mostro da Battaglia";
    const buttonText = isSwitch ? "🔄 Cambia Mostro" : "⚔️ Inizia Battaglia";
    const actionFunction = isSwitch ? "switchMonster()" : "confirmMonsterAndBattle()";
    
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter">
            <h3>${title}</h3>
            <p style="margin: 15px 0; color: #ccc;">
                ${isSwitch ? 'Il tuo mostro è KO! Scegli un sostituto:' : 'Seleziona quale mostro mandare in battaglia:'}
            </p>
            
            <div style="max-height: 250px; overflow-y: auto; margin: 15px 0;">
                ${monsterOptions}
            </div>
            
            <div class="buttons">
                <button onclick="${actionFunction}" ${game.battle.selectedMonster === null ? 'disabled' : ''}>
                    ${buttonText}
                </button>
                ${!isSwitch ? '<button onclick="backToEncounter()">↩️ Torna Indietro</button>' : ''}
            </div>
        </div>
    `;
}

// Select a monster for battle
function selectMonster(index) {
    const monster = game.monsters[index];
    const hp = parseInt(monster.hp) || 0;
    
    if (hp <= 0) {
        addLog("❌ Questo mostro è KO e non può combattere!");
        return;
    }
    
    // Don't allow selecting the current fighter when switching
    if (game.battle.active && game.battle.playerMonster && 
        game.battle.playerMonster.originalIndex === index) {
        addLog("❌ Questo mostro è già in battaglia!");
        return;
    }
    
    game.battle.selectedMonster = index;
    showMonsterSelection(game.battle.active); // Pass switch flag if battle is active
    addLog(`👥 Hai selezionato ${game.monsters[index].name} per la battaglia!`);
}

// Switch to a new monster during battle
function switchMonster() {
    if (game.battle.selectedMonster === null) {
        addLog("❌ Devi selezionare un mostro!");
        return;
    }
    
    const newMonster = game.monsters[game.battle.selectedMonster];
    if (newMonster.hp <= 0) {
        addLog("❌ Il mostro selezionato è KO!");
        game.battle.selectedMonster = null;
        showMonsterSelection(true);
        return;
    }
    
    // Switch to the new monster
    const oldMonsterName = game.battle.playerMonster.name;
    
    // Update player monster in battle
    game.battle.playerMonster = {
        name: newMonster.name,
        sprite: newMonster.sprite,
        level: parseInt(newMonster.level) || 1,
        hp: parseInt(newMonster.hp) || parseInt(newMonster.maxHP) || 30,
        maxHP: parseInt(newMonster.maxHP) || parseInt(newMonster.baseHP) || 30,
        attack: parseInt(newMonster.attack) || parseInt(newMonster.baseAttack) || 20,
        defense: parseInt(newMonster.defense) || parseInt(newMonster.baseDefense) || 15,
        captureDate: newMonster.captureDate,
        originalIndex: game.battle.selectedMonster
    };
    
    game.battle.playerHP = parseInt(newMonster.hp) || 0;
    game.battle.selectedMonster = null; // Reset selection
    
    addLog(`🔄 ${newMonster.name} entra in battaglia per sostituire ${oldMonsterName}!`);
    
    // Continue battle
    game.battle.turn = 'player';
    showBattleScreen();
}

// Check if player has any monsters that can fight
function hasAvailableMonsters() {
    return game.monsters.some(monster => (parseInt(monster.hp) || 0) > 0);
}

// Confirm monster selection and start battle
function confirmMonsterAndBattle() {
    if (game.battle.selectedMonster === null) {
        addLog("❌ Devi selezionare un mostro!");
        return;
    }
    
    const selectedMonster = game.monsters[game.battle.selectedMonster];
    if (selectedMonster.hp <= 0) {
        addLog("❌ Il mostro selezionato è KO!");
        game.battle.selectedMonster = null;
        showMonsterSelection();
        return;
    }
    
    startBattleWithMonster(game.battle.selectedMonster);
}

// Start battle with selected monster
function startBattleWithMonster(monsterIndex) {
    const playerMonster = game.monsters[monsterIndex];
    
    // Use current HP, don't restore it
    const currentHP = Math.max(0, parseInt(playerMonster.hp) || 0);
    const maxHP = parseInt(playerMonster.maxHP) || parseInt(playerMonster.baseHP) || 30;
    
    if (currentHP <= 0) {
        addLog("❌ Questo mostro è KO e non può combattere!");
        return;
    }
    
    // Set up battle monsters with safe number parsing
    game.battle.playerMonster = {
        name: playerMonster.name,
        sprite: playerMonster.sprite,
        level: parseInt(playerMonster.level) || 1,
        hp: currentHP, // Use current HP, not max HP
        maxHP: maxHP,
        attack: parseInt(playerMonster.attack) || parseInt(playerMonster.baseAttack) || 20,
        defense: parseInt(playerMonster.defense) || parseInt(playerMonster.baseDefense) || 15,
        captureDate: playerMonster.captureDate,
        originalIndex: monsterIndex // Track which monster this is
    };
    
    game.battle.enemyMonster = {
        name: game.currentMonster.name,
        sprite: game.currentMonster.sprite,
        level: parseInt(game.currentMonster.level) || 1,
        hp: parseInt(game.currentMonster.hp) || parseInt(game.currentMonster.maxHP) || 30,
        maxHP: parseInt(game.currentMonster.maxHP) || 30,
        attack: parseInt(game.currentMonster.attack) || parseInt(game.currentMonster.baseAttack) || 20,
        defense: parseInt(game.currentMonster.defense) || parseInt(game.currentMonster.baseDefense) || 15
    };
    
    // Initialize battle state with safe numbers
    game.battle.playerHP = currentHP; // Start with current HP
    game.battle.enemyHP = parseInt(game.battle.enemyMonster.hp) || 0;
    game.battle.active = true;
    game.battle.turn = 'player';
    
    addLog(`⚔️ ${game.battle.playerMonster.name} (${currentHP}/${maxHP} HP) vs ${game.battle.enemyMonster.name}!`);
    showBattleScreen();
}

// Display the battle screen
function showBattleScreen() {
    const playerMonster = game.battle.playerMonster;
    const enemyMonster = game.battle.enemyMonster;
    
    const playerMaxHP = parseInt(playerMonster.maxHP) || parseInt(playerMonster.hp) || 100;
    const enemyMaxHP = parseInt(enemyMonster.maxHP) || parseInt(enemyMonster.hp) || 100;
    const playerCurrentHP = Math.max(0, parseInt(game.battle.playerHP) || 0);
    const enemyCurrentHP = Math.max(0, parseInt(game.battle.enemyHP) || 0);
    
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter battle-encounter">
            <h3>⚔️ Battaglia in Corso!</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                <div style="text-align: center; border: 2px solid #4CAF50; padding: 15px; border-radius: 10px;">
                    <h4 style="color: #4CAF50;">Il Tuo Mostro</h4>
                    <span style="font-size: 2.5em;">${playerMonster.sprite}</span>
                    <p><strong>${playerMonster.name}</strong> (Lv.${playerMonster.level || 1})</p>
                    <div style="background: #333; border-radius: 10px; padding: 5px; margin: 5px 0;">
                        <div style="background: ${playerCurrentHP > playerMaxHP * 0.5 ? '#4CAF50' : playerCurrentHP > playerMaxHP * 0.25 ? '#FF9800' : '#f44336'}; height: 8px; border-radius: 5px; width: ${Math.max(0, (playerCurrentHP / playerMaxHP) * 100)}%;"></div>
                    </div>
                    <small>HP: ${playerCurrentHP}/${playerMaxHP}</small><br>
                    <small>ATK: ${playerMonster.attack || 0} | DEF: ${playerMonster.defense || 0}</small>
                </div>
                
                <div style="text-align: center; border: 2px solid #ff6b6b; padding: 15px; border-radius: 10px;">
                    <h4 style="color: #ff6b6b;">Mostro Selvaggio</h4>
                    <span style="font-size: 2.5em;">${enemyMonster.sprite}</span>
                    <p><strong>${enemyMonster.name}</strong> (Lv.${enemyMonster.level || 1})</p>
                    <div style="background: #333; border-radius: 10px; padding: 5px; margin: 5px 0;">
                        <div style="background: ${enemyCurrentHP > enemyMaxHP * 0.5 ? '#4CAF50' : enemyCurrentHP > enemyMaxHP * 0.25 ? '#FF9800' : '#f44336'}; height: 8px; border-radius: 5px; width: ${Math.max(0, (enemyCurrentHP / enemyMaxHP) * 100)}%;"></div>
                    </div>
                    <small>HP: ${enemyCurrentHP}/${enemyMaxHP}</small><br>
                    <small>ATK: ${enemyMonster.attack || 0} | DEF: ${enemyMonster.defense || 0}</small>
                </div>
            </div>
            
            <div style="text-align: center; margin: 15px 0;">
                ${game.battle.turn === 'player' ? 
                    '<p style="color: #4CAF50;">🎯 Il tuo turno!</p>' : 
                    '<p style="color: #ff6b6b;">⏳ Turno del mostro...</p>'
                }
            </div>
            
            <div class="buttons">
                ${game.battle.turn === 'player' ? `
                    <button onclick="playerAttack()">⚔️ Attacca</button>
                    <button onclick="runFromBattle()">🏃 Scappa</button>
                ` : ''}
            </div>
        </div>
    `;
}

// Player attacks enemy
function playerAttack() {
    const playerMonster = game.battle.playerMonster;
    const enemyMonster = game.battle.enemyMonster;
    
    const playerAttackStat = parseInt(playerMonster.attack) || 30;
    const enemyDefense = parseInt(enemyMonster.defense) || 20;
    
    // Calculate damage with improved formula that accounts for level differences
    const playerLevel = parseInt(playerMonster.level) || 1;
    const enemyLevel = parseInt(enemyMonster.level) || 1;
    const levelDiff = playerLevel - enemyLevel;
    
    // Improved damage formula with better defense scaling
    // Base damage: attack * (1 - defense/(defense + attack))
    // This creates diminishing returns on defense while keeping it relevant
    const defenseEffectiveness = enemyDefense / (enemyDefense + playerAttackStat);
    let baseDamage = Math.max(1, Math.floor(playerAttackStat * (1 - defenseEffectiveness)));
    
    // Level advantage/disadvantage modifier (max ±50%)
    const levelModifier = Math.max(0.5, Math.min(1.5, 1 + (levelDiff * 0.1)));
    baseDamage = Math.floor(baseDamage * levelModifier);
    
    // Add some randomness (±20%)
    const randomFactor = 0.8 + (Math.random() * 0.4);
    const damage = Math.max(1, Math.floor(baseDamage * randomFactor));
    
    game.battle.enemyHP = Math.max(0, (parseInt(game.battle.enemyHP) || 0) - damage);
    
    addLog(`⚔️ ${playerMonster.name} attacca per ${damage} danni!`);
    
    // Check if enemy is defeated
    if (game.battle.enemyHP <= 0) {
        addLog(`🎉 ${enemyMonster.name} è stato sconfitto!`);
        setTimeout(() => endBattle('victory'), 500);
        return;
    }
    
    // Enemy's turn
    game.battle.turn = 'enemy';
    showBattleScreen();
    setTimeout(enemyAttack, 1500);
}

// Enemy attacks player
function enemyAttack() {
    const playerMonster = game.battle.playerMonster;
    const enemyMonster = game.battle.enemyMonster;
    
    const enemyAttackStat = parseInt(enemyMonster.attack) || 25;
    const playerDefense = parseInt(playerMonster.defense) || 20;
    
    // Calculate damage with improved formula that accounts for level differences
    const playerLevel = parseInt(playerMonster.level) || 1;
    const enemyLevel = parseInt(enemyMonster.level) || 1;
    const levelDiff = enemyLevel - playerLevel;
    
    // Improved damage formula with better defense scaling
    // Base damage: attack * (1 - defense/(defense + attack))
    // This creates diminishing returns on defense while keeping it relevant
    const defenseEffectiveness = playerDefense / (playerDefense + enemyAttackStat);
    let baseDamage = Math.max(1, Math.floor(enemyAttackStat * (1 - defenseEffectiveness)));
    
    // Level advantage/disadvantage modifier (max ±25%)
    const levelModifier = Math.max(0.25, Math.min(1.5, 1 + (levelDiff * 0.1)));
    baseDamage = Math.floor(baseDamage * levelModifier);
    
    // Add some randomness (±20%)
    const randomFactor = 0.8 + (Math.random() * 0.4);
    const damage = Math.max(1, Math.floor(baseDamage * randomFactor));
    
    game.battle.playerHP = Math.max(0, (parseInt(game.battle.playerHP) || 0) - damage);
    
    addLog(`💥 ${enemyMonster.name} attacca per ${damage} danni!`);
    
    // IMMEDIATELY update the actual monster's HP in the monsters array
    const playerMonsterIndex = game.battle.playerMonster.originalIndex;
    if (playerMonsterIndex !== undefined && game.monsters[playerMonsterIndex]) {
        game.monsters[playerMonsterIndex].hp = Math.max(0, parseInt(game.battle.playerHP) || 0);
        
        // Force update the display immediately so the collection shows correct HP
        updateDisplay();
    }
    
    // Check if current player monster is defeated
    if (game.battle.playerHP <= 0) {
        addLog(`💔 ${playerMonster.name} è stato sconfitto...`);
        
        // Check if player has any other monsters that can fight
        if (hasAvailableMonsters()) {
            addLog("🔄 Devi mandare un altro mostro in battaglia!");
            game.battle.selectedMonster = null; // Reset selection
            setTimeout(() => showMonsterSelection(true), 1000); // Show switch screen
        } else {
            // Game over - all monsters are defeated
            setTimeout(() => gameOver(), 1000);
        }
    } else {
        // Player's turn
        game.battle.turn = 'player';
        showBattleScreen();
    }
}

// Game over function - reset the game
function gameOver() {
    game.battle.active = false;
    
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
                <p>👹 Mostri Catturati: <strong>${game.monsters.length}</strong></p>
                <p>💰 Monete Guadagnate: <strong>${game.player.money}</strong></p>
            </div>
            <div class="buttons">
                <button onclick="resetGame()" style="background: linear-gradient(45deg, #4CAF50, #2E7D32);">
                    🔄 Ricomincia Avventura
                </button>
            </div>
        </div>
    `;
    
    addLog(`💀 GAME OVER! Raggiunto il piano ${game.currentFloor} con ${game.monsters.length} mostri!`);
}

// Reset the entire game
function resetGame() {
    // Reset all game state
    game.player.money = 100;
    game.player.pokeballs = 3;
    game.currentFloor = 1;
    game.battlesThisBlock = 0;
    game.monsters = [];
    game.currentMonster = null;
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
}

// End battle with result
function endBattle(result) {
    if (!game.battle.active) return;
    
    game.battle.active = false;
    
    // Update player monster's HP after battle and force UI update
    const playerMonsterIndex = game.battle.playerMonster.originalIndex;
    if (playerMonsterIndex !== undefined && game.monsters[playerMonsterIndex]) {
        game.monsters[playerMonsterIndex].hp = Math.max(0, parseInt(game.battle.playerHP) || 0);
        addLog(`📊 ${game.monsters[playerMonsterIndex].name} termina con ${game.monsters[playerMonsterIndex].hp} HP`);
        
        // Force update display to show correct HP values
        updateDisplay();
    }
    
    if (result === 'victory') {
        // Calculate rewards with safe number operations
        const enemyExpValue = parseInt(game.battle.enemyMonster.expValue) || parseInt(game.currentMonster.expValue) || 10;
        const moneyReward = Math.floor(enemyExpValue * 1.2);
        const expReward = enemyExpValue;
        
        // Give rewards with safe number operations
        game.player.money = Math.max(0, parseInt(game.player.money) || 0);
        game.player.money += moneyReward;
        
        // Give EXP to all monsters (not just the one that fought)
        game.monsters.forEach(monster => {
            giveMonsterExp(monster, expReward);
        });
        
        // Special boss victory healing
        const isBoss = game.currentFloor % 10 === 0;
        if (isBoss) {
            game.monsters.forEach(monster => {
                monster.hp = parseInt(monster.maxHP) || parseInt(monster.baseHP) || 30;
            });
            addLog(`👑 Vittoria boss! Tutta la squadra è stata curata completamente!`);
        }
        
        addLog(`🎉 Vittoria! +${moneyReward} monete, +${expReward} EXP a tutti i mostri!`);
        
        // Make enemy easier to catch
        if (game.currentMonster) {
            game.currentMonster.catchRate = Math.min(90, (parseInt(game.currentMonster.catchRate) || 50) + 25);
            // Restore enemy to full HP for catching
            game.currentMonster.hp = parseInt(game.currentMonster.maxHP) || 30;
            // Mark as defeated in battle to prevent double money
            game.currentMonster._defeatedInBattle = true;
        }
        document.getElementById('encounter-area').innerHTML = `
            <div class="encounter">
                <h3 style="color: #4CAF50;">🏆 Vittoria!</h3>
                <span class="monster-sprite">${game.battle.enemyMonster.sprite}</span>
                <h4>${game.battle.enemyMonster.name} Lv.${game.battle.enemyMonster.level} è stato sconfitto!</h4>
                <p style="color: #4CAF50; margin: 15px 0;">Il mostro è indebolito e più facile da catturare!</p>
                ${isBoss ? '<p style="color: #ffd700;">👑 Boss sconfitto! Squadra curata!</p>' : ''}
                <p style="color: #ffd700;">💰 +${moneyReward} monete</p>
                <p style="color: #4CAF50;">🌟 +${expReward} EXP a tutti i mostri!</p>
                <p style="color: #E91E63; font-size: 0.9em;">🎯 Probabilità di cattura: ${calculateCatchChance(game.currentMonster)}%</p>
                ${isBoss ? '<p style="color: #f44336; font-weight: bold;">⚠️ Boss! Hai solo una possibilità di cattura!</p>' : ''}
                <div class="buttons">
                    <button onclick="attemptCatch()">🎯 Cattura Ora!</button>
                    <button onclick="advanceFloor()">➡️ Avanza Piano ${game.currentFloor + 1}</button>
                </div>
            </div>
        `;
    }
    
    updateDisplay();
}

// Run from battle
function runFromBattle() {
    game.battle.active = false;
    
    // Update player monster's HP when running away and force UI update
    const playerMonsterIndex = game.battle.playerMonster.originalIndex;
    if (playerMonsterIndex !== undefined && game.monsters[playerMonsterIndex]) {
        game.monsters[playerMonsterIndex].hp = Math.max(0, parseInt(game.battle.playerHP) || 0);
        
        // Force update display to show correct HP values
        updateDisplay();
    }
    
    addLog("🏃 Sei scappato dalla battaglia.");
    runAway();
}

// Go back to encounter (from monster selection)
function backToEncounter() {
    explore(); // Re-trigger the current encounter
}