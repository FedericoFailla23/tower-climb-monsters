// Spawn shop encounter
function spawnShop() {
    const pokeballPrice = Math.max(10, Math.floor(game.currentFloor / 5) * 5 + 10);
    const healPrice = Math.max(5, Math.floor(game.currentFloor / 10) * 5 + 5);
    
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

// Show detailed team statistics
function showTeamStats() {
    if (game.monsters.length === 0) {
        addLog("❌ Non hai mostri nella squadra!");
        return;
    }
    
    let statsHtml = '';
    let totalLevel = 0;
    let totalHP = 0;
    let totalMaxHP = 0;
    
    game.monsters.forEach((monster, index) => {
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
        
        statsHtml += `
            <div style="border: 1px solid rgba(255,255,255,0.3); margin: 10px 0; padding: 15px; border-radius: 8px; background: rgba(255,255,255,0.05);">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                    <span style="font-size: 2.5em;">${monster.sprite}</span>
                    <div>
                        <h4 style="margin: 0;">${monster.name} <span style="color: #ffd700;">Lv.${level}</span></h4>
                        <small style="color: #ccc;">${monster.rarity}</small>
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
    
    const avgLevel = totalLevel > 0 ? (totalLevel / game.monsters.length).toFixed(1) : "0";
    const teamHP = totalMaxHP > 0 ? ((totalHP / totalMaxHP) * 100).toFixed(1) : "0";
    
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter">
            <h3 style="color: #2196F3;">📊 Statistiche Squadra</h3>
            <span class="monster-sprite">📋</span>
            
            <div style="margin: 20px 0; padding: 15px; background: rgba(33, 150, 243, 0.1); border-radius: 8px;">
                <h4 style="color: #2196F3; margin-bottom: 10px;">📈 Riassunto Squadra</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; text-align: center;">
                    <div>
                        <strong>👹 Mostri</strong><br>
                        <span style="font-size: 1.5em; color: #4CAF50;">${game.monsters.length}</span>
                    </div>
                    <div>
                        <strong>📊 Livello Medio</strong><br>
                        <span style="font-size: 1.5em; color: #ffd700;">${avgLevel}</span>
                    </div>
                    <div>
                        <strong>💖 Salute Squadra</strong><br>
                        <span style="font-size: 1.5em; color: ${teamHP > 75 ? '#4CAF50' : teamHP > 50 ? '#FF9800' : '#f44336'};">${teamHP}%</span>
                    </div>
                </div>
            </div>
            
            <div style="max-height: 300px; overflow-y: auto;">
                ${statsHtml}
            </div>
            
            <div class="buttons">
                <button onclick="spawnShop()">↩️ Torna al Negozio</button>
            </div>
        </div>
    `;
    
    addLog(`📊 Statistiche squadra visualizzate!`);
}