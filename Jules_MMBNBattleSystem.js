//=============================================================================
// Jules_MMBNBattleSystem.js
//=============================================================================

/*:
 * @target MZ
 * @plugindesc (v0.01) A Mega Man Battle Network-style battle system.
 * @author Jules
 * @url https://example.com/jules-mmbnbattlesystem
 *
 * @help
 * Jules_MMBNBattleSystem.js
 * Version 0.01
 *
 * This plugin implements a battle system inspired by Mega Man Battle Network.
 * Phase 1: Core Scene, Grid, and Player Setup.
 *
 * @command StartMMBNBattle
 * @text Start MMBN Battle
 * @desc Starts a test MMBN-style battle.
 * @arg troopId
 * @text Troop ID
 * @desc The ID of the troop for this battle. Leave 0 for default (Troop 1).
 * @type troop
 * @default 0
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
 * @param PlayerPanelColor
 * @text Player Panel Color
 * @desc The fill color for the player's side of the grid panels.
 * @type string
 * @default rgba(100,100,255,0.3)
 *
 * @param EnemyPanelColor
 * @text Enemy Panel Color
 * @desc The fill color for the enemy's side of the grid panels.
 * @type string
 * @default rgba(255,100,100,0.3)
 *
 * @param GridLineColor
 * @text Grid Line Color
 * @desc The color for the grid lines.
 * @type string
 * @default rgba(200,200,200,0.8)
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
 * @param DefaultPlayerActorId
 * @text Default Player Actor ID
 * @desc The Actor ID to use for the player character in test battles.
 * @type actor
 * @default 1
 *
 * @param WindowOpenCloseSpeed
 * @text Window Animation Speed
 * @desc Duration in frames for window open/close animations.
 * @type number
 * @min 1
 * @default 15
 *
 * @param GaugeChangeSpeed
 * @text Gauge Animation Speed
 * @desc Duration in frames for gauge/bar value changes.
 * @type number
 * @min 1
 * @default 20
 *
 * @param ParticleScenes
 * @text Particle Scenes
 * @desc A list of scenes to add particle effects to.
 * @type string[]
 * @default ["Scene_Title", "Scene_Map"]
 *
 * @param ParticleCount
 * @text Particle Count
 * @desc The number of particles to display.
 * @type number
 * @min 0
 * @default 50
 *
 */

var Jules = Jules || {};
Jules.MMBNBattleSystem = Jules.MMBNBattleSystem || {};
Jules.MMBNBattleSystem.pluginName = "Jules_MMBNBattleSystem";

Jules.MMBNBattleSystem.Params = {};

(() => {
    'use strict';
    console.log("Jules_MMBNBattleSystem.js is being parsed - top level");

    const params = PluginManager.parameters(Jules.MMBNBattleSystem.pluginName);

    Jules.MMBNBattleSystem.Params.GridRows = parseInt(params['GridRows']) || 5;
    Jules.MMBNBattleSystem.Params.GridColsPerSide = parseInt(params['GridColsPerSide']) || 5;
    Jules.MMBNBattleSystem.Params.PlayerPanelColor = params['PlayerPanelColor'] || 'rgba(100,100,255,0.3)';
    Jules.MMBNBattleSystem.Params.EnemyPanelColor = params['EnemyPanelColor'] || 'rgba(255,100,100,0.3)';
    Jules.MMBNBattleSystem.Params.GridLineColor = params['GridLineColor'] || 'rgba(200,200,200,0.8)';
    Jules.MMBNBattleSystem.Params.PanelWidth = parseInt(params['PanelWidth']) || 48;
    Jules.MMBNBattleSystem.Params.PanelHeight = parseInt(params['PanelHeight']) || 48;
    Jules.MMBNBattleSystem.Params.DefaultPlayerActorId = parseInt(params['DefaultPlayerActorId']) || 1;
    Jules.MMBNBattleSystem.Params.WindowOpenCloseSpeed = parseInt(params['WindowOpenCloseSpeed']) || 15;
    Jules.MMBNBattleSystem.Params.GaugeChangeSpeed = parseInt(params['GaugeChangeSpeed']) || 20;
    Jules.MMBNBattleSystem.Params.ParticleScenes = JSON.parse(params['ParticleScenes'] || '["Scene_Title", "Scene_Map"]');
    Jules.MMBNBattleSystem.Params.ParticleCount = parseInt(params['ParticleCount']) || 50;

    //=============================================================================
    // Easing Functions
    //=============================================================================
    Jules.MMBNBattleSystem.Easing = {
        // t: current time (current frame of animation)
        // b: beginning value (start position/value)
        // c: change in value (target value - start value)
        // d: duration (total frames of animation)
        linear: function(t, b, c, d) {
            if (d === 0) return b + c; // Avoid division by zero, snap to end
            return c * t / d + b;
        },
        easeOutQuad: function(t, b, c, d) {
            if (d === 0) return b + c; // Avoid division by zero
            t /= d;
            return -c * t * (t - 2) + b;
        }
        // Future: easeInQuad, easeInOutQuad, easeOutCubic, etc. can be added here.
    };

    //=============================================================================
    // Scene_Base
    //=============================================================================
    const _Scene_Base_create = Scene_Base.prototype.create;
    Scene_Base.prototype.create = function() {
        _Scene_Base_create.call(this);
        if (Jules.MMBNBattleSystem.Params.ParticleScenes.includes(this.constructor.name)) {
            this._particleSprite = new Sprite_Particles();
            this.addChild(this._particleSprite);
        }
    };

    //=============================================================================
    // Plugin Command
    //=============================================================================
    PluginManager.registerCommand(Jules.MMBNBattleSystem.pluginName, "StartMMBNBattle", args => {
        console.log("Jules_MMBNBattleSystem: StartMMBNBattle command triggered with args:", args);
        const troopId = parseInt(args.troopId) || 0;

        console.log("Jules_MMBNBattleSystem: Setting up BattleManager with troopId:", troopId || 1);
        if (troopId > 0) {
            BattleManager.setup(troopId, false, false);
        } else {
            BattleManager.setup(1, false, false); // Default to troop 1 if no valid ID
        }

        // It's crucial that $gamePlayer.makeEncounterCount() is called BEFORE BattleManager.setup()
        // if you want random encounters on map to be suppressed by this battle.
        // For a direct call from event, this might not be as critical, but good to be aware of.
        // $gamePlayer.makeEncounterCount(); // Suppresses random encounters on map

        console.log("Jules_MMBNBattleSystem: Pushing Scene_MMBNBattle onto SceneManager.");
        SceneManager.push(Scene_MMBNBattle);
    });

    //=============================================================================
    // Scene_MMBNBattle
    //=============================================================================
    function Scene_MMBNBattle() {
        this.initialize(...arguments);
    }

    Scene_MMBNBattle.prototype = Object.create(Scene_Base.prototype);
    Scene_MMBNBattle.prototype.constructor = Scene_MMBNBattle;

    Scene_MMBNBattle.prototype.initialize = function() {
        console.log("Jules_MMBNBattleSystem: Scene_MMBNBattle.initialize()");
        Scene_Base.prototype.initialize.call(this);
    };

    Scene_MMBNBattle.prototype.create = function() {
        console.log("Jules_MMBNBattleSystem: Scene_MMBNBattle.create()");
        Scene_Base.prototype.create.call(this);
        this.createDisplayObjects();
    };

    Scene_MMBNBattle.prototype.createDisplayObjects = function() {
        // Order of creation matters for Z-ordering
        this.createBackgrounds();
        this.createGrid();
        this.createPlayer();      // Create the player
        // this.createEnemies();     // Future Phase
        this.createWindowLayer();    // For HUDs, messages etc.
        // this.createAllWindows(); // If we add more complex windows
        // this.createHud();         // Future Phase
    };

    Scene_MMBNBattle.prototype.createGrid = function() {
        this._battleGridSprite = new Sprite_MMBNGrid();
        // Ensure grid is added above battlebacks but below other sprites like characters/HUDs
        // The exact layer depends on how other elements are added.
        // For now, adding it to the main scene container.
        // If a field layer for sprites is made (like Spriteset_Battle._battleField), add it there.
        this.addChild(this._battleGridSprite);
    };

    Scene_MMBNBattle.prototype.start = function() {
        console.log("Jules_MMBNBattleSystem: Scene_MMBNBattle.start()");
        Scene_Base.prototype.start.call(this);
        SceneManager.clearStack();

        let bgm = $gameSystem.battleBgm();
        // Check if $gameTroop and troop method exist, and if bgm.name is valid
        if ($gameTroop && typeof $gameTroop.troop === 'function' && $gameTroop.troop() && $gameTroop.troop().bgm && $gameTroop.troop().bgm.name) {
             // $gameParty.inBattle() might not be true yet when scene is pushed directly.
             // Relying on BattleManager.setup() to have correctly set up $gameTroop.
            bgm = $gameTroop.troop().bgm;
            console.log("Jules_MMBNBattleSystem: Using troop BGM:", bgm);
        } else {
            console.log("Jules_MMBNBattleSystem: Using system battle BGM or no BGM.", bgm);
        }
        AudioManager.playBgm(bgm);

        this.startFadeIn(this.fadeSpeed(), false);
    };

    Scene_MMBNBattle.prototype.update = function() {
        // console.log("Jules_MMBNBattleSystem: Scene_MMBNBattle.update()"); // Can be too spammy
        Scene_Base.prototype.update.call(this);

        this.updatePlayerControl();

        if (Input.isTriggered("cancel") || TouchInput.isCancelled()) {
            console.log("Jules_MMBNBattleSystem: Cancel triggered, popping scene.");
            AudioManager.stopBgm();
            this.popScene();
        }
    };

    Scene_MMBNBattle.prototype.updatePlayerControl = function() {
        if (!this._playerSprite || !this._battleGridSprite) {
            return;
        }

        // Prevent new movement commands if already moving
        if (this._playerSprite._isMoving) {
            return;
        }

        let targetR = this._playerSprite._gridR;
        let targetC = this._playerSprite._gridC;
        let moved = false;

        // Using isTriggered for distinct panel moves
        if (Input.isTriggered("down")) {
            targetR++;
            moved = true;
        } else if (Input.isTriggered("up")) {
            targetR--;
            moved = true;
        } else if (Input.isTriggered("left")) {
            targetC--;
            moved = true;
        } else if (Input.isTriggered("right")) {
            targetC++;
            moved = true;
        }

        if (moved) {
            // Validate movement: stay within player's grid boundaries
            const maxRow = Jules.MMBNBattleSystem.Params.GridRows - 1;
            const maxCol = Jules.MMBNBattleSystem.Params.GridColsPerSide - 1; // Player's side columns

            if (targetR >= 0 && targetR <= maxRow && targetC >= 0 && targetC <= maxCol) {
                this._playerSprite.setGridPosition(targetR, targetC);
            }
        }
    };

    Scene_MMBNBattle.prototype.stop = function() {
        Scene_Base.prototype.stop.call(this);
        // SceneManager.playNextScene() is called by popScene if stack not empty
        // Perform cleanup before scene transition, like stopping BGM (already in update's cancel)
        // If a fadeout is desired before popping:
        // this.startFadeOut(this.fadeSpeed(), false);
        // However, popScene usually handles its own fade if it's part of SceneManager's flow.
    };

    Scene_MMBNBattle.prototype.terminate = function() {
        Scene_Base.prototype.terminate.call(this);
        // Release resources, ensure BGM is stopped if not handled by stop() or popScene()
        // BattleManager.endBattle(0); // If using BattleManager for results screen, etc.
        // For now, AudioManager.stopBgm() in update's cancel or stop() is sufficient.
        if (BattleManager.isBattleTest()) { // MZ specific for test battles
            AudioManager.stopBgm();
            SceneManager.exit();
        }
    };

    Scene_MMBNBattle.prototype.createBackgrounds = function() {
        // This method is similar to Scene_Battle.prototype.createBackground
        this._backgroundSprite = new Sprite();
        this.addChild(this._backgroundSprite); // Acts as a container for battlebacks

        // In MZ, Spriteset_Battle handles battlebacks. We'll mimic parts of it.
        // Create battleback1 (lower)
        const battleback1Name = this.battleback1Name();
        this._back1Sprite = new Sprite_Battleback(0, battleback1Name);

        // Create battleback2 (upper)
        const battleback2Name = this.battleback2Name();
        this._back2Sprite = new Sprite_Battleback(1, battleback2Name);

        this._backgroundSprite.addChild(this._back1Sprite);
        this._backgroundSprite.addChild(this._back2Sprite);

        // Comment: The grid will be drawn on top of these.
        // We might need to adjust positioning or scaling if the grid doesn't fill the screen,
        // or if we want the battlebacks to behave like a specific BN game's background.
        // For now, default Sprite_Battleback behavior is used.
    };

    Scene_MMBNBattle.prototype.battleback1Name = function() {
        if (BattleManager.isBattleTest()) {
            return $gameSystem.battleback1Name();
        } else if ($gameMap.battleback1Name()) {
            return $gameMap.battleback1Name();
        } else if ($gameTroop.troop().battleback1Name) { // Check if function exists (MZ specific)
             return $gameTroop.troop().battleback1Name();
        } else if ($dataTroops[$gameTroop.troopId()] && $dataTroops[$gameTroop.troopId()].battleback1Name) {
             // Fallback for older MZ versions or different data structure if needed
             return $dataTroops[$gameTroop.troopId()].battleback1Name;
        }
        return "";
    };

    Scene_MMBNBattle.prototype.battleback2Name = function() {
        if (BattleManager.isBattleTest()) {
            return $gameSystem.battleback2Name();
        } else if ($gameMap.battleback2Name()) {
            return $gameMap.battleback2Name();
        } else if ($gameTroop.troop().battleback2Name) { // Check if function exists (MZ specific)
            return $gameTroop.troop().battleback2Name();
        } else if ($dataTroops[$gameTroop.troopId()] && $dataTroops[$gameTroop.troopId()].battleback2Name) {
            return $dataTroops[$gameTroop.troopId()].battleback2Name;
        }
        return "";
    };

    //=============================================================================
    // Sprite_MMBNGrid
    //=============================================================================
    function Sprite_MMBNGrid() {
        this.initialize(...arguments);
    }

    Sprite_MMBNGrid.prototype = Object.create(Sprite.prototype);
    Sprite_MMBNGrid.prototype.constructor = Sprite_MMBNGrid;

    Sprite_MMBNGrid.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);

        this._rows = Jules.MMBNBattleSystem.Params.GridRows;
        this._colsPerSide = Jules.MMBNBattleSystem.Params.GridColsPerSide;
        this._totalCols = this._colsPerSide * 2;
        this._panelWidth = Jules.MMBNBattleSystem.Params.PanelWidth;
        this._panelHeight = Jules.MMBNBattleSystem.Params.PanelHeight;

        this._playerPanelColor = Jules.MMBNBattleSystem.Params.PlayerPanelColor;
        this._enemyPanelColor = Jules.MMBNBattleSystem.Params.EnemyPanelColor;
        this._gridLineColor = Jules.MMBNBattleSystem.Params.GridLineColor;

        this._gridTotalWidth = this._totalCols * this._panelWidth;
        this._gridTotalHeight = this._rows * this._panelHeight;

        this._gridGraphics = new PIXI.Graphics();
        this.addChild(this._gridGraphics);

        // Position the entire grid sprite (e.g., centered)
        this.x = (Graphics.boxWidth - this._gridTotalWidth) / 2;
        this.y = (Graphics.boxHeight - this._gridTotalHeight) / 2;
        // Adjust y slightly upwards to make more room for potential HUD at bottom
        this.y -= Jules.MMBNBattleSystem.Params.PanelHeight / 2;
        if (this.y < 0) this.y = 0; // Ensure not off-screen top

        this.drawGrid();
    };

    Sprite_MMBNGrid.prototype.drawGrid = function() {
        this._gridGraphics.clear();

        // Player side panels
        this._gridGraphics.beginFill(PIXI.utils.string2hex(this._playerPanelColor));
        for (let r = 0; r < this._rows; r++) {
            for (let c = 0; c < this._colsPerSide; c++) {
                this._gridGraphics.drawRect(c * this._panelWidth, r * this._panelHeight, this._panelWidth, this._panelHeight);
            }
        }
        this._gridGraphics.endFill();

        // Enemy side panels
        this._gridGraphics.beginFill(PIXI.utils.string2hex(this._enemyPanelColor));
        for (let r = 0; r < this._rows; r++) {
            for (let c = 0; c < this._colsPerSide; c++) {
                this._gridGraphics.drawRect((c + this._colsPerSide) * this._panelWidth, r * this._panelHeight, this._panelWidth, this._panelHeight);
            }
        }
        this._gridGraphics.endFill();

        // Grid lines
        this._gridGraphics.lineStyle(1, PIXI.utils.string2hex(this._gridLineColor), 1);
        // Vertical lines
        for (let c = 0; c <= this._totalCols; c++) {
            const x = c * this._panelWidth;
            this._gridGraphics.moveTo(x, 0);
            this._gridGraphics.lineTo(x, this._gridTotalHeight);
        }
        // Horizontal lines
        for (let r = 0; r <= this._rows; r++) {
            const y = r * this._panelHeight;
            this._gridGraphics.moveTo(0, y);
            this._gridGraphics.lineTo(this._gridTotalWidth, y);
        }
    };

    Sprite_MMBNGrid.prototype.getPanelScreenPos = function(row, col) {
        // Calculates center of the panel in screen coordinates
        const panelLocalX = col * this._panelWidth + this._panelWidth / 2;
        const panelLocalY = row * this._panelHeight + this._panelHeight / 2;
        return { x: this.x + panelLocalX, y: this.y + panelLocalY };
    };

    Sprite_MMBNGrid.prototype.getPanelBounds = function(row, col) {
        // Calculates bounds of the panel in screen coordinates
        const panelLocalX = col * this._panelWidth;
        const panelLocalY = row * this._panelHeight;
        return new Rectangle(
            this.x + panelLocalX,
            this.y + panelLocalY,
            this._panelWidth,
            this._panelHeight
        );
    };

    // Call this if grid parameters (like colors from options) change mid-game
    Sprite_MMBNGrid.prototype.redraw = function() {
        this.drawGrid();
    };

    //=============================================================================
    // Sprite_MMBNPlayerCharacter
    //=============================================================================
    function Sprite_MMBNPlayerCharacter() {
        this.initialize(...arguments);
    }

    Sprite_MMBNPlayerCharacter.prototype = Object.create(Sprite_Actor.prototype);
    Sprite_MMBNPlayerCharacter.prototype.constructor = Sprite_MMBNPlayerCharacter;

    Sprite_MMBNPlayerCharacter.prototype.initialize = function(actor) {
        Sprite_Actor.prototype.initialize.call(this, actor); // actor is a Game_Actor instance

        // Default grid position (e.g., middle row, second col for player)
        this._gridR = Math.floor(Jules.MMBNBattleSystem.Params.GridRows / 2);
        this._gridC = 1;

        this.anchor.x = 0.5;
        this.anchor.y = 0.9; // Adjust to make sprite stand on panel lines

        // Movement tweening properties
        this._isMoving = false;
        this._moveStartX = 0;
        this._moveStartY = 0;
        this._moveTargetX = 0;
        this._moveTargetY = 0;
        this._moveDuration = Jules.MMBNBattleSystem.Params.WindowOpenCloseSpeed; // Use this for now, can be specific later
        this._moveTimer = 0;
    };

    Sprite_MMBNPlayerCharacter.prototype.setGridPosition = function(row, col, instant = false) {
        this._gridR = row;
        this._gridC = col;

        // Ensure the grid sprite is available (it should be if called from scene update)
        const gridSprite = SceneManager._scene._battleGridSprite;
        if (!gridSprite) return;

        const targetPos = gridSprite.getPanelScreenPos(row, col);

        if (instant || !this._isMoving || (this._moveTargetX === targetPos.x && this._moveTargetY === targetPos.y)) {
            this.x = targetPos.x;
            this.y = targetPos.y;
            this._isMoving = false;
        } else {
            this._moveStartX = this.x;
            this._moveStartY = this.y;
            this._moveTargetX = targetPos.x;
            this._moveTargetY = targetPos.y;
            this._moveTimer = 0;
            this._isMoving = true;
            // _moveDuration is already set from params in initialize
        }
    };

    Sprite_MMBNPlayerCharacter.prototype.update = function() {
        Sprite_Actor.prototype.update.call(this); // Handles actor specific updates like motions
        this.updateMovement();
    };

    Sprite_MMBNPlayerCharacter.prototype.updateMovement = function() {
        if (this._isMoving) {
            this._moveTimer++;
            const t = this._moveTimer;
            const bX = this._moveStartX;
            const cX = this._moveTargetX - this._moveStartX;
            const bY = this._moveStartY;
            const cY = this._moveTargetY - this._moveStartY;
            const d = this._moveDuration;

            this.x = Jules.MMBNBattleSystem.Easing.easeOutQuad(t, bX, cX, d);
            this.y = Jules.MMBNBattleSystem.Easing.easeOutQuad(t, bY, cY, d);

            if (this._moveTimer >= this._moveDuration) {
                this.x = this._moveTargetX;
                this.y = this._moveTargetY;
                this._isMoving = false;
            }
        }
    };

    //=============================================================================
    // Scene_MMBNBattle (Player Creation)
    //=============================================================================
    Scene_MMBNBattle.prototype.createPlayer = function() {
        const actorId = Jules.MMBNBattleSystem.Params.DefaultPlayerActorId;
        const gameActor = $gameActors.actor(actorId);
        if (!gameActor) {
            console.error("Jules_MMBNBattleSystem: DefaultPlayerActorId " + actorId + " not found.");
            this._playerSprite = null; // Ensure it's null if actor not found
            return;
        }

        this._playerSprite = new Sprite_MMBNPlayerCharacter(gameActor);
        // Set initial position instantly
        // Ensure grid is created before player to get coords
        if (this._battleGridSprite) {
             this._playerSprite.setGridPosition(this._playerSprite._gridR, this._playerSprite._gridC, true);
        } else {
            // Fallback if grid somehow isn't ready (should not happen with correct create order)
            console.warn("Jules_MMBNBattleSystem: Battle grid not ready when creating player.");
            this._playerSprite.x = Graphics.boxWidth / 4;
            this._playerSprite.y = Graphics.boxHeight / 2;
        }
        this.addChild(this._playerSprite);
    };

    //=============================================================================
    // Sprite_Particles
    //=============================================================================
    function Sprite_Particles() {
        this.initialize(...arguments);
    }

    Sprite_Particles.prototype = Object.create(Sprite.prototype);
    Sprite_Particles.prototype.constructor = Sprite_Particles;

    Sprite_Particles.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this.createParticles();
    };

    Sprite_Particles.prototype.createParticles = function() {
        this._particles = [];
        for (let i = 0; i < Jules.MMBNBattleSystem.Params.ParticleCount; i++) {
            this._particles.push(this.createParticle());
        }
    };

    Sprite_Particles.prototype.createParticle = function() {
        const particle = new Sprite(new Bitmap(2, 2));
        particle.bitmap.fillAll('white');
        particle.anchor.x = 0.5;
        particle.anchor.y = 0.5;
        this.addChild(particle);
        this.resetParticle(particle);
        return particle;
    };

    Sprite_Particles.prototype.resetParticle = function(particle) {
        particle.x = Math.random() * Graphics.width;
        particle.y = Math.random() * Graphics.height;
        particle.opacity = 0;
        particle.speedX = (Math.random() - 0.5) * 2;
        particle.speedY = (Math.random() - 0.5) * 2;
        particle.life = Math.random() * 200 + 100;
    };

    Sprite_Particles.prototype.update = function() {
        Sprite.prototype.update.call(this);
        this.updateParticles();
    };

    Sprite_Particles.prototype.updateParticles = function() {
        for (const particle of this._particles) {
            this.updateParticle(particle);
        }
    };

    Sprite_Particles.prototype.updateParticle = function(particle) {
        particle.life--;
        if (particle.life <= 0) {
            this.resetParticle(particle);
        }
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        if (particle.life < 100) {
            particle.opacity = (particle.life / 100) * 255;
        } else {
            particle.opacity = 255;
        }
    };

})();
