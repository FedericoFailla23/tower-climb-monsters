// Show monster selection for battle
function showMonsterSelection() {
    let monsterOptions = '';
    
    game.monsters.forEach((monster, index) => {
        const isSelected = game.battle.selectedMonster === index;
        const level = parseInt(monster.level) || 1;
        const hp = parseInt(monster.hp) || parseInt(monster.baseHP) || 0;
        const maxHP = parseInt(monster.maxHP) || parseInt(monster.baseHP) || 0;
        const attack = parseInt(monster.attack) || parseInt(monster.baseAttack) || 0;
        const defense = parseInt(monster.defense) || parseInt(monster.baseDefense) || 0;
        
        // Show if monster is unable to fight
        const canFight = hp > 0;
        const statusText = canFight ? 'Pronto' : 'KO';
        const statusColor = canFight ? '#4CAF50' : '#f44336';
        
        monsterOptions += `
            <div onclick="${canFight ? `selectMonster(${index})` : ''}" style="
                cursor: ${canFight ? 'pointer' : 'not-allowed'};
                border: 2px solid ${isSelected ? '#4CAF50' : (canFight ? 'rgba(255,255,255,0.3)' : '#f44336')};
                background: ${isSelected ? 'rgba(76,175,80,0.2)' : (canFight ? 'rgba(255,255,255,0.1)' : 'rgba(244,67,54,0.1)')};
                margin: 8px 0;
                padding: 12px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 15px;
                transition: all 0.3s ease;
                opacity: ${canFight ? '1' : '0.6'};
            ">
                <span style="font-size: 2em;">${monster.sprite}</span>
                <div style="flex: 1;">
                    <strong>${monster.name}</strong> <span style="color: #ffd700;">Lv.${level}</span><br>
                    <small style="color: #ccc;">HP: ${hp}/${maxHP} | ATK: ${attack} | DEF: ${defense}</small>
                </div>
                ${isSelected ? '<span style="color: #4CAF50;">✓ Selezionato</span>' : 
                  `<span style="color: ${statusColor};">${statusText}</span>`}
            </div>
        `;
    });
    
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter">
            <h3>👥 Scegli il Tuo Mostro da Battaglia</h3>
            <p style="margin: 15px 0; color: #ccc;">Seleziona quale mostro mandare in battaglia:</p>
            
            <div style="max-height: 250px; overflow-y: auto; margin: 15px 0;">
                ${monsterOptions}
            </div>
            
            <div class="buttons">
                <button onclick="confirmMonsterAndBattle()" ${game.battle.selectedMonster === null ? 'disabled' : ''}>
                    ⚔️ Inizia Battaglia
                </button>
                <button onclick="backToEncounter()">↩️ Torna Indietro</button>
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
    
    game.battle.selectedMonster = index;
    showMonsterSelection(); // Refresh to show selection
    addLog(`👥 Hai selezionato ${game.monsters[index].name} per la battaglia!`);
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
                        <div style="background: #ff6b6b; height: 8px; border-radius: 5px; width: ${Math.max(0, (enemyCurrentHP / enemyMaxHP) * 100)}%;"></div>
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
                    <button onclick="attemptCatch()">🎯 Lancia Pokeball</button>
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
    
    // Calculate damage with safe number operations
    const damage = Math.max(1, Math.floor(playerAttackStat - enemyDefense / 2 + Math.random() * 10));
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
    
    // Calculate damage with safe number operations
    const damage = Math.max(1, Math.floor(enemyAttackStat - playerDefense / 2 + Math.random() * 8));
    game.battle.playerHP = Math.max(0, (parseInt(game.battle.playerHP) || 0) - damage);
    
    addLog(`💥 ${enemyMonster.name} attacca per ${damage} danni!`);
    
    // Check if player is defeated
    if (game.battle.playerHP <= 0) {
        endBattle('defeat');
    } else {
        // Player's turn
        game.battle.turn = 'player';
        showBattleScreen();
    }
}

// End battle with result
function endBattle(result) {
    if (!game.battle.active) return;
    
    game.battle.active = false;
    
    // Update player monster's HP after battle
    const playerMonsterIndex = game.battle.playerMonster.originalIndex;
    if (playerMonsterIndex !== undefined && game.monsters[playerMonsterIndex]) {
        game.monsters[playerMonsterIndex].hp = Math.max(0, parseInt(game.battle.playerHP) || 0);
        addLog(`📊 ${game.monsters[playerMonsterIndex].name} termina con ${game.monsters[playerMonsterIndex].hp} HP`);
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
        }
        
        document.getElementById('encounter-area').innerHTML = `
            <div class="encounter">
                <h3 style="color: #4CAF50;">🏆 Vittoria!</h3>
                <span class="monster-sprite">${game.battle.enemyMonster.sprite}</span>
                <h4>${game.battle.enemyMonster.name} è stato sconfitto!</h4>
                <p style="color: #4CAF50; margin: 15px 0;">Il mostro è indebolito e più facile da catturare!</p>
                ${isBoss ? '<p style="color: #ffd700;">👑 Boss sconfitto! Squadra curata!</p>' : ''}
                <p style="color: #ffd700;">💰 +${moneyReward} monete</p>
                <p style="color: #4CAF50;">🌟 +${expReward} EXP a tutti i mostri!</p>
                <div class="buttons">
                    <button onclick="attemptCatch()">🎯 Cattura Ora! (+25% successo)</button>
                    <button onclick="advanceFloor()">➡️ Avanza Piano ${game.currentFloor + 1}</button>
                </div>
            </div>
        `;
    } else {
        // Defeat
        addLog(`💔 ${game.battle.playerMonster.name} è stato sconfitto...`);
        
        document.getElementById('encounter-area').innerHTML = `
            <div class="encounter">
                <h3 style="color: #ff6b6b;">💔 Sconfitta...</h3>
                <span class="monster-sprite" style="opacity: 0.5;">😵</span>
                <h4>${game.battle.playerMonster.name} è stato sconfitto!</h4>
                <p style="color: #ff6b6b; margin: 15px 0;">Il tuo mostro è KO e ha bisogno di cure!</p>
                <p style="color: #ccc; font-size: 0.9em;">Visita un negozio per curarlo o trova un'area di riposo!</p>
                <div class="buttons">
                    <button onclick="advanceFloor()">➡️ Ritirata - Piano ${game.currentFloor + 1}</button>
                </div>
            </div>
        `;
        
        game.currentMonster = null;
    }
    
    updateDisplay();
}

// Run from battle
function runFromBattle() {
    game.battle.active = false;
    
    // Update player monster's HP when running away
    const playerMonsterIndex = game.battle.playerMonster.originalIndex;
    if (playerMonsterIndex !== undefined && game.monsters[playerMonsterIndex]) {
        game.monsters[playerMonsterIndex].hp = Math.max(0, parseInt(game.battle.playerHP) || 0);
    }
    
    addLog("🏃 Sei scappato dalla battaglia.");
    runAway();
}

// Go back to encounter (from monster selection)
function backToEncounter() {
    explore(); // Re-trigger the current encounter
}