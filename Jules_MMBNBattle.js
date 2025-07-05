//=============================================================================
// Jules_MMBNBattle.js
//=============================================================================

/*:
 * @target MZ
 * @plugindesc (v0.01) Implements a Mega Man Battle Network-style battle system.
 * @author Jules
 * @url https://example.com/jules-mmbnbattle
 *
 * @help
 * Jules_MMBNBattle.js
 * Version 0.01
 *
 * This plugin provides a battle system inspired by Mega Man Battle Network.
 * This is the initial phase, focusing on grid setup and player movement.
 *
 * Plugin Commands:
 *   StartMMBNBattle
 *     - Starts a test MMBN-style battle.
 *
 * @param PlayerGridColor
 * @text Player Grid Color
 * @desc The fill color for the player's side of the grid.
 * @type string
 * @default rgba(100, 100, 255, 0.3)
 *
 * @param EnemyGridColor
 * @text Enemy Grid Color
 * @desc The fill color for the enemy's side of the grid.
 * @type string
 * @default rgba(255, 100, 100, 0.3)
 *
 * @param GridLineColor
 * @text Grid Line Color
 * @desc The color for the grid lines.
 * @type string
 * @default rgba(200, 200, 200, 0.8)
 *
 * @param GridRows
 * @text Grid Rows
 * @desc Number of rows in the battle grid.
 * @type number
 * @min 1
 * @default 5
 *
 * @param GridColsPerSide
 * @text Grid Columns Per Side
 * @desc Number of columns for each player's side of the grid.
 * @type number
 * @min 1
 * @default 5
 *
 * @param DefaultPlayerActorId
 * @text Default Player Actor ID
 * @desc The Actor ID to use for the player character in test battles.
 * @type actor
 * @default 1
 *
 * @param PanelWidth
 * @text Panel Width
 * @desc The visual width of a single grid panel in pixels.
 * @type number
 * @min 10
 * @default 48
 *
 * @param PanelHeight
 * @text Panel Height
 * @desc The visual height of a single grid panel in pixels.
 * @type number
 * @min 10
 * @default 48
 *
 */

var Jules = Jules || {};
Jules.MMBNBattle = Jules.MMBNBattle || {};
Jules.MMBNBattle.pluginName = "Jules_MMBNBattle";

Jules.MMBNBattle.Params = {};

(() => {
    'use strict';

    const params = PluginManager.parameters(Jules.MMBNBattle.pluginName);

    Jules.MMBNBattle.Params.PlayerGridColor = params['PlayerGridColor'] || 'rgba(100, 100, 255, 0.3)';
    Jules.MMBNBattle.Params.EnemyGridColor = params['EnemyGridColor'] || 'rgba(255, 100, 100, 0.3)';
    Jules.MMBNBattle.Params.GridLineColor = params['GridLineColor'] || 'rgba(200, 200, 200, 0.8)';
    Jules.MMBNBattle.Params.GridRows = parseInt(params['GridRows']) || 5;
    Jules.MMBNBattle.Params.GridColsPerSide = parseInt(params['GridColsPerSide']) || 5;
    Jules.MMBNBattle.Params.DefaultPlayerActorId = parseInt(params['DefaultPlayerActorId']) || 1;
    Jules.MMBNBattle.Params.PanelWidth = parseInt(params['PanelWidth']) || 48;
    Jules.MMBNBattle.Params.PanelHeight = parseInt(params['PanelHeight']) || 48;

    //=============================================================================
    // Plugin Command
    //=============================================================================
    PluginManager.registerCommand(Jules.MMBNBattle.pluginName, "StartMMBNBattle", args => {
        // Future: Parse args for specific battle setup (e.g., troopId, specific enemies)
        SceneManager.push(Scene_MMBNBattle);
    });

    //=============================================================================
    // Game_Actor Modifications
    //=============================================================================
    const _Game_Actor_initMembers = Game_Actor.prototype.initMembers;
    Game_Actor.prototype.initMembers = function() {
        _Game_Actor_initMembers.call(this);
        this._customGauge = 0;
    };

    Game_Actor.prototype.maxCustomGauge = function() {
        return 240; // Approx 4 seconds at 60FPS
        // Comment idea: This could be influenced by stats or NaviCust programs later.
    };

    Game_Actor.prototype.customGauge = function() {
        return this._customGauge;
    };

    Game_Actor.prototype.chargeCustomGauge = function() {
        // In a real game, this might be paused during certain animations or menus
        if (this._customGauge < this.maxCustomGauge()) {
            this._customGauge++;
        }
    };

    Game_Actor.prototype.isCustomGaugeFull = function() {
        return this._customGauge >= this.maxCustomGauge();
    };

    Game_Actor.prototype.resetCustomGauge = function() {
        this._customGauge = 0;
    };

    //=============================================================================
    // Scene_MMBNBattle
    //=============================================================================
    function Scene_MMBNBattle() {
        this.initialize(...arguments);
    }

    Scene_MMBNBattle.prototype = Object.create(Scene_Base.prototype);
    Scene_MMBNBattle.prototype.constructor = Scene_MMBNBattle;

    // This initialize was duplicated and incorrect, removing the older one.
    // The correct one is later with _enemySprites and _busterShots.
    // Scene_MMBNBattle.prototype.initialize = function() {
    //     Scene_Base.prototype.initialize.call(this);
    //     // Future: Initialize battle specific data like enemy list, chip folder etc.
    // };

    // This create was duplicated, removing the older one.
    // Scene_MMBNBattle.prototype.create = function() {
    //     Scene_Base.prototype.create.call(this);
    //     this.createBackground();
    //     this.createWindowLayer();
    //     // Future: this.createGrid(); this.createPlayer(); this.createEnemies(); this.createHud();
    //     // Comment idea: Future logic for setting up based on troop data or event commands.
    // };

    Scene_MMBNBattle.prototype.start = function() {
        Scene_Base.prototype.start.call(this);
        SceneManager.clearStack(); // Clears history for returning to map correctly
        // Future: Start music, intro animations etc.
    };

    // The main update loop, this is where we'll add gauge charging
    // This was also duplicated, ensuring we modify the one that's actually used with other logic.
    // Scene_MMBNBattle.prototype.update = function() {
    //     Scene_Base.prototype.update.call(this);
    //     // Future: Handle player input, enemy AI, chip selection, game state updates
    //     if (Input.isTriggered("cancel") || TouchInput.isCancelled()) {
    //         // For now, simple exit. Future: proper pause menu or escape logic
    //         this.popScene();
    //     }
    // };

    Scene_MMBNBattle.prototype.stop = function() {
        Scene_Base.prototype.stop.call(this);
        // Future: Clean up, stop music, any outro effects
        // SceneManager.playNextScene(); // Or specific logic for returning to map/menu
    };

    Scene_MMBNBattle.prototype.terminate = function() {
        Scene_Base.prototype.terminate.call(this);
        // Future: Ensure all resources are released if necessary
    };

    // Placeholder for background creation
    Scene_MMBNBattle.prototype.createBackground = function() {
        this._backgroundSprite = new Sprite();
        // For BN, the grid IS the background for the battle area.
        // A more generic backdrop could be drawn behind the grid if desired.
        // this._backgroundSprite.bitmap = SceneManager.backgroundBitmap() || ImageManager.loadSystem("Battleback2_1");
        // this.addChild(this._backgroundSprite);
    };

    Scene_MMBNBattle.prototype.create = function() {
        Scene_Base.prototype.create.call(this);
        this.createBackground(); // Might be minimal if grid takes over
        this.createGrid();
        this.createWindowLayer();
        // Future: this.createPlayer(); this.createEnemies(); this.createHud();
        // Comment idea: Future logic for setting up based on troop data or event commands.
    };

    Scene_MMBNBattle.prototype.createGrid = function() {
        this._battleGridSprite = new Sprite_BattleGrid();
        this.addChild(this._battleGridSprite); // Adjust order as needed, likely above characters
    };

    //=============================================================================
    // Sprite_BattleGrid
    //=============================================================================
    function Sprite_BattleGrid() {
        this.initialize(...arguments);
    }

    Sprite_BattleGrid.prototype = Object.create(Sprite.prototype);
    Sprite_BattleGrid.prototype.constructor = Sprite_BattleGrid;

    Sprite_BattleGrid.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this._gridGraphics = new PIXI.Graphics();
        this.addChild(this._gridGraphics);
        this.drawGrid();
    };

    Sprite_BattleGrid.prototype.drawGrid = function() {
        this._gridGraphics.clear();

        const rows = Jules.MMBNBattle.Params.GridRows;
        const colsPerSide = Jules.MMBNBattle.Params.GridColsPerSide;
        const totalCols = colsPerSide * 2;
        const panelWidth = Jules.MMBNBattle.Params.PanelWidth;
        const panelHeight = Jules.MMBNBattle.Params.PanelHeight;

        const totalGridWidth = totalCols * panelWidth;
        const totalGridHeight = rows * panelHeight;

        // Center the grid on screen (or position as desired)
        // For now, let's roughly center it.
        this.x = (Graphics.boxWidth - totalGridWidth) / 2;
        this.y = (Graphics.boxHeight - totalGridHeight) / 2;
        // Comment idea: Allow grid starting X,Y to be parameters or calculated based on screen resolution.

        // Draw Player Side Background
        this._gridGraphics.beginFill(PIXI.utils.string2hex(Jules.MMBNBattle.Params.PlayerGridColor));
        this._gridGraphics.drawRect(0, 0, colsPerSide * panelWidth, totalGridHeight);
        this._gridGraphics.endFill();

        // Draw Enemy Side Background
        this._gridGraphics.beginFill(PIXI.utils.string2hex(Jules.MMBNBattle.Params.EnemyGridColor));
        this._gridGraphics.drawRect(colsPerSide * panelWidth, 0, colsPerSide * panelWidth, totalGridHeight);
        this._gridGraphics.endFill();

        // Draw Grid Lines
        this._gridGraphics.lineStyle(1, PIXI.utils.string2hex(Jules.MMBNBattle.Params.GridLineColor), 1);

        // Vertical Lines
        for (let c = 0; c <= totalCols; c++) {
            const x = c * panelWidth;
            this._gridGraphics.moveTo(x, 0);
            this._gridGraphics.lineTo(x, totalGridHeight);
        }
        // Horizontal Lines
        for (let r = 0; r <= rows; r++) {
            const y = r * panelHeight;
            this._gridGraphics.moveTo(0, y);
            this._gridGraphics.lineTo(totalGridWidth, y);
        }
        // Comment idea: Methods for highlighting panels, showing panel status (cracked, broken, holy), etc.
    };

    Sprite_BattleGrid.prototype.getPanelScreenCoords = function(row, col) {
        const panelWidth = Jules.MMBNBattle.Params.PanelWidth;
        const panelHeight = Jules.MMBNBattle.Params.PanelHeight;

        // Calculate top-left of the panel within the grid sprite's local coordinates
        const panelLocalX = col * panelWidth;
        const panelLocalY = row * panelHeight;

        // Calculate center of the panel
        const centerX = panelLocalX + panelWidth / 2;
        const centerY = panelLocalY + panelHeight / 2;

        // Return global screen coordinates by adding the grid sprite's position
        return { x: this.x + centerX, y: this.y + centerY };
    };

    // Helper to convert RGBA/RGB string to HEX for PIXI.Graphics
    // PIXI.utils.string2hex can handle "rgb(r,g,b)" and "#RRGGBB", but not "rgba(r,g,b,a)" directly for fill.
    // However, for lineStyle and beginFill, PIXI v5 seems to handle rgba strings correctly if the alpha is part of the color value.
    // If issues arise, a more robust parser might be needed. For now, relying on PIXI's capabilities.


    //=============================================================================
    // Scene_MMBNBattle (continued)
    //=============================================================================
    Scene_MMBNBattle.prototype.create = function() {
        Scene_Base.prototype.create.call(this);
        this.createBackground();
        this.createGrid();
        this.createPlayer(); // Add player creation
        this.createWindowLayer();
        // Future: this.createEnemies(); this.createHud();
        // Comment idea: Future logic for setting up based on troop data or event commands.
    };

    Scene_MMBNBattle.prototype.createPlayer = function() {
        const actorId = Jules.MMBNBattle.Params.DefaultPlayerActorId;
        const gameActor = $gameActors.actor(actorId);
        if (!gameActor) {
            console.error("Jules_MMBNBattle: DefaultPlayerActorId " + actorId + " not found.");
            return;
        }

        this._playerSprite = new Sprite_MMBNPlayer(gameActor);
        // Add to a specific layer if managing z-order carefully, for now directly to scene
        this.addChild(this._playerSprite);

        // Position the player on the grid
        if (this._battleGridSprite) {
            const initialScreenPos = this._battleGridSprite.getPanelScreenCoords(
                this._playerSprite._gridR,
                this._playerSprite._gridC
            );
            this._playerSprite.x = initialScreenPos.x;
            this._playerSprite.y = initialScreenPos.y;
        }
    };

    //=============================================================================
    // Sprite_MMBNPlayer
    //=============================================================================
    function Sprite_MMBNPlayer() {
        this.initialize(...arguments);
    }

    Sprite_MMBNPlayer.prototype = Object.create(Sprite_Actor.prototype);
    Sprite_MMBNPlayer.prototype.constructor = Sprite_MMBNPlayer;

    Sprite_MMBNPlayer.prototype.initialize = function(battler) {
        Sprite_Actor.prototype.initialize.call(this, battler);
        // Store grid coordinates
        // Default starting position: row 2, col 1 (0-indexed)
        // Row 2 of 5 is the middle row. Col 1 of 5 is the second column from left.
        this._gridR = Math.floor(Jules.MMBNBattle.Params.GridRows / 2); // Middle row
        this._gridC = 1; // Second column from left

        // Comment idea: Logic for handling different player characters, transformations, or style changes.
        // The Sprite_Actor's initialize already sets up the battler and calls initMembers.
        // We might need to adjust anchor or other properties if not using SV battlers.
        // For now, assuming default Sprite_Actor behavior is mostly fine for a placeholder.
        this.anchor.x = 0.5;
        this.anchor.y = 0.9; // Adjust if character sprites are tall, to stand on the line
    };

    // Override update to prevent default Sprite_Actor movement if any
    Sprite_MMBNPlayer.prototype.update = function() {
        Sprite_Battler.prototype.update.call(this); // Call Sprite_Battler update
        // Avoid Sprite_Actor's specific update that might move the sprite based on home position
        if (this._battler) {
            this.updateMotion(); // Standard motions like damage, state icons
            // this.updateMove(); // Sprite_Actor specific, avoid for now
            // this.updateVisibility(); // if needed
        }
        // Future: Update player state, animations based on grid position or actions
    };

    // Add any MMBN specific methods here later, e.g., for actions, chip usage, etc.

    //=============================================================================
    // Sprite_MMBNEnemy
    //=============================================================================
    function Sprite_MMBNEnemy() {
        this.initialize(...arguments);
    }

    Sprite_MMBNEnemy.prototype = Object.create(Sprite_Character.prototype);
    Sprite_MMBNEnemy.prototype.constructor = Sprite_MMBNEnemy;

    Sprite_MMBNEnemy.prototype.initialize = function(enemyData) {
        // We need to pass a Game_CharacterBase object to Sprite_Character's constructor.
        // For a simple enemy sprite not tied to $gameMap.events or $gamePlayer,
        // we can create a dummy Game_Character. This is a bit of a workaround for using Sprite_Character.
        // Alternatively, inherit directly from Sprite and handle bitmap loading manually.
        // For now, let's try with a null character initially, then load manually.
        Sprite_Character.prototype.initialize.call(this, null);
        this._enemyData = enemyData;

        this.hp = this._enemyData.hp || 1;
        this.maxHp = this._enemyData.maxHp || 1;
        this._gridR = this._enemyData.defaultGridR || 0;
        this._gridC = this._enemyData.defaultGridC || 0; // This will be relative to enemy side

        this.anchor.x = 0.5;
        this.anchor.y = 0.9; // Similar to player

        if (this._enemyData.characterName) {
            this.bitmap = ImageManager.loadCharacter(this._enemyData.characterName);
            // Sprite_Character expects _character, which holds tileId, characterName, etc.
            // We are bypassing some of that by setting bitmap directly.
            // We'll need to manually set the frame if using a multi-character sheet.
            const characterIndex = this._enemyData.characterIndex || 0;
            this.setTileId(0); // Not using tile ID
            this._characterName = this._enemyData.characterName; // Store for potential refresh
            this._characterIndex = characterIndex;
            this.updateBitmap(); // To set the correct frame initially
        }
        // Comment idea: Methods for taking damage, playing animations, simple AI later.
    };

    // Override update to set the correct frame for multi-character sheets
    // This is a simplified version of what Sprite_Character does.
    Sprite_MMBNEnemy.prototype.updateBitmap = function() {
        if (this.isImageReady()) {
            this.updateFrame();
        }
    };

    Sprite_MMBNEnemy.prototype.updateFrame = function() {
        if (this._characterName === "" || this._characterIndex < 0) {
            this.bitmap = null; // No image
            return;
        }
        const pw = this.patternWidth();
        const ph = this.patternHeight();
        const sx = (this.characterBlockX() + this.characterPatternX()) * pw;
        const sy = (this.characterBlockY() + this.characterPatternY()) * ph;
        this.setFrame(sx, sy, pw, ph);
    };

    Sprite_MMBNEnemy.prototype.characterBlockX = function() {
        const index = this._characterIndex;
        return (index % 4) * 3; // 3 patterns wide per character block
    };

    Sprite_MMBNEnemy.prototype.characterBlockY = function() {
        const index = this._characterIndex;
        return Math.floor(index / 4) * 4; // 4 patterns high per character block
    };

    Sprite_MMBNEnemy.prototype.characterPatternX = function() {
        return 1; // Default standing pattern (middle frame of 3)
    };

    Sprite_MMBNEnemy.prototype.characterPatternY = function() {
        return 0; // Default direction (down)
        // For BN, enemies usually face left. Row 1 of patterns (0-indexed) on character sheets is often 'Up'.
        // If your sprites are set up like standard RPG Maker characters:
        // 0: Down, 1: Left, 2: Right, 3: Up
        // So, for an enemy facing left, you might use patternY = 1. Let's make it configurable or assume.
        // For now, let's use 0 (Down) and see. It might need adjustment based on sprite sheet.
        // Or, if sprites are custom single-frame, this doesn't matter as much.
    };

    Sprite_MMBNEnemy.prototype.patternWidth = function() {
        if (this.isImageReady()) {
            return this.bitmap.width / 12; // 12 frames wide in a standard sheet (4 chars * 3 patterns)
        }
        return Jules.MMBNBattle.Params.PanelWidth; // Fallback
    };

    Sprite_MMBNEnemy.prototype.patternHeight = function() {
        if (this.isImageReady()) {
            return this.bitmap.height / 8; // 8 frames high in a standard sheet (2 char blocks * 4 directions)
        }
        return Jules.MMBNBattle.Params.PanelHeight; // Fallback
    };

    Sprite_MMBNEnemy.prototype.isImageReady = function() {
        return this.bitmap && this.bitmap.isReady();
    };

    Sprite_MMBNEnemy.prototype.takeDamage = function(amount) {
        this.hp -= amount;
        if (this.hp < 0) {
            this.hp = 0;
        }
        console.log(this._enemyData.name + " took " + amount + " damage. HP: " + this.hp);
        // Future: Add visual feedback like flashing
    };

    Sprite_MMBNEnemy.prototype.update = function() {
        Sprite_Character.prototype.update.call(this);
        // Add any specific enemy update logic here
        // e.g., animation, AI decision making (in later phases), flash effect
        if (this._flashDuration && this._flashDuration > 0) {
            this._flashDuration--;
            if (this._flashDuration === 0) {
                this.setBlendColor([0, 0, 0, 0]); // Clear blend
            }
        }
        this.updateBitmap(); // Ensure frame is updated if characterName/Index changes
    };

    //=============================================================================
    // Sprite_MMBNPlayer (continued)
    //=============================================================================
    Sprite_MMBNPlayer.prototype.performBuster = function() {
        console.log("Player Buster Fired!");
        // Visual cue: Tint red briefly
        this.setBlendColor([255, 128, 128, 128]); // Light red tint
        this._busterFlashDuration = 10; // Duration in frames

        // Future: Play attack animation, sound effect
        // For now, this._battler.requestMotion("thrust"); // Example if using actor motions
    };

    Sprite_MMBNPlayer.prototype.update = function() {
        Sprite_Battler.prototype.update.call(this);
        if (this._battler) {
            this.updateMotion();
        }
        // Handle buster flash
        if (this._busterFlashDuration && this._busterFlashDuration > 0) {
            this._busterFlashDuration--;
            if (this._busterFlashDuration === 0) {
                this.setBlendColor([0, 0, 0, 0]); // Clear blend
            }
        }
        // Future: Update player state, animations based on grid position or actions
    };


    //=============================================================================
    // Scene_MMBNBattle (Input, Enemy Spawning, Movement Update & Enemy Data)
    //=============================================================================

    Scene_MMBNBattle.prototype.initialize = function() {
        Scene_Base.prototype.initialize.call(this);
        this._enemySprites = [];
        this._busterShots = [];
        this._chipProjectiles = []; // Array for chip projectiles
        this._isChipSelectActive = false;
        // Future: Initialize battle specific data like chip folder etc.
    };

    Scene_MMBNBattle.prototype.create = function() {
        Scene_Base.prototype.create.call(this);
        this.createBackground();
        this.createGrid();
        this.createPlayer();
        this.createEnemies();
        this.createWindowLayer();
        // Future: this.createHud();
        // Comment idea: Future logic for setting up based on troop data or event commands.
    };

    Scene_MMBNBattle.prototype.createEnemies = function() {
        this._enemySprites = [];
        const enemyDataArray = Jules.MMBNBattle.EnemyData || [];

        for (const enemyData of enemyDataArray) {
            const enemySprite = new Sprite_MMBNEnemy(enemyData);

            // Adjust column for enemy side: enemy col 0 is global col GridColsPerSide
            const globalCol = Jules.MMBNBattle.Params.GridColsPerSide + enemyData.defaultGridC;

            if (this._battleGridSprite) {
                const screenPos = this._battleGridSprite.getPanelScreenCoords(
                    enemyData.defaultGridR,
                    globalCol
                );
                enemySprite.x = screenPos.x;
                enemySprite.y = screenPos.y;
            } else { // Fallback if grid isn't ready, though it should be
                enemySprite.x = Graphics.boxWidth * 3/4; // Rough position
                enemySprite.y = Graphics.boxHeight / 2;
            }

            this._enemySprites.push(enemySprite);
            this.addChild(enemySprite); // Add to scene display list
        }
    };

    // Hardcoded enemy data for now
    Jules.MMBNBattle.EnemyData = [
        {
            id: 1, name: "Mettaur", characterName: "Monster", characterIndex: 0, // Example: First monster on "Monster.png"
            maxHp: 10, hp: 10,
            defaultGridR: 2, // Middle row
            defaultGridC: 1  // Second column on their side (0-indexed for their side)
        },
        {
            id: 2, name: "Mettaur2", characterName: "Monster", characterIndex: 6, // Example: A different monster
            maxHp: 10, hp: 10,
            defaultGridR: 1,
            defaultGridC: 2
        }
    ];

    Scene_MMBNBattle.prototype.update = function() {
        Scene_Base.prototype.update.call(this);

        if (!this.isBattlePaused()) {
            const playerActor = this._playerSprite ? this._playerSprite.battler() : null;
            if (playerActor) {
                playerActor.chargeCustomGauge();
                if (playerActor.isCustomGaugeFull() && !this._isChipSelectActive) {
                    this._isChipSelectActive = true;
                    console.log("Custom Gauge Full! Chip Ready.");
                }
            }

            this.updatePlayerInput();
            this.updateBusterShots();
            this.updateChipProjectiles(); // Add update for chip projectiles
            this.checkCollisions(); // This will need to handle both buster and chip projectiles
            // Future: this.updateEnemies();
        }

        if (Input.isTriggered("cancel") || TouchInput.isCancelled()) {
            this.popScene();
        }
    };

    Scene_MMBNBattle.prototype.isBattlePaused = function() {
        // Future: Return true if chip selection screen is open, or game paused.
        return false;
    };

    Scene_MMBNBattle.prototype.updatePlayerInput = function() {
        if (!this._playerSprite || !this._battleGridSprite) {
            return;
        }

        // Chip Usage Input
        if (this._isChipSelectActive && Input.isTriggered("shift")) {
            this.useChip(1); // Use hardcoded Chip ID 1 (Cannon)

            if (this._playerSprite.battler()) {
                this._playerSprite.battler().resetCustomGauge();
            }
            this._isChipSelectActive = false;
            // console.log("Custom Gauge Reset. Chip used."); // Logging is now in useChip
            return;
        }

        // Buster Attack Input (only if not using a chip)
        if (Input.isTriggered("ok")) {
            this._playerSprite.performBuster();
            this.spawnBusterShot();
            return;
        }

        // Movement Input (only if not using chip or buster)
        let targetR = this._playerSprite._gridR;
        let targetC = this._playerSprite._gridC;
        let moved = false;

        if (Input.isRepeated("down")) {
            targetR++;
            moved = true;
        } else if (Input.isRepeated("up")) {
            targetR--;
            moved = true;
        } else if (Input.isRepeated("left")) {
            targetC--;
            moved = true;
        } else if (Input.isRepeated("right")) {
            targetC++;
            moved = true;
        }

        if (moved) {
            // Validate movement: stay within player's grid boundaries
            const maxRow = Jules.MMBNBattle.Params.GridRows - 1;
            const maxCol = Jules.MMBNBattle.Params.GridColsPerSide - 1;

            if (targetR >= 0 && targetR <= maxRow && targetC >= 0 && targetC <= maxCol) {
                this._playerSprite._gridR = targetR;
                this._playerSprite._gridC = targetC;

                const newScreenPos = this._battleGridSprite.getPanelScreenCoords(targetR, targetC);
                this._playerSprite.x = newScreenPos.x;
                this._playerSprite.y = newScreenPos.y;
            }
        }
    };

    Scene_MMBNBattle.prototype.spawnBusterShot = function() {
        if (!this._playerSprite || !this._battleGridSprite) return;

        const playerPanelCoords = this._battleGridSprite.getPanelScreenCoords(
            this._playerSprite._gridR,
            this._playerSprite._gridC
        );

        // Spawn shot slightly in front of player, centered on their row
        const startX = playerPanelCoords.x + Jules.MMBNBattle.Params.PanelWidth / 2; // Start at right edge of player panel
        const startY = playerPanelCoords.y;
        const busterSpeed = 8; // Or make this a parameter/player stat

        const shot = new Sprite_BusterShot(startX, startY, busterSpeed, this._playerSprite._gridR);
        this._busterShots.push(shot);
        this.addChild(shot); // Add to display list
    };

    Scene_MMBNBattle.prototype.updateBusterShots = function() {
        for (let i = this._busterShots.length - 1; i >= 0; i--) {
            const shot = this._busterShots[i];
            shot.update();

            // Remove if off-screen (e.g., beyond the far edge of the grid)
            const gridFarEdge = this._battleGridSprite ?
                                this._battleGridSprite.x + Jules.MMBNBattle.Params.PanelWidth * Jules.MMBNBattle.Params.GridColsPerSide * 2
                                : Graphics.boxWidth;
            if (shot.x > gridFarEdge + shot.width) {
                this.removeChild(shot);
                this._busterShots.splice(i, 1);
            }
        }
    };

    Scene_MMBNBattle.prototype.checkCollisions = function() {
        // Check Buster Shots
        for (let i = this._busterShots.length - 1; i >= 0; i--) {
            const shot = this._busterShots[i];
            // Pass 1 as buster damage
            if (this.checkProjectileAgainstEnemies(shot, this._busterShots, i, 1)) {
                // if true, shot was consumed
            }
        }

        // Check Chip Projectiles
        for (let i = this._chipProjectiles.length - 1; i >= 0; i--) {
            const chipShot = this._chipProjectiles[i];
            const damage = chipShot.chipData ? chipShot.chipData.damage : 10; // Use chip's damage
            if (this.checkProjectileAgainstEnemies(chipShot, this._chipProjectiles, i, damage)) {
                // if true, chip projectile was consumed
            }
        }
    };

    Scene_MMBNBattle.prototype.checkProjectileAgainstEnemies = function(projectile, projectileArray, projectileIndex, damage) {
        if (!projectile.visible) return false;

        for (let j = this._enemySprites.length - 1; j >= 0; j--) {
            const enemy = this._enemySprites[j];
            if (!enemy.visible || enemy.hp <= 0) continue;

            // Check if projectile and enemy are on the same row
            if (projectile.gridR !== enemy._gridR) {
                continue;
            }

            // Simple Bounding Box Check
            const projLeft = projectile.x - projectile.width * projectile.anchor.x;
            const projRight = projectile.x + projectile.width * (1 - projectile.anchor.x);
            const enemyLeft = enemy.x - enemy.patternWidth() * enemy.anchor.x;
            const enemyRight = enemy.x + enemy.patternWidth() * (1 - enemy.anchor.x);

            const projTop = projectile.y - projectile.height * projectile.anchor.y;
            const projBottom = projectile.y + projectile.height * (1 - projectile.anchor.y);
            const enemyTop = enemy.y - enemy.patternHeight() * enemy.anchor.y;
            const enemyBottom = enemy.y + enemy.patternHeight() * (1 - enemy.anchor.y);

            if (projRight > enemyLeft && projLeft < enemyRight &&
                projBottom > enemyTop && projTop < enemyBottom) {

                enemy.takeDamage(damage); // Use damage from parameter
                enemy.setBlendColor([255, 0, 0, 128]);
                enemy._flashDuration = 10;

                this.removeChild(projectile);
                projectileArray.splice(projectileIndex, 1);

                if (enemy.hp <= 0) {
                    console.log(enemy._enemyData.name + " defeated!");
                    this.removeChild(enemy);
                    this._enemySprites.splice(j, 1);
                }
                return true; // Projectile was consumed
            }
        }
        return false; // Projectile was not consumed by this check
    };

    Scene_MMBNBattle.prototype.useChip = function(chipId) {
        const chipData = Jules.MMBNBattle.ChipData[chipId];
        if (!chipData) {
            console.error("Chip ID " + chipId + " not found!");
            return;
        }
        console.log("Player used Chip: " + chipData.name + " (Damage: " + chipData.damage + ")");

        if (!this._playerSprite || !this._battleGridSprite) return;

        const playerPanelCoords = this._battleGridSprite.getPanelScreenCoords(
            this._playerSprite._gridR,
            this._playerSprite._gridC
        );

        const startX = playerPanelCoords.x + Jules.MMBNBattle.Params.PanelWidth / 2;
        const startY = playerPanelCoords.y;
        const chipSpeed = 6; // Example speed for Cannon, could be per-chip

        const chipProjectile = new Sprite_ChipProjectile(startX, startY, chipSpeed, this._playerSprite._gridR, chipData);
        this._chipProjectiles.push(chipProjectile);
        this.addChild(chipProjectile);
    };

    Scene_MMBNBattle.prototype.updateChipProjectiles = function() {
        for (let i = this._chipProjectiles.length - 1; i >= 0; i--) {
            const shot = this._chipProjectiles[i];
            shot.update();
            const gridFarEdge = this._battleGridSprite ?
                                this._battleGridSprite.x + Jules.MMBNBattle.Params.PanelWidth * Jules.MMBNBattle.Params.GridColsPerSide * 2
                                : Graphics.boxWidth;
            if (shot.x > gridFarEdge + shot.width) {
                this.removeChild(shot);
                this._chipProjectiles.splice(i, 1);
            }
        }
    };

    //=============================================================================
    // Sprite_BusterShot
    //=============================================================================
    function Sprite_BusterShot() {
        this.initialize(...arguments);
    }

    Sprite_BusterShot.prototype = Object.create(Sprite.prototype);
    Sprite_BusterShot.prototype.constructor = Sprite_BusterShot;

    Sprite_BusterShot.prototype.initialize = function(startX, startY, speed, gridR) {
        Sprite.prototype.initialize.call(this);
        this.bitmap = new Bitmap(10, 4);
        this.bitmap.fillAll('yellow');
        this.x = startX;
        this.y = startY;
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this._speed = speed || 5;
        this.gridR = gridR;
    };

    Sprite_BusterShot.prototype.update = function() {
        Sprite.prototype.update.call(this);
        this.x += this._speed;
    };

    //=============================================================================
    // Sprite_ChipProjectile
    //=============================================================================
    function Sprite_ChipProjectile() {
        this.initialize(...arguments);
    }

    Sprite_ChipProjectile.prototype = Object.create(Sprite.prototype);
    Sprite_ChipProjectile.prototype.constructor = Sprite_ChipProjectile;

    Sprite_ChipProjectile.prototype.initialize = function(startX, startY, speed, gridR, chipData) {
        Sprite.prototype.initialize.call(this);
        this.chipData = chipData; // Store chip data for damage etc.
        this.gridR = gridR; // Store the row it was fired on
        this._speed = speed || 7; // Default speed if not provided by chipData

        // Basic visual, can be customized based on chipData.projectileSprite later
        this.bitmap = new Bitmap(16, 8); // Slightly larger and different shape for Cannon
        this.bitmap.fillAll('darkgrey');    // Cannon shot often grey or silver
        // Future: load different image based on chipData.projectileSprite

        this.x = startX;
        this.y = startY;
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
    };

    Sprite_ChipProjectile.prototype.update = function() {
        Sprite.prototype.update.call(this);
        this.x += this._speed;
    };


    //=============================================================================
    // Window_MMBNCustomHud
    //=============================================================================
    function Window_MMBNCustomHud() {
        this.initialize(...arguments);
    }

    Window_MMBNCustomHud.prototype = Object.create(Window_Base.prototype);
    Window_MMBNCustomHud.prototype.constructor = Window_MMBNCustomHud;

    Window_MMBNCustomHud.prototype.initialize = function(rect) {
        Window_Base.prototype.initialize.call(this, rect);
        this._playerActor = null;
        this._lastHp = -1;
        this._lastCustomGauge = -1;
        this.opacity = 0; // Make it transparent like other HUDs often are
        // If using a specific windowskin part for HUD, might set openness differently
    };

    Window_MMBNCustomHud.prototype.setPlayerActor = function(actor) {
        if (this._playerActor !== actor) {
            this._playerActor = actor;
            this.refresh();
        }
    };

    Window_MMBNCustomHud.prototype.refresh = function() {
        this.contents.clear();
        if (!this._playerActor) {
            return;
        }

        const lineHeight = this.lineHeight();
        const gaugeHeight = 12; // Height of the gauge bar itself
        const xOffset = this.itemPadding();
        let yOffset = this.itemPadding();

        // Player Name
        this.resetTextColor();
        this.drawText(this._playerActor.name(), xOffset, yOffset, this.innerWidth - xOffset * 2);
        yOffset += lineHeight;

        // Player HP
        const hpText = `HP: ${this._playerActor.hp} / ${this._playerActor.mhp}`;
        this.drawText(hpText, xOffset, yOffset, this.innerWidth - xOffset * 2);
        yOffset += lineHeight;

        // Custom Gauge
        const gaugeY = yOffset + (lineHeight - gaugeHeight) / 2; // Center gauge bar within line height
        const gaugeWidth = this.innerWidth - xOffset * 2;
        const rate = this._playerActor.customGauge() / this._playerActor.maxCustomGauge();
        const fillColor1 = ColorManager.gaugeColor1(); // Default gauge color
        const fillColor2 = ColorManager.gaugeColor2(); // Default gauge color

        this.drawGauge(xOffset, gaugeY, gaugeWidth, rate, fillColor1, fillColor2);

        this.resetTextColor();
        if (this._playerActor.isCustomGaugeFull()) {
            this.changeTextColor(ColorManager.powerUpColor()); // Yellowish for ready
            this.drawText("READY!", xOffset, yOffset, gaugeWidth, "center");
        } else {
            const percentage = Math.floor(rate * 100);
            this.drawText(`CUSTOM: ${percentage}%`, xOffset, yOffset, gaugeWidth, "center");
        }

        this._lastHp = this._playerActor.hp;
        this._lastCustomGauge = this._playerActor.customGauge();
    };

    Window_MMBNCustomHud.prototype.update = function() {
        Window_Base.prototype.update.call(this);
        if (this._playerActor) {
            if (this._playerActor.hp !== this._lastHp ||
                this._playerActor.customGauge() !== this._lastCustomGauge) {
                this.refresh();
            }
        }
    };

    //=============================================================================
    // Scene_MMBNBattle (HUD integration)
    //=============================================================================
    Scene_MMBNBattle.prototype.createWindowLayer = function() {
        Window_Message.prototype.create.call(this); // From Scene_Message
        this.createAllWindows(); // From Scene_Message
        this.createHud();
    };

    Scene_MMBNBattle.prototype.createHud = function() {
        const hudRect = this.hudWindowRect();
        this._customHudWindow = new Window_MMBNCustomHud(hudRect);
        if (this._playerSprite && this._playerSprite.battler()) {
            this._customHudWindow.setPlayerActor(this._playerSprite.battler());
        }
        this.addWindow(this._customHudWindow);
    };

    Scene_MMBNBattle.prototype.hudWindowRect = function() {
        // Position HUD, e.g., top-left
        const ww = 240; // Window width
        const wh = this.calcWindowHeight(3, false); // 3 lines: Name, HP, Gauge
        const wx = 0;
        const wy = 0;
        return new Rectangle(wx, wy, ww, wh);
    };

    // Ensure createAllWindows is called after other windows might be made by Scene_Message's create.
    // Scene_Message.prototype.createAllWindows calls this._messageWindow.setGoldWindow(this._goldWindow); etc.
    // We are adding our HUD to the general window layer.
    // const _Scene_MMBNBattle_createAllWindows = Scene_MMBNBattle.prototype.createAllWindows;
    // Scene_MMBNBattle.prototype.createAllWindows = function() {
    //     if (_Scene_MMBNBattle_createAllWindows) _Scene_MMBNBattle_createAllWindows.call(this);
    //     this.createHud();
    // };
    // The above alias is tricky because Scene_MMBNBattle doesn't directly inherit Scene_Message.
    // Scene_Base creates the window layer. Scene_Message adds message window to it.
    // It's simpler to just modify createWindowLayer if we are not using message window functionality from Scene_Message.
    // For now, the direct call in createWindowLayer (which itself might be an override from Scene_Message if we used it) is okay.

    //=============================================================================
    // BattleChip Data (Hardcoded)
    //=============================================================================
    Jules.MMBNBattle.ChipData = {
        1: {
            id: 1,
            name: "Cannon",
            damage: 40,
            element: "None", // Future: "Fire", "Aqua", "Elec", "Wood"
            code: "C",
            description: "Shoots a cannonball straight ahead.",
            type: "attack", // Future: "recovery", "support", "obstacle"
            rangeType: "straight_row", // Future: "pierce_row", "area_grab", "self"
            projectileSprite: "CannonShot", // Hint for visual representation
            // Future: speed, hit_animation, sound_effect, status_effect, etc.
        }
        // Add more chips here in the future
        // 2: { id: 2, name: "Shotgun", ... }
    };

})();
