export class UpgradeManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
    }

    init() {
        this.inventory = this.gameEngine.saveManager.saveState.inventory;
        this.upgrades = this.gameEngine.saveManager.gameData;
        this.state = this.gameEngine.saveManager.saveState;
    }

    getTranslation(key, fallback) {
        const langContent = this.gameEngine.langManager.content;
        return langContent && langContent[key] ? langContent[key] : fallback;
    }

    loadUpgrades(currentTab) {
        this.init();
        
        const match = currentTab.match(/^(.*)-container/)[1];
        const upgradesContainer = document.getElementById(currentTab);
        upgradesContainer.innerHTML = ''; 

        if (match === 'playerUpgrades') {
            // Játékos statok egyetlen nagy kártyába vonva!
            this.createEntityCard(upgradesContainer, 'player', this.upgrades.playerUpgrades, match);
        } else if (match === 'weapons' || match === 'bots') {
            // Fegyverek és Botok kártyái
            const entities = this.upgrades[match];
            for (const [entityKey, entityData] of Object.entries(entities)) {
                if (!this.inventory[match][entityKey].unlocked) {
                    this.createUnlockCard(upgradesContainer, entityKey, entityData, match);
                } else {
                    this.createEntityCard(upgradesContainer, entityKey, entityData, match);
                }
            }
        }
        
        this.updateCoinsUI();
    }

    createEntityCard(container, entityKey, entityData, category) {
        const card = document.createElement('div');
        card.classList.add('upgrade-card', 'entity-card');

        // Fő cím (pl. PISTOL)
        const entityName = category === 'playerUpgrades' 
            ? this.getTranslation('tab-player', 'PLAYER') 
            : this.getTranslation(`name-${entityKey}`, entityKey.toUpperCase());
            
        const title = document.createElement('h2');
        title.classList.add('entity-title');
        title.textContent = entityName.toUpperCase();
        card.appendChild(title);

        // "FELSZERELVE" gomb logika fegyverekhez
        if (category === 'weapons') {
            const isActive = this.inventory.activeWeapon === entityKey;
            const equipBtn = document.createElement('button');
            equipBtn.className = isActive ? 'equip-btn active' : 'equip-btn';
            equipBtn.textContent = isActive 
                ? this.getTranslation('btn-equipped', 'FELSZERELVE') 
                : this.getTranslation('btn-equip', 'FELSZERELÉS');

            if (!isActive) {
                equipBtn.onclick = () => {
                    this.inventory.activeWeapon = entityKey;
                    this.gameEngine.saveManager.saveDatas();
                    this.loadUpgrades(`${category}-container`);
                };
            }
            card.appendChild(equipBtn);
        }

        // JAVÍTVA: Itt a this.inventory.playerLevels-t kicseréltük this.inventory.playerUpgrades-re!
        const statsObj = category === 'playerUpgrades' ? entityData : entityData.upgrades;
        const levelsObj = category === 'playerUpgrades' ? this.inventory.playerUpgrades : this.inventory[category][entityKey].levels;

        // Végigmegyünk a statisztika sorokon
        for (const [statKey, statData] of Object.entries(statsObj)) {
            const currentLevel = levelsObj[statKey];
            const cost = statData.baseCost * currentLevel;
            const currentValue = statData.baseValue + ((currentLevel - 1) * statData.inc);
            
            const formatNum = (num) => Number.isInteger(num) ? num : parseFloat(num.toFixed(2));
            const incSign = statData.inc > 0 ? '+' : '';

            // Egy sor létrehozása
            const statRow = document.createElement('div');
            statRow.classList.add('stat-row-modern');

            // Bal: Név + Szint
            const leftSide = document.createElement('div');
            leftSide.classList.add('stat-left');
            leftSide.innerHTML = `<span class="stat-name">${statData.name} (Lv${currentLevel})</span>`;

            // Közép: Jelenlegi érték és a Rejtett Preview
            const midSide = document.createElement('div');
            midSide.classList.add('stat-mid');
            midSide.innerHTML = `
                <span class="upgrade-preview">${incSign}${formatNum(statData.inc)}</span>
                <span class="current-val">${formatNum(currentValue)}</span>
            `;

            // Jobb: Lila Árgomb
            const rightSide = document.createElement('div');
            rightSide.classList.add('stat-right');
            
            const btn = document.createElement('button');
            btn.classList.add('price-btn');
            btn.innerHTML = `${cost} &curren;`; // A kis "Napocska" valuta szimbólum (¤)

            if (this.state.coins < cost) {
                btn.disabled = true;
                btn.classList.add('disabled');
            } else {
                btn.onclick = () => {
                    this.state.coins -= cost;
                    levelsObj[statKey]++;
                    this.gameEngine.saveManager.saveDatas();
                    this.loadUpgrades(`${category}-container`);
                };
            }

            rightSide.appendChild(btn);

            statRow.appendChild(leftSide);
            statRow.appendChild(midSide);
            statRow.appendChild(rightSide);
            card.appendChild(statRow);
        }

        container.appendChild(card);
    }

    createUnlockCard(container, entityKey, entityData, category) {
        const card = document.createElement('div');
        card.classList.add('upgrade-card', 'entity-card', 'locked');

        const entityName = this.getTranslation(`name-${entityKey}`, entityKey.toUpperCase());
        const title = document.createElement('h2');
        title.classList.add('entity-title');
        title.textContent = `${entityName} (${this.getTranslation('lbl-locked', 'ZÁROLVA')})`;
        card.appendChild(title);

        const unlockBtn = document.createElement('button');
        unlockBtn.classList.add('equip-btn');
        unlockBtn.innerHTML = `${this.getTranslation('btn-unlock', 'FELOLDÁS')} - ${entityData.unlockCost} &curren;`;
        
        if (this.state.coins < entityData.unlockCost) {
            unlockBtn.disabled = true;
            unlockBtn.classList.add('disabled');
        } else {
            unlockBtn.onclick = () => {
                this.state.coins -= entityData.unlockCost;
                this.inventory[category][entityKey].unlocked = true;
                this.gameEngine.saveManager.saveDatas();
                this.loadUpgrades(`${category}-container`);
            };
        }

        card.appendChild(unlockBtn);
        container.appendChild(card);
    }

    updateCoinsUI() {
        const coinsDisplay = document.getElementById('upgrade-coins-val');
        if (coinsDisplay) {
            coinsDisplay.textContent = this.state.coins;
        }
    }
}