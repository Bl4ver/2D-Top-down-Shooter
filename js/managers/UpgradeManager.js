export class UpgradeManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
    }

    init() {
        this.inventory = this.gameEngine.saveManager.saveState.inventory;
        this.upgrades = this.gameEngine.saveManager.gameData;
        this.state = this.gameEngine.saveManager.saveState;

        this.loadUpgrades('playerUpgrades-container')
    }

    loadUpgrades(currentTab) {
        const match = currentTab.match(/^(.*)-container/)[1] ? currentTab.match(/^(.*)-container/)[1] : null;

        if (!match) {
            console.error(`UI Hiba: Nincs egyezés semmilyen container-el sem: "${currentTab}"`);
            return;
        }

        const upgradesContainer = document.getElementById(currentTab);

        if (!upgradesContainer) {
            console.error(`UI Hiba: Nem található a HTML-ben a következő elem: id="${currentTab}"`);
            return;
        }

        upgradesContainer.innerHTML = '';


        if (match === 'playerUpgrades') {
            this.createEntityCard(upgradesContainer, 'player', this.upgrades.playerUpgrades, match);
        } else if (match === 'weapons' || match === 'bots') {
            const entities = this.upgrades[match];

            Object.entries(entities).forEach(([entityKey, entityData]) => {
                if (!this.inventory[match][entityKey].unlocked) {
                    this.createUnlockCard(upgradesContainer, entityKey, entityData, match);
                } else {
                    this.createEntityCard(upgradesContainer, entityKey, entityData, match);
                }
            });
        }

        this.gameEngine.renderer.updateScreenLanguage();
    }

    createEntityCard(container, entityKey, entityData, category) {
        const card = document.createElement('div');
        card.classList.add('upgrade-card', 'entity-card');

        // --- 1. FŐ CÍM (data-lang beállítása attribútumként) ---
        const title = document.createElement('h2');
        title.classList.add('entity-title');

        console.log(entityKey);
        title.setAttribute('data-lang', `name-${entityKey}`);
        title.textContent = entityKey.toUpperCase(); // Fallback

        card.appendChild(title);

        // --- 2. FELSZERELVE GOMB ---
        if (category === 'weapons') {
            const isActive = this.inventory.activeWeapon === entityKey;
            const equipBtn = document.createElement('button');
            equipBtn.className = isActive ? 'equip-btn active' : 'equip-btn';

            // Beleteszünk egy SPAN-t a fordításhoz
            equipBtn.innerHTML = isActive
                ? `<span data-lang="btn-equipped">FELSZERELVE</span>`
                : `<span data-lang="btn-equip">FELSZERELÉS</span>`;

            if (!isActive) {
                equipBtn.onclick = () => {
                    this.inventory.activeWeapon = entityKey;
                    this.gameEngine.saveManager.saveDatas();
                    this.loadUpgrades(`${category}-container`);
                };
            }
            card.appendChild(equipBtn);
        }

        const statsObj = category === 'playerUpgrades' ? entityData : entityData.upgrades;
        const levelsObj = category === 'playerUpgrades' ? this.inventory.playerUpgrades : this.inventory[category][entityKey].levels;

        for (const [statKey, statData] of Object.entries(statsObj)) {
            const currentLevel = levelsObj[statKey];
            const cost = statData.baseCost * currentLevel;
            const currentValue = statData.baseValue + ((currentLevel - 1) * statData.inc);

            const formatNum = (num) => Number.isInteger(num) ? num : parseFloat(num.toFixed(2));
            const incSign = statData.inc > 0 ? '+' : '';

            const statRow = document.createElement('div');
            statRow.classList.add('stat-row-modern');

            const leftSide = document.createElement('div');
            leftSide.classList.add('stat-left');
            console.log(statKey)
            leftSide.innerHTML = `<span class="stat-name" data-lang="name-${statKey}>${statData.name} (Lv${currentLevel})"></span>`;

            const midSide = document.createElement('div');
            midSide.classList.add('stat-mid');
            midSide.innerHTML = `
                <span class="upgrade-preview">${incSign}${formatNum(statData.inc)}</span>
                <span class="current-val">${formatNum(currentValue)}</span>
            `;

            const rightSide = document.createElement('div');
            rightSide.classList.add('stat-right');

            const btn = document.createElement('button');
            btn.classList.add('price-btn');
            btn.innerHTML = `${cost} &curren;`;

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

        // --- 1. ZÁROLT CÍM ---
        const title = document.createElement('h2');
        title.classList.add('entity-title');
        // Két külön data-lang taget rakunk a Címnek és a (ZÁROLVA) szövegnek
        title.innerHTML = `<span data-lang="name-${entityKey}">${entityKey.toUpperCase()}</span> (<span data-lang="lbl-locked">ZÁROLVA</span>)`;
        card.appendChild(title);

        // --- 2. FELOLDÁS GOMB ÉS ÁR ---
        const unlockBtn = document.createElement('button');
        unlockBtn.classList.add('equip-btn');

        // Csak a szövegre megy a data-lang, az ár marad mellette!
        unlockBtn.innerHTML = `<span data-lang="btn-unlock">FELOLDÁS</span> - ${entityData.unlockCost} &curren;`;

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