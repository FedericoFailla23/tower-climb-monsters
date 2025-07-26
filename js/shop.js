// Enhanced shop.js with evolution guide

// Spawn shop encounter
function spawnShop() {
    const floorBlock = Math.floor((game.currentFloor - 1) / 10) + 1;
    const pokeballPrice = 25 + (floorBlock - 1) * 25;
    const healPrice = 50 + (floorBlock - 1) * 50;
    
    // Ensure player money is a valid number
    const currentMoney = Math.max(0, parseInt(game.player.money) || 0);
    
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter shop-encounter">
            <h3 style="color: #4CAF50;">🏪 Negozio - Piano ${game.currentFloor}</h3>
            <span class="monster-sprite">🏪</span>
            <h4>Mercante Itinerante</h4>
            <p style="color: #4CAF50;">Benvenuto! Cosa posso offrirti oggi?</p>
            <p style="color: #ffd700;">💰 Il tuo denaro: ${currentMoney} monete</p>
            
            <div style="text-align: left; margin: 20px 0;">
                <div class="shop-item">
                    <div class="shop-item-info">
                        <strong>🎯 Pokeball</strong> - ${pokeballPrice} monete
                        <br><small>Necessarie per catturare i mostri</small>
                    </div>
                    <button onclick="buyPokeball(${pokeballPrice})" class="shop-buy-btn" ${currentMoney < pokeballPrice ? 'disabled' : ''}>
                        Compra
                    </button>
                </div>
                
                <div class="shop-item">
                    <div class="shop-item-info">
                        <strong>💚 Cura Mostri</strong> - ${healPrice} monete
                        <br><small>Ripristina completamente la salute di tutti i mostri</small>
                    </div>
                    <button onclick="healMonsters(${healPrice})" class="shop-buy-btn" ${currentMoney < healPrice || game.monsters.length === 0 ? 'disabled' : ''}>
                        Compra
                    </button>
                </div>
                
                <div class="shop-item">
                    <div class="shop-item-info">
                        <strong>📊 Info Squadra</strong> - Gratis
                        <br><small>Mostra statistiche dettagliate dei tuoi mostri</small>
                    </div>
                    <button onclick="showTeamStats()" class="shop-buy-btn" ${game.monsters.length === 0 ? 'disabled' : ''}>
                        Visualizza
                    </button>
                </div>
                
                <div class="shop-item">
                    <div class="shop-item-info">
                        <strong>✨ Guida Evoluzioni</strong> - Gratis
                        <br><small>Scopri tutte le linee evolutive disponibili</small>
                    </div>
                    <button onclick="showEvolutionGuide()" class="shop-buy-btn">
                        Visualizza
                    </button>
                </div>
            </div>
            
            <div class="buttons">
                <button onclick="advanceFloor()">➡️ Prosegui al Piano ${game.currentFloor + 1}</button>
            </div>
        </div>
    `;
    
    addLog(`🏪 Hai trovato un negozio al piano ${game.currentFloor}!`);
}

// Buy a pokeball
function buyPokeball(price) {
    // Ensure safe number operations
    const safePrice = Math.max(0, parseInt(price) || 0);
    const currentMoney = Math.max(0, parseInt(game.player.money) || 0);
    const currentPokeballs = Math.max(0, parseInt(game.player.pokeballs) || 0);
    
    if (currentMoney >= safePrice) {
        game.player.money = currentMoney - safePrice;
        game.player.pokeballs = currentPokeballs + 1;
        addLog(`🎯 Hai comprato una Pokeball per ${safePrice} monete!`);
        spawnShop(); // Refresh shop display
        updateDisplay();
    } else {
        addLog("❌ Non hai abbastanza denaro!");
    }
}

// Heal all monsters
function healMonsters(price) {
    // Ensure safe number operations
    const safePrice = Math.max(0, parseInt(price) || 0);
    const currentMoney = Math.max(0, parseInt(game.player.money) || 0);
    
    if (currentMoney >= safePrice && game.monsters.length > 0) {
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
            game.player.money = currentMoney - safePrice;
            addLog(`💚 ${healedCount} mostri sono stati curati per ${safePrice} monete!`);
        } else {
            addLog(`💚 Tutti i mostri erano già in perfetta salute! Rimborso di ${safePrice} monete.`);
            // No money deduction if no healing needed
        }
        
        spawnShop(); // Refresh shop display
        updateDisplay();
    } else if (game.monsters.length === 0) {
        addLog("❌ Non hai mostri da curare!");
    } else {
        addLog("❌ Non hai abbastanza denaro!");
    }
}

// Show detailed team statistics with evolution information
function showTeamStats() {
    if (game.monsters.length === 0) {
        addLog("❌ Non hai mostri nella squadra!");
        return;
    }
    
    let statsHtml = '';
    let totalLevel = 0;
    let totalHP = 0;
    let totalMaxHP = 0;
    let evolutionReadyCount = 0;
    
    // Group monsters by evolution line for better display
    const evolutionGroups = {};
    game.monsters.forEach(monster => {
        if (!evolutionGroups[monster.evolutionLine]) {
            evolutionGroups[monster.evolutionLine] = [];
        }
        evolutionGroups[monster.evolutionLine].push(monster);
    });
    
    Object.keys(evolutionGroups).forEach(evolutionLine => {
        const monsters = evolutionGroups[evolutionLine];
        
        statsHtml += `
            <div style="border: 2px solid rgba(255,215,0,0.3); margin: 15px 0; padding: 15px; border-radius: 12px; background: rgba(255,215,0,0.05);">
                <h5 style="color: #ffd700; margin-bottom: 15px; text-transform: capitalize;">
                    🔗 Linea ${evolutionLine.charAt(0).toUpperCase() + evolutionLine.slice(1)}
                </h5>
        `;
        
        monsters.forEach(monster => {
            const level = parseInt(monster.level) || 1;
            const hp = parseInt(monster.hp) || parseInt(monster.baseHP) || 0;
            const maxHP = parseInt(monster.maxHP) || parseInt(monster.baseHP) || 0;
            const attack = parseInt(monster.attack) || parseInt(monster.baseAttack) || 0;
            const defense = parseInt(monster.defense) || parseInt(monster.baseDefense) || 0;
            const exp = parseInt(monster.exp) || 0;
            const expToNext = parseInt(monster.expToNext) || 50;
            
            totalLevel += level;
            totalHP += hp;
            totalMaxHP += maxHP;
            
            const hpPercentage = maxHP > 0 ? (hp / maxHP) * 100 : 100;
            const expPercentage = expToNext > 0 ? (exp / expToNext) * 100 : 0;
            
            const canEvolveNow = canEvolve(monster);
            if (canEvolveNow) evolutionReadyCount++;
            
            const stage = monster.stage || 1;
            const stageIndicator = stage === 2 ? '⭐' : '';
            
            statsHtml += `
                <div style="border: 1px solid rgba(255,255,255,0.3); margin: 10px 0; padding: 15px; border-radius: 8px; background: rgba(255,255,255,0.05);">
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                        <span style="font-size: 2.5em;">${monster.sprite}</span>
                        <div>
                            <h4 style="margin: 0;">${monster.name} ${stageIndicator} <span style="color: #ffd700;">Lv.${level}</span></h4>
                            <small style="color: #ccc;">${monster.rarity}${stage === 2 ? ' (Evoluto)' : ''}</small>
                            ${canEvolveNow ? '<br><small style="color: #ffd700;">✨ Pronto per evolversi!</small>' : ''}
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9em;">
                        <div>
                            <strong>💖 HP:</strong> ${hp}/${maxHP} (${hpPercentage.toFixed(1)}%)
                            <div style="background: #333; height: 6px; border-radius: 3px; margin: 2px 0;">
                                <div style="background: ${hpPercentage > 50 ? '#4CAF50' : hpPercentage > 25 ? '#FF9800' : '#f44336'}; height: 100%; width: ${hpPercentage}%; border-radius: 3px;"></div>
                            </div>
                        </div>
                        <div>
                            <strong>⭐ EXP:</strong> ${exp}/${expToNext} (${expPercentage.toFixed(1)}%)
                            <div style="background: #333; height: 6px; border-radius: 3px; margin: 2px 0;">
                                <div style="background: #2196F3; height: 100%; width: ${expPercentage}%; border-radius: 3px;"></div>
                            </div>
                        </div>
                        <div><strong>⚔️ ATK:</strong> ${attack}</div>
                        <div><strong>🛡️ DEF:</strong> ${defense}</div>
                    </div>
                </div>
            `;
        });
        
        statsHtml += '</div>';
    });
    
    const avgLevel = totalLevel > 0 ? (totalLevel / game.monsters.length).toFixed(1) : "0";
    const teamHP = totalMaxHP > 0 ? ((totalHP / totalMaxHP) * 100).toFixed(1) : "0";
    const uniqueCaught = getUniqueMonsterschaught();
    const totalAvailable = getTotalAvailableMonsters();
    
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter">
            <h3 style="color: #2196F3;">📊 Statistiche Squadra</h3>
            <span class="monster-sprite">📋</span>
            
            <div style="margin: 20px 0; padding: 15px; background: rgba(33, 150, 243, 0.1); border-radius: 8px;">
                <h4 style="color: #2196F3; margin-bottom: 10px;">📈 Riassunto Squadra</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; text-align: center;">
                    <div>
                        <strong>👹 Attivi</strong><br>
                        <span style="font-size: 1.3em; color: #4CAF50;">${game.monsters.length}</span>
                    </div>
                    <div>
                        <strong>🎯 Specie</strong><br>
                        <span style="font-size: 1.3em; color: #ffd700;">${uniqueCaught}/${totalAvailable}</span>
                    </div>
                    <div>
                        <strong>📊 Lv Medio</strong><br>
                        <span style="font-size: 1.3em; color: #2196F3;">${avgLevel}</span>
                    </div>
                    <div>
                        <strong>💖 Salute</strong><br>
                        <span style="font-size: 1.3em; color: ${teamHP > 75 ? '#4CAF50' : teamHP > 50 ? '#FF9800' : '#f44336'};">${teamHP}%</span>
                    </div>
                </div>
                ${evolutionReadyCount > 0 ? `
                    <div style="margin-top: 15px; padding: 10px; background: rgba(255,215,0,0.2); border-radius: 8px; text-align: center;">
                        <strong style="color: #ffd700;">✨ ${evolutionReadyCount} mostro${evolutionReadyCount > 1 ? 'i' : ''} pronto per evolversi!</strong>
                    </div>
                ` : ''}
            </div>
            
            <div style="max-height: 400px; overflow-y: auto;">
                ${statsHtml}
            </div>
            
            <div class="buttons">
                <button onclick="spawnShop()">↩️ Torna al Negozio</button>
            </div>
        </div>
    `;
    
    addLog(`📊 Statistiche squadra visualizzate! ${evolutionReadyCount > 0 ? `${evolutionReadyCount} evoluzione${evolutionReadyCount > 1 ? 'i' : ''} disponibile!` : ''}`);
}