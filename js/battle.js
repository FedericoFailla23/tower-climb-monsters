// Show monster selection for battle
function showMonsterSelection() {
    let monsterOptions = '';
    
    game.monsters.forEach((monster, index) => {
        const isSelected = game.battle.selectedMonster === index;
        const level = monster.level || 1;
        const hp = monster.hp || monster.baseHP || 0;
        const maxHP = monster.maxHP || monster.baseHP || 0;
        const attack = monster.attack || monster.baseAttack || 0;
        const defense = monster.defense || monster.baseDefense || 0;
        
        monsterOptions += `
            <div onclick="selectMonster(${index})" style="
                cursor: pointer;
                border: 2px solid ${isSelected ? '#4CAF50' : 'rgba(255,255,255,0.3)'};
                background: ${isSelected ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.1)'};
                margin: 8px 0;
                padding: 12px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 15px;
                transition: all 0.3s ease;
            ">
                <span style="font-size: 2em;">${monster.sprite}</span>
                <div style="flex: 1;">
                    <strong>${monster.name}</strong> <span style="color: #ffd700;">Lv.${level}</span><br>
                    <small style="color: #ccc;">HP: ${hp}/${maxHP} | ATK: ${attack} | DEF: ${defense}</small>
                </div>
                ${isSelected ? '<span style="color: #4CAF50;">✓ Selezionato</span>' : '<span style="color: #888;">Clicca per selezionare</span>'}
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
    startBattleWithMonster(game.battle.selectedMonster);
}

// Start battle with selected monster
function startBattleWithMonster(monsterIndex) {
    const playerMonster = game.monsters[monsterIndex];
    
    // Ensure monster has HP
    if (!playerMonster.hp || playerMonster.hp <= 0) {
        playerMonster.hp = playerMonster.maxHP || playerMonster.baseHP;
    }
    
    // Set up battle monsters
    game.battle.playerMonster = {
        name: playerMonster.name,
        sprite: playerMonster.sprite,
        level: playerMonster.level || 1,
        hp: playerMonster.hp,
        maxHP: playerMonster.maxHP || playerMonster.baseHP,
        attack: playerMonster.attack || playerMonster.baseAttack,
        defense: playerMonster.defense || playerMonster.baseDefense,
        captureDate: playerMonster.captureDate
    };
    
    game.battle.enemyMonster = {
        name: game.currentMonster.name,
        sprite: game.currentMonster.sprite,
        level: game.currentMonster.level,
        hp: game.currentMonster.hp,
        maxHP: game.currentMonster.maxHP,
        attack: game.currentMonster.attack,
        defense: game.currentMonster.defense
    };
    
    // Initialize battle state
    game.battle.playerHP = game.battle.playerMonster.hp;
    game.battle.enemyHP = game.battle.enemyMonster.hp;
    game.battle.active = true;
    game.battle.turn = 'player';
    
    addLog(`⚔️ ${game.battle.playerMonster.name} (Lv.${game.battle.playerMonster.level}) vs ${game.battle.enemyMonster.name} (Lv.${game.battle.enemyMonster.level})!`);
    showBattleScreen();
}

// Display the battle screen
function showBattleScreen() {
    const playerMonster = game.battle.playerMonster;
    const enemyMonster = game.battle.enemyMonster;
    
    const playerMaxHP = playerMonster.maxHP || playerMonster.hp || 100;
    const enemyMaxHP = enemyMonster.maxHP || enemyMonster.hp || 100;
    const playerCurrentHP = game.battle.playerHP || 0;
    const enemyCurrentHP = game.battle.enemyHP || 0;
    
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter battle-encounter">
            <h3>⚔️ Battaglia in Corso!</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                <div style="text-align: center; border: 2px solid #4CAF50; padding: 15px; border-radius: 10px;">
                    <h4 style="color: #4CAF50;">Il Tuo Mostro</h4>
                    <span style="font-size: 2.5em;">${playerMonster.sprite}</span>
                    <p><strong>${playerMonster.name}</strong> (Lv.${playerMonster.level || 1})</p>
                    <div style="background: #333; border-radius: 10px; padding: 5px; margin: 5px 0;">
                        <div style="background: #4CAF50; height: 8px; border-radius: 5px; width: ${Math.max(0, (playerCurrentHP / playerMaxHP) * 100)}%;"></div>
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
    
    const playerAttackStat = playerMonster.attack || 30;
    const enemyDefense = enemyMonster.defense || 20;
    
    // Calculate damage
    const damage = Math.max(1, Math.floor(playerAttackStat - enemyDefense / 2 + Math.random() * 10));
    game.battle.enemyHP = Math.max(0, game.battle.enemyHP - damage);
    
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
    
    const enemyAttackStat = enemyMonster.attack || 25;
    const playerDefense = playerMonster.defense || 20;
    
    // Calculate damage
    const damage = Math.max(1, Math.floor(enemyAttackStat - playerDefense / 2 + Math.random() * 8));
    game.battle.playerHP = Math.max(0, game.battle.playerHP - damage);
    
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
    
    if (result === 'victory') {
        // Calculate rewards
        const moneyReward = Math.floor(game.battle.enemyMonster.expValue * 1.2);
        const expReward = game.battle.enemyMonster.expValue;
        
        // Give rewards
        game.player.money += moneyReward;
        game.monsters.forEach(monster => {
            giveMonsterExp(monster, expReward);
        });
        
        addLog(`🎉 Vittoria! +${moneyReward} monete, +${expReward} EXP a tutti i mostri!`);
        
        // Make enemy easier to catch
        if (game.currentMonster) {
            game.currentMonster.catchRate = Math.min(90, game.currentMonster.catchRate + 25);
        }
        
        document.getElementById('encounter-area').innerHTML = `
            <div class="encounter">
                <h3 style="color: #4CAF50;">🏆 Vittoria!</h3>
                <span class="monster-sprite">${game.battle.enemyMonster.sprite}</span>
                <h4>${game.battle.enemyMonster.name} è stato sconfitto!</h4>
                <p style="color: #4CAF50; margin: 15px 0;">Il mostro è indebolito e più facile da catturare!</p>
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
                <p style="color: #ff6b6b; margin: 15px 0;">Il tuo mostro ha bisogno di riposo...</p>
                <p style="color: #ccc; font-size: 0.9em;">Forse dovresti visitare un negozio per curarlo!</p>
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
    addLog("🏃 Sei scappato dalla battaglia.");
    runAway();
}

// Go back to encounter (from monster selection)
function backToEncounter() {
    explore(); // Re-trigger the current encounter
}