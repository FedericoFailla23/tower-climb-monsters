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
    
    updateDisplay();
    addLog("🚀 Torre dei Mostri caricata! Inizia la tua scalata!");
}

// Main exploration function
function explore() {
    if (game.currentMonster) {
        addLog("⚠️ Devi prima gestire l'incontro attuale!");
        return;
    }

    const floorType = getFloorType(game.currentFloor);
    addLog(`🏢 Piano ${game.currentFloor} - ${floorType.description}`);
    
    switch(floorType.type) {
        case 'guaranteed_catch':
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

// Help system
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
                <p><strong>🔄 Fusione:</strong> I duplicati si fondono per potenziare i tuoi mostri</p>
                <p><strong>💰 Economia:</strong> Guadagna monete catturando e vincendo battaglie</p>
                <p><strong>⚔️ Strategia:</strong> Usa le battaglie per indebolire i mostri prima di catturarli</p>
                <p><strong>📊 Probabilità:</strong> 80% mostri, 20% eventi nei primi 7 piani di ogni blocco</p>
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
            <div class="buttons">
                <button onclick="startFirstEncounter()">🌟 Inizia al Piano 1</button>
                <button onclick="showHelp()">❓ Aiuto</button>
            </div>
        </div>
    `;
}

// Start the first encounter specifically
function startFirstEncounter() {
    // Ensure we're at floor 1 and trigger the guaranteed catch
    game.currentFloor = 1;
    game.currentMonster = null;
    explore();
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

// Start the game when page loads
window.addEventListener('load', initGame);