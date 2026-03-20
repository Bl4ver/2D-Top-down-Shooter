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

        // --- JÁTÉKOS FEJLESZTÉSEK ---
        if (match === 'playerUpgrades') {
            const data = this.upgrades.playerUpgrades;
            const levels = this.inventory.playerUpgrades;
            
            for (const [statKey, statData] of Object.entries(data)) {
                this.createCard(upgradesContainer, statData.name, statData, levels[statKey], match, statKey);
            }
        } 
        // --- FEGYVEREK ÉS BOTOK ---
        else if (match === 'weapons' || match === 'bots') {
            const entities = this.upgrades[match];
            
            for (const [entityKey, entityData] of Object.entries(entities)) {
                const isUnlocked = this.inventory[match][entityKey].unlocked;
                
                if (!isUnlocked) {
                    this.createUnlockCard(upgradesContainer, entityKey, entityData, match);
                } else {
                    this.createEntityCard(upgradesContainer, entityKey, entityData, match);
                }
            }
        }
        
        this.updateCoinsUI();
    }

    // Alap kártya a játékos statisztikáinak
    createCard(container, titleText, statData, currentLevel, category, statKey) {
        const card = document.createElement('div');
        card.classList.add('upgrade-card', 'upgrade');

        const title = document.createElement('p');
        title.classList.add('detail', 'title');
        title.textContent = titleText;
        card.appendChild(title);

        // Költség és Szint egy sorban
        const cost = statData.baseCost * currentLevel;
        const infoRow = document.createElement('div');
        infoRow.classList.add('card-info-row');
        infoRow.innerHTML = `
            <span class="detail">${this.getTranslation('lbl-level', 'Lvl')}: ${currentLevel}</span>
            <span class="detail cost">${this.getTranslation('lbl-price', 'Ár')}: ${cost} C</span>
        `;
        card.appendChild(infoRow);

        // Számítások
        const currentValue = statData.baseValue + ((currentLevel - 1) * statData.inc);
        const formatNum = (num) => Number.isInteger(num) ? num : parseFloat(num.toFixed(2));
        
        const incValue = statData.inc;
        const arrow = incValue > 0 ? '&uarr;' : '&darr;'; // Felfelé vagy lefelé nyíl

        // Új sor: Érték [GOMB] Preview
        const actionRow = document.createElement('div');
        actionRow.classList.add('stat-action-row');

        const valSpan = document.createElement('span');
        valSpan.classList.add('current-val');
        valSpan.textContent = formatNum(currentValue);

        const btn = document.createElement('button');
        btn.classList.add('upgrade-button', 'inline-btn');
        btn.innerHTML = this.getTranslation('btn-upgrade', 'UPGRADE');
        
        if (this.state.coins < cost) {
            btn.disabled = true;
            btn.classList.add('disabled');
        }

        btn.onclick = () => {
            if (this.state.coins >= cost) {
                this.state.coins -= cost;
                this.inventory.playerLevels[statKey]++;
                this.gameEngine.saveManager.saveDatas();
                this.loadUpgrades(`${category}-container`);
            }
        };

        const previewSpan = document.createElement('span');
        previewSpan.classList.add('upgrade-preview');
        previewSpan.innerHTML = `${arrow} ${formatNum(Math.abs(incValue))}`; // Abszolút érték, a nyíl mutatja az irányt

        // Sorrend fontos a CSS miatt! Val -> Btn -> Preview
        actionRow.appendChild(valSpan);
        actionRow.appendChild(btn);
        actionRow.appendChild(previewSpan);
        card.appendChild(actionRow);

        container.appendChild(card);
    }

    // Összevont fegyver/bot kártya
    createEntityCard(container, entityKey, entityData, category) {
        const card = document.createElement('div');
        card.classList.add('upgrade-card', 'upgrade', 'entity-card');

        const entityName = this.getTranslation(`name-${entityKey}`, entityKey.toUpperCase());
        const title = document.createElement('p');
        title.classList.add('detail', 'title', 'entity-title');
        title.textContent = entityName;
        card.appendChild(title);

        const levels = this.inventory[category][entityKey].levels;

        for (const [statKey, statData] of Object.entries(entityData.upgrades)) {
            const currentLevel = levels[statKey];
            const cost = statData.baseCost * currentLevel;
            
            const currentValue = statData.baseValue + ((currentLevel - 1) * statData.inc);
            const formatNum = (num) => Number.isInteger(num) ? num : parseFloat(num.toFixed(2));
            
            const incValue = statData.inc;
            const arrow = incValue > 0 ? '&uarr;' : '&darr;';

            const statBlock = document.createElement('div');
            statBlock.classList.add('stat-block');

            const header = document.createElement('div');
            header.classList.add('stat-header');
            header.innerHTML = `
                <span>${statData.name} <small>(${this.getTranslation('lbl-level', 'Lvl')} ${currentLevel})</small></span> 
                <span class="cost-text">${cost} C</span>
            `;
            statBlock.appendChild(header);

            // Új sor: Érték [GOMB] Preview
            const actionRow = document.createElement('div');
            actionRow.classList.add('stat-action-row');

            const valSpan = document.createElement('span');
            valSpan.classList.add('current-val');
            valSpan.textContent = formatNum(currentValue);

            const btn = document.createElement('button');
            btn.classList.add('upgrade-button', 'mini-btn');
            btn.innerHTML = '&uarr;'; // Ikon a mini gombon
            btn.title = this.getTranslation('btn-upgrade', 'UPGRADE');

            if (this.state.coins < cost) {
                btn.disabled = true;
                btn.classList.add('disabled');
            }

            btn.onclick = () => {
                if (this.state.coins >= cost) {
                    this.state.coins -= cost;
                    this.inventory[category][entityKey].levels[statKey]++;
                    this.gameEngine.saveManager.saveDatas();
                    this.loadUpgrades(`${category}-container`);
                }
            };

            const previewSpan = document.createElement('span');
            previewSpan.classList.add('upgrade-preview');
            previewSpan.innerHTML = `${arrow} ${formatNum(Math.abs(incValue))}`;

            // Sorrend: Érték, Gomb, Előnézet (A CSS miatt kell ez a sorrend!)
            actionRow.appendChild(valSpan);
            actionRow.appendChild(btn);
            actionRow.appendChild(previewSpan);
            
            statBlock.appendChild(actionRow);
            card.appendChild(statBlock);
        }

        container.appendChild(card);
    }

    createUnlockCard(container, entityKey, entityData, category) {
        // ... (Ez a rész változatlan marad, nem másolom be újra az egészet, tökéletesen működik, ahogy előzőleg írtuk) ...
        const card = document.createElement('div');
        card.classList.add('upgrade-card', 'upgrade', 'locked');

        const entityName = this.getTranslation(`name-${entityKey}`, entityKey.toUpperCase());
        const title = document.createElement('p');
        title.classList.add('detail', 'title');
        title.textContent = `${entityName} (${this.getTranslation('lbl-locked', 'ZÁROLVA')})`;
        card.appendChild(title);

        const costRow = document.createElement('p');
        costRow.classList.add('detail', 'cost');
        costRow.textContent = `${this.getTranslation('lbl-price', 'Ár')}: ${entityData.unlockCost} C`;
        card.appendChild(costRow);

        const btn = document.createElement('button');
        btn.classList.add('upgrade-button', 'unlock-btn');
        btn.textContent = this.getTranslation('btn-unlock', 'FELOLDÁS');
        
        if (this.state.coins < entityData.unlockCost) {
            btn.disabled = true;
            btn.classList.add('disabled');
        }

        btn.onclick = () => {
            if (this.state.coins >= entityData.unlockCost) {
                this.state.coins -= entityData.unlockCost;
                this.inventory[category][entityKey].unlocked = true;
                this.gameEngine.saveManager.saveDatas();
                this.loadUpgrades(`${category}-container`);
            }
        };

        card.appendChild(btn);
        container.appendChild(card);
    }

    updateCoinsUI() {
        const coinsDisplay = document.getElementById('upgrade-coins-val');
        if (coinsDisplay) {
            coinsDisplay.textContent = this.state.coins;
        }
    }
}