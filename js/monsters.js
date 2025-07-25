// Monster database with base stats
const monsterData = [
    { name: "Fiammella", sprite: "🔥", rarity: "Comune", catchRate: 75, expValue: 30, baseHP: 45, baseAttack: 35, baseDefense: 25 },
    { name: "Gocciolina", sprite: "💧", rarity: "Comune", catchRate: 75, expValue: 30, baseHP: 50, baseAttack: 30, baseDefense: 30 },
    { name: "Fogliolino", sprite: "🌿", rarity: "Comune", catchRate: 75, expValue: 30, baseHP: 55, baseAttack: 25, baseDefense: 35 },
    { name: "Sassetto", sprite: "🗿", rarity: "Non Comune", catchRate: 55, expValue: 60, baseHP: 70, baseAttack: 45, baseDefense: 55 },
    { name: "Scintilla", sprite: "⚡", rarity: "Non Comune", catchRate: 55, expValue: 60, baseHP: 60, baseAttack: 55, baseDefense: 35 },
    { name: "Cristallo", sprite: "❄️", rarity: "Non Comune", catchRate: 55, expValue: 60, baseHP: 65, baseAttack: 50, baseDefense: 45 },
    { name: "Fantasma", sprite: "👻", rarity: "Raro", catchRate: 35, expValue: 120, baseHP: 80, baseAttack: 70, baseDefense: 40 },
    { name: "Drago Stellare", sprite: "🐉", rarity: "Leggendario", catchRate: 15, expValue: 250, baseHP: 120, baseAttack: 95, baseDefense: 75 }
];

// Create a scaled monster based on level
function createScaledMonster(baseMonster, level) {
    const scaledMonster = {
        name: baseMonster.name,
        sprite: baseMonster.sprite,
        rarity: baseMonster.rarity,
        catchRate: baseMonster.catchRate,
        expValue: baseMonster.expValue,
        baseHP: baseMonster.baseHP,
        baseAttack: baseMonster.baseAttack,
        baseDefense: baseMonster.baseDefense,
        level: level
    };
    
    // Calculate stats based on level
    const levelBonus = level - 1;
    scaledMonster.maxHP = baseMonster.baseHP + Math.floor(levelBonus * (baseMonster.baseHP * 0.1));
    scaledMonster.hp = scaledMonster.maxHP;
    scaledMonster.attack = baseMonster.baseAttack + Math.floor(levelBonus * (baseMonster.baseAttack * 0.15));
    scaledMonster.defense = baseMonster.baseDefense + Math.floor(levelBonus * (baseMonster.baseDefense * 0.1));
    
    // Scale EXP reward based on level
    scaledMonster.expValue = Math.floor(baseMonster.expValue * (1 + (level - 1) * 0.2));
    
    // Slightly reduce catch rate for higher level monsters
    scaledMonster.catchRate = Math.max(5, baseMonster.catchRate - (level - 1) * 2);
    
    return scaledMonster;
}

// Initialize a new caught monster
function initializeMonster(baseMonster) {
    const newMonster = {
        name: baseMonster.name,
        sprite: baseMonster.sprite,
        rarity: baseMonster.rarity,
        catchRate: baseMonster.catchRate,
        expValue: baseMonster.expValue,
        baseHP: baseMonster.baseHP,
        baseAttack: baseMonster.baseAttack,
        baseDefense: baseMonster.baseDefense,
        level: 1,
        exp: 0,
        expToNext: 50,
        captureDate: Date.now()
    };
    
    // Set initial stats
    newMonster.maxHP = newMonster.baseHP;
    newMonster.hp = newMonster.baseHP;
    newMonster.attack = newMonster.baseAttack;
    newMonster.defense = newMonster.baseDefense;
    
    return newMonster;
}

// Give experience to a monster
function giveMonsterExp(monster, expAmount) {
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
    
    monster.exp += expAmount;
    
    // Level up loop
    while (monster.exp >= monster.expToNext) {
        monster.exp -= monster.expToNext;
        monster.level++;
        monster.expToNext = Math.floor(monster.expToNext * 1.2);
        
        // Calculate new stats
        const levelBonus = monster.level - 1;
        const oldMaxHP = monster.maxHP;
        const wasFullHP = (monster.hp === oldMaxHP);
        
        monster.maxHP = monster.baseHP + Math.floor(levelBonus * (monster.baseHP * 0.1));
        monster.attack = monster.baseAttack + Math.floor(levelBonus * (monster.baseAttack * 0.15));
        monster.defense = monster.baseDefense + Math.floor(levelBonus * (monster.baseDefense * 0.1));
        
        // If monster was at full health, keep it at full health
        if (wasFullHP) {
            monster.hp = monster.maxHP;
        }
        
        addLog(`🎊 ${monster.name} è salito al livello ${monster.level}!`);
    }
}

// Spawn different types of monsters
function spawnGuaranteedCatch() {
    const commonMonsters = monsterData.filter(m => m.rarity === "Comune");
    const monster = commonMonsters[Math.floor(Math.random() * commonMonsters.length)];
    
    game.currentMonster = createScaledMonster(monster, 1);
    game.currentMonster.catchRate = 95; // Almost guaranteed
    
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter">
            <h3>🌟 Primo Incontro!</h3>
            <span class="monster-sprite">${monster.sprite}</span>
            <h4>${monster.name} Lv.1</h4>
            <p style="color: #4CAF50;">Questo mostro sembra docile e facile da catturare!</p>
            <p style="font-size: 0.9em; color: #ccc;">HP: ${game.currentMonster.hp} | ATK: ${game.currentMonster.attack} | DEF: ${game.currentMonster.defense}</p>
            <div class="buttons">
                <button onclick="attemptCatch()">🎯 Cattura Facilmente</button>
            </div>
        </div>
    `;
    
    addLog(`🌟 Il tuo primo ${monster.name} ti aspetta!`);
}

function spawnMonster() {
    // Determine level based on current floor
    const floorBlock = Math.floor((game.currentFloor - 1) / 10) + 1;
    const minLevel = Math.max(1, floorBlock * 2 - 1);
    const maxLevel = floorBlock * 2 + 1;
    const wildLevel = minLevel + Math.floor(Math.random() * (maxLevel - minLevel + 1));
    
    // Determine rarity based on floor progression
    const rand = Math.random();
    let rarity;
    
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
    
    const available = monsterData.filter(m => m.rarity === rarity);
    const monster = available[Math.floor(Math.random() * available.length)];
    
    game.currentMonster = createScaledMonster(monster, wildLevel);
    game.battlesThisBlock++; // Count this battle
    
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter">
            <h3>🚨 Mostro Selvaggio - Piano ${game.currentFloor}</h3>
            <span class="monster-sprite">${monster.sprite}</span>
            <h4>${monster.name} Lv.${wildLevel}</h4>
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
    
    addLog(`🎯 Piano ${game.currentFloor}: ${monster.name} Lv.${wildLevel} (${monster.rarity})`);
}

function spawnBoss() {
    const bossFloor = Math.floor(game.currentFloor / 10);
    const minLevel = Math.max(1, bossFloor * 3 - 1);
    const maxLevel = bossFloor * 3 + 2;
    const bossLevel = minLevel + Math.floor(Math.random() * (maxLevel - minLevel + 1));
    
    // Boss rarity based on floor
    let rarity;
    if (bossFloor <= 2) rarity = "Non Comune";
    else if (bossFloor <= 4) rarity = "Raro";
    else rarity = "Leggendario";
    
    const available = monsterData.filter(m => m.rarity === rarity);
    const monster = available[Math.floor(Math.random() * available.length)];
    
    game.currentMonster = createScaledMonster(monster, bossLevel);
    game.currentMonster.catchRate = Math.max(10, game.currentMonster.catchRate - 10); // Harder to catch
    
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter boss-encounter">
            <h3 style="color: #9C27B0;">👑 BOSS - Piano ${game.currentFloor}</h3>
            <span class="monster-sprite" style="filter: drop-shadow(0 0 10px #9C27B0);">${monster.sprite}</span>
            <h4>${monster.name} Lv.${bossLevel} 👑</h4>
            <p style="color: #9C27B0; font-weight: bold;">Un mostro boss incredibilmente potente!</p>
            <p style="font-size: 0.9em; color: #ccc;">HP: ${game.currentMonster.hp} | ATK: ${game.currentMonster.attack} | DEF: ${game.currentMonster.defense}</p>
            <p style="color: #ffd700; font-size: 0.9em;">💰 Ricompensa: ${Math.floor(game.currentMonster.expValue * 1.5)} monete</p>
            <div class="buttons">
                ${game.monsters.length > 0 ? '<button onclick="showMonsterSelection()">⚔️ Combatti Boss</button>' : ''}
                <button onclick="attemptCatch()">🎯 Lancia Pokeball</button>
                <button onclick="runAway()">🏃 Ritirata</button>
            </div>
        </div>
    `;
    
    addLog(`👑 BOSS BATTLE! ${monster.name} Lv.${bossLevel} ti sfida!`);
}

// Attempt to catch the current monster
function attemptCatch() {
    if (game.player.pokeballs <= 0) {
        addLog("❌ Non hai Pokeball! Vai al prossimo negozio!");
        return;
    }
    
    game.player.pokeballs--;
    const monster = game.currentMonster;
    
    // Calculate catch chance
    let chance = monster.catchRate;
    const duplicates = game.monsters.filter(m => m.name === monster.name).length;
    chance -= duplicates * 8;
    chance = Math.max(10, Math.min(95, chance));
    
    if (Math.random() * 100 < chance) {
        // Successful catch
        const existingMonster = game.monsters.find(m => m.name === monster.name);
        const moneyReward = Math.floor(monster.expValue * 0.8);
        game.player.money += moneyReward;
        
        if (existingMonster) {
            // MERGE: Convert caught monster to EXP for existing monster
            const mergeExp = monster.expValue * 2;
            giveMonsterExp(existingMonster, mergeExp);
            addLog(`🔄 ${monster.name} catturato e fuso! (+${moneyReward} monete)`);
            addLog(`💫 ${existingMonster.name} ha guadagnato ${mergeExp} EXP dalla fusione!`);
            showMergeSuccess(monster, existingMonster, mergeExp);
        } else {
            // NEW MONSTER: Add to collection
            const newMonster = initializeMonster(monster);
            game.monsters.push(newMonster);
            addLog(`🎉 ${monster.name} catturato! (+${moneyReward} monete)`);
            showCaptureSuccess(newMonster);
        }
        
        game.currentMonster = null;
    } else {
        // Failed catch
        addLog(`💔 ${monster.name} è scappato dalla Pokeball! (${chance}% di successo)`);
        
        if (Math.random() < 0.4) {
            showMonsterFled(monster);
            game.currentMonster = null;
        } else {
            showCatchFailed(monster, chance);
        }
    }
    
    updateDisplay();
}

// Show different catch result screens
function showCaptureSuccess(monster) {
    const moneyReward = Math.floor(monster.expValue * 0.8);
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter">
            <h3 style="color: #4CAF50;">✅ Cattura Riuscita!</h3>
            <span class="monster-sprite">${monster.sprite}</span>
            <h4>${monster.name}</h4>
            <p style="color: #4CAF50; margin: 15px 0;"><strong>${monster.name}</strong> si è unito alla tua squadra!</p>
            <p style="color: #ffd700;">💰 +${moneyReward} monete</p>
            <div class="buttons">
                <button onclick="advanceFloor()">➡️ Avanza Piano ${game.currentFloor + 1}</button>
            </div>
        </div>
    `;
}

function showMergeSuccess(caughtMonster, existingMonster, mergeExp) {
    const moneyReward = Math.floor(caughtMonster.expValue * 0.8);
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter">
            <h3 style="color: #9C27B0;">🔄 Fusione Riuscita!</h3>
            <div style="display: flex; justify-content: center; align-items: center; gap: 20px; margin: 20px 0;">
                <div style="text-align: center;">
                    <span style="font-size: 2em;">${caughtMonster.sprite}</span>
                    <p style="font-size: 0.9em; color: #ccc;">Catturato</p>
                </div>
                <span style="font-size: 2em; color: #9C27B0;">➕</span>
                <div style="text-align: center;">
                    <span style="font-size: 2em;">${existingMonster.sprite}</span>
                    <p style="font-size: 0.9em; color: #4CAF50;">Lv.${existingMonster.level}</p>
                </div>
                <span style="font-size: 2em; color: #ffd700;">✨</span>
            </div>
            <h4>${caughtMonster.name} si è fuso con il tuo team!</h4>
            <p style="color: #9C27B0; margin: 15px 0;">Il ${caughtMonster.name} catturato si è unito al tuo ${existingMonster.name}!</p>
            <p style="color: #ffd700;">💰 +${moneyReward} monete</p>
            <p style="color: #9C27B0;">💫 +${mergeExp} EXP per ${existingMonster.name}</p>
            <div class="buttons">
                <button onclick="advanceFloor()">➡️ Avanza Piano ${game.currentFloor + 1}</button>
            </div>
        </div>
    `;
}

function showCatchFailed(monster, successChance) {
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter">
            <h3 style="color: #ff6b6b;">💔 Cattura Fallita!</h3>
            <span class="monster-sprite">${monster.sprite}</span>
            <h4>${monster.name}</h4>
            <p style="margin: 15px 0;">${monster.name} è scappato dalla Pokeball, ma è ancora qui!</p>
            <p style="color: #ccc; font-size: 0.9em;">Probabilità di successo era: ${successChance.toFixed(1)}%</p>
            <p style="color: #ff6b6b;">🎯 Pokeball rimanenti: ${game.player.pokeballs}</p>
            <div class="buttons">
                <button onclick="attemptCatch()" ${game.player.pokeballs <= 0 ? 'disabled' : ''}>🎯 Riprova Cattura</button>
                <button onclick="runAway()">🏃 Scappa</button>
            </div>
        </div>
    `;
}

function showMonsterFled(monster) {
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter">
            <h3 style="color: #ff8c00;">🌪️ Mostro Fuggito!</h3>
            <span class="monster-sprite" style="opacity: 0.5;">💨</span>
            <h4 style="color: #ccc;">${monster.name} è scappato...</h4>
            <p style="margin: 15px 0; color: #ff8c00;">${monster.name} è fuggito nella natura selvaggia!</p>
            <p style="color: #ccc; font-size: 0.9em;">Il mostro è scappato! Prova il prossimo piano.</p>
            <div class="buttons">
                <button onclick="advanceFloor()">➡️ Avanza Piano ${game.currentFloor + 1}</button>
            </div>
        </div>
    `;
}

// Spawn events (treasure, healing, etc.)
function spawnEvent() {
    const moneyReward = Math.max(5, Math.floor(game.currentFloor / 5) * 3 + Math.floor(Math.random() * 10));
    
    const events = [
        {
            title: "Tesoro Nascosto",
            sprite: "💰",
            description: "Hai trovato un piccolo tesoro sepolto nella terra!",
            reward: "money",
            amount: moneyReward,
            message: `💰 Hai trovato ${moneyReward} monete!`
        },
        {
            title: "Pokeball Abbandonata",
            sprite: "🎁", 
            description: "Un trainer ha dimenticato questa Pokeball. Fortuna tua!",
            reward: "pokeball",
            amount: 1,
            message: "🎁 Hai trovato una Pokeball per terra!"
        },
        {
            title: "Area di Riposo",
            sprite: "🏕️",
            description: "Un'area tranquilla dove riposare. I tuoi mostri recuperano un po' di energia.",
            reward: "heal",
            amount: 0.3,
            message: "🏕️ I tuoi mostri hanno recuperato il 30% della loro salute!"
        }
    ];
    
    const event = events[Math.floor(Math.random() * events.length)];
    
    // Apply event rewards
    if (event.reward === "money") {
        game.player.money += event.amount;
    } else if (event.reward === "pokeball") {
        game.player.pokeballs += event.amount;
    } else if (event.reward === "heal") {
        game.monsters.forEach(monster => {
            if (monster.hp < monster.maxHP) {
                monster.hp = Math.min(monster.maxHP, Math.floor(monster.hp + monster.maxHP * event.amount));
            }
        });
    }
    
    document.getElementById('encounter-area').innerHTML = `
        <div class="encounter">
            <h3>🔍 Evento - Piano ${game.currentFloor}</h3>
            <span class="monster-sprite">${event.sprite}</span>
            <h4>${event.title}</h4>
            <p style="margin: 15px 0; line-height: 1.4;">${event.description}</p>
            ${event.reward ? `<p style="color: #4CAF50; font-weight: bold;">💰 Ricompensa ottenuta!</p>` : ''}
            <div class="buttons">
                <button onclick="advanceFloor()">➡️ Avanza al Piano ${game.currentFloor + 1}</button>
            </div>
        </div>
    `;
    
    addLog(event.message);
}