//=============================================================================
// Jules_MugenBattle.js
//=============================================================================

/*:
 * @target MZ
 * @plugindesc (v0.05) A M.U.G.E.N.-like 2D fighting battle system. Timer & HUD.
 * @author Jules
 * @url https://example.com/jules-mugenbattle
 *
 * @help
 * Jules_MugenBattle.js
 * Version 0.05 (Alpha)
 * - Implements Round Timer display on HUD.
 * - Initializes variables for round end logic.
 * - Implements timer countdown and basic round end condition checks in Scene_MugenBattle.update.
 *
 * (Previous help text...)
 *
 * @param DefaultPlayer1CharacterFile
 * @text P1 Character File
 * @desc Default character definition JSON file for Player 1.
 * @type file
 * @dir data/mugen_chars/
 * @default char_default.json
 *
 * @param DefaultPlayer2CharacterFile
 * @text P2 Character File
 * @desc Default character definition JSON file for Player 2.
 * @type file
 * @dir data/mugen_chars/
 * @default char_default.json
 *
 * @param CharacterImageDir
 * @text Character Image Directory
 * @desc Directory for character sprite sheet images.
 * @type string
 * @default img/mugen_chars/
 *
 * @param DefaultStageFile
 * @text Stage Definition File
 * @desc JSON file for stage properties like floor Y, bounds. Background image defined here is NO LONGER USED for the main backdrop (uses MZ battlebacks).
 * @type file
 * @dir data/mugen_stages/
 * @default stage_default.json
 *
 * @param StageImageDir
 * @text Stage Image Directory (Legacy)
 * @desc Directory for custom stage visual elements (NOTE: Main background now uses MZ default battlebacks).
 * @type string
 * @default img/mugen_stages/
 *
 * @param BattleBGM
 * @text Default Battle BGM
 * @desc Default Background Music for the battle.
 * @type file
 * @dir audio/bgm/
 * @default Battle1
 *
 * @param DefaultAiIntensity
 * @text Default AI Intensity
 * @desc Default AI intensity level (e.g., 1-5). Higher is typically more challenging.
 * @type number
 * @min 1
 * @max 5
 * @default 3
 *
 * @command StartMugenBattle
 * @text Start M.U.G.E.N. Battle (Test)
 * @desc Starts a test battle with default characters and stage.
 */

var Jules = Jules || {};
Jules.MugenBattle = Jules.MugenBattle || {};
Jules.MugenBattle.pluginName = "Jules_MugenBattle";

Jules.MugenBattle.Params = PluginManager.parameters(Jules.MugenBattle.pluginName);
Jules.MugenBattle.Params.DefaultPlayer1CharacterFile = Jules.MugenBattle.Params['DefaultPlayer1CharacterFile'] || "char_default.json";
Jules.MugenBattle.Params.DefaultPlayer2CharacterFile = Jules.MugenBattle.Params['DefaultPlayer2CharacterFile'] || "char_default.json";
Jules.MugenBattle.Params.CharacterImageDir = (Jules.MugenBattle.Params['CharacterImageDir'] || "img/mugen_chars/").replace(/\/$/, "") + "/";
Jules.MugenBattle.Params.DefaultStageFile = Jules.MugenBattle.Params['DefaultStageFile'] || "stage_default.json";
Jules.MugenBattle.Params.StageImageDir = (Jules.MugenBattle.Params['StageImageDir'] || "img/mugen_stages/").replace(/\/$/, "") + "/";
Jules.MugenBattle.Params.BattleBGM = Jules.MugenBattle.Params['BattleBGM'] || "Battle1";
Jules.MugenBattle.Params.DefaultAiIntensity = parseInt(Jules.MugenBattle.Params['DefaultAiIntensity']) || 3;

Jules.MugenBattle.States = {
    IDLE: 0, WALKING: 1, JUMPING_UP: 2, JUMPING_PEAK: 3, JUMPING_DOWN: 4,
    LANDING: 5, ATTACKING: 6, HIT_STUN: 7, BLOCKING_STAND: 8, BLOCKING_CROUCH: 9, KO: 10
};

Jules.MugenBattle.ROUND_DURATION_FRAMES = 99 * 60;
Jules.MugenBattle.ROUND_END_DISPLAY_TIME = 180; // 3 seconds

(() => {
    'use strict';

    PluginManager.registerCommand(Jules.MugenBattle.pluginName, "StartMugenBattle", args => {
        SceneManager.push(Scene_MugenBattle);
    });

    //=============================================================================
    // Scene_MugenBattle
    //=============================================================================
    function Scene_MugenBattle() { this.initialize(...arguments); }
    Scene_MugenBattle.prototype = Object.create(Scene_Base.prototype);
    Scene_MugenBattle.prototype.constructor = Scene_MugenBattle;

    Scene_MugenBattle.prototype.initialize = function() {
        Scene_Base.prototype.initialize.call(this);
        this._player1Data = null; this._player2Data = null; this._stageData = null;
        this._roundTimer = Jules.MugenBattle.ROUND_DURATION_FRAMES;
        this._roundOver = false;
        this._roundOverTimer = 0;
        this._roundOverMessage = "";
        this._p1InputBuffer = [];
        this._p1InputBufferMaxLength = 15;
        this._p1InputBufferTimeout = 25;
    };

    Scene_MugenBattle.prototype.create = function() {
        Scene_Base.prototype.create.call(this);
        this.loadData(); this.createSpriteset(); this.createBackgrounds();
        this.createForeground(); this.createCharacters();
        this.createWindowLayer(); this.createHudWindow();
    };

    Scene_MugenBattle.prototype.createHudWindow = function() {
        const rect = this.hudWindowRect();
        this._hudWindow = new Window_MugenHud(rect);
        if (this._player1Sprite && this._player2Sprite) {
            this._hudWindow.setFighters(this._player1Sprite, this._player2Sprite);
        }
        this.addWindow(this._hudWindow);
    };

    Scene_MugenBattle.prototype.hudWindowRect = function() { return new Rectangle(0, 0, Graphics.boxWidth, 120); };
    Scene_MugenBattle.prototype.createSpriteset = function() { this._spriteset = new Sprite(); this.addChild(this._spriteset); };
    Scene_MugenBattle.prototype.loadData = function() { this.loadStageData(); this.loadCharacterData(); };

    Scene_MugenBattle.prototype.createCharacters = function() {
        if (this._player1Data) {
            this._player1Sprite = new Sprite_FightingCharacter(this._player1Data);
            this._player1Sprite.x = Graphics.width / 4;
            this._player1Sprite.y = this.getFloorY() - (this._player1Data.offset_y || 0);
            if (this._battleField) this._battleField.addChild(this._player1Sprite);
            else this._spriteset.addChild(this._player1Sprite);
            this._player1Sprite.setState(Jules.MugenBattle.States.IDLE);
        }
        if (this._player2Data) {
            this._player2Sprite = new Sprite_FightingCharacter(this._player2Data);
            this._player2Sprite.x = Graphics.width * 3 / 4;
            this._player2Sprite.y = this.getFloorY() - (this._player2Data.offset_y || 0);
            this._player2Sprite._direction = -1;
            this._player2Sprite.scale.x = Math.abs(this._player2Sprite._characterData.scale || 1.0) * this._player2Sprite._direction;

            this._player2Sprite._isAiControlled = true;
            this._player2Sprite._aiIntensity = Jules.MugenBattle.Params.DefaultAiIntensity;
            this._player2Sprite.setupAiModifiers();
            this._player2Sprite._aiDecisionTimer = 30 + Math.randomInt(60);

            if (this._battleField) this._battleField.addChild(this._player2Sprite);
            else this._spriteset.addChild(this._player2Sprite);
            this._player2Sprite.setState(Jules.MugenBattle.States.IDLE);
        }
    };

    Scene_MugenBattle.prototype.loadStageData = function() { /* ... */
        const xhr = new XMLHttpRequest();
        const url = 'data/mugen_stages/' + Jules.MugenBattle.Params.DefaultStageFile;
        xhr.open('GET', url, false);
        try {
            xhr.send();
            if (xhr.status === 200 || (xhr.status === 0 && xhr.responseText)) {
                this._stageData = JSON.parse(xhr.responseText);
            } else { this._stageData = this.defaultStageData(); }
        } catch (e) { this._stageData = this.defaultStageData(); }
    };
    Scene_MugenBattle.prototype.defaultStageData = function() { /* ... */
        return {
            name: "Fallback Stage", floor_level_y": Graphics.height * 0.8,
            bounds_left": 50, bounds_right": Graphics.width - 50,
            scale_x: 1.0, scale_y: 1.0
        };
    };
    Scene_MugenBattle.prototype.start = function() { /* ... */
        Scene_Base.prototype.start.call(this);
        SceneManager.clearStack();
        const bgmName = (this._stageData && this._stageData.bgm) ? this._stageData.bgm : Jules.MugenBattle.Params.BattleBGM;
        if (bgmName) AudioManager.playBgm({ name: bgmName, pan: 0, pitch: 100, volume: ConfigManager.bgmVolume });
    };

    Scene_MugenBattle.prototype.update = function() {
        Scene_Base.prototype.update.call(this);

        if (this._roundOver) {
            this._roundOverTimer--;
            // Allow exiting scene with OK/Cancel after message has displayed for a bit
            if (this._roundOverTimer < (Jules.MugenBattle.ROUND_END_DISPLAY_TIME - 60) &&
                (Input.isTriggered("ok") || Input.isTriggered("cancel") || TouchInput.isTriggered())) {
                this.popScene();
            } else if (this._roundOverTimer <= 0) {
                 this.popScene();
            }
            // Sprites might continue to update for KO animations, but no new game logic
            // Character updates are already part of Scene_Base.prototype.update via this._spriteset.update()
            // if (this._player1Sprite) this._player1Sprite.update();
            // if (this._player2Sprite) this._player2Sprite.update();
            // if (this._hudWindow) this._hudWindow.update(); // HUD update is also part of Scene_Base
            return;
        }

        if (this._roundTimer > 0) {
            this._roundTimer--;
        } else if (!this._roundOver) {
            this.processRoundEnd(null, "TIME UP!");
            return;
        }

        this.updateInputBuffer();
        this.updateInput();
        if (this._player2Sprite && this._player2Sprite._isAiControlled) {
            this.updatePlayer2AI();
        }
        this.checkCollisions();

        if (!this._roundOver) {
            if (this._player1Sprite && this._player1Sprite.health <= 0 && this._player2Sprite && this._player2Sprite.health <= 0) {
                this.processRoundEnd(null, "DOUBLE K.O!");
            } else if (this._player1Sprite && this._player1Sprite.health <= 0) {
                this.processRoundEnd(this._player2Sprite, "K.O!");
            } else if (this._player2Sprite && this._player2Sprite.health <= 0) {
                this.processRoundEnd(this._player1Sprite, "K.O!");
            }
        }

        // Moved cancel check to avoid popping scene if round just ended and message is displaying
        if (Input.isTriggered("cancel") || TouchInput.isCancelled()) {
            if (!this._roundOver) {
                 this.popScene();
            }
        }
    };

    Scene_MugenBattle.prototype.processRoundEnd = function(winnerSprite = null, message = "K.O!") {
        if (this._roundOver) return;

        this._roundOver = true;
        this._roundOverTimer = Jules.MugenBattle.ROUND_END_DISPLAY_TIME;

        let finalMessage = message;

        // Determine winner if by Time Up
        if (message === "TIME UP!") {
            if (this._player1Sprite.health > this._player2Sprite.health) {
                winnerSprite = this._player1Sprite;
                finalMessage = "TIME UP! " + (this._player1Data.name || "PLAYER 1") + " WINS!";
            } else if (this._player2Sprite.health > this._player1Sprite.health) {
                winnerSprite = this._player2Sprite;
                finalMessage = "TIME UP! " + (this._player2Data.name || "PLAYER 2") + " WINS!";
            } else { // Health is equal
                finalMessage = "DRAW GAME!";
            }
        }

        if (winnerSprite === this._player1Sprite) {
            this._roundOverMessage = (message === "K.O!" ? (this._player1Data.name || "PLAYER 1") + " WINS!" : finalMessage);
            if (this._player2Sprite && this._player2Sprite.health <=0) this._player2Sprite.setState(Jules.MugenBattle.States.KO);
        } else if (winnerSprite === this._player2Sprite) {
            this._roundOverMessage = (message === "K.O!" ? (this._player2Data.name || "PLAYER 2") + " WINS!" : finalMessage);
            if (this._player1Sprite && this._player1Sprite.health <=0) this._player1Sprite.setState(Jules.MugenBattle.States.KO);
        } else { // Draw or specific message like DOUBLE KO
             this._roundOverMessage = finalMessage;
            if (this._player1Sprite && this._player1Sprite.health <=0) this._player1Sprite.setState(Jules.MugenBattle.States.KO);
            if (this._player2Sprite && this._player2Sprite.health <=0) this._player2Sprite.setState(Jules.MugenBattle.States.KO);
        }

        console.log("Round Over:", this._roundOverMessage);
        AudioManager.fadeOutBgm(1);
        // Consider playing a round end sound effect
        // SoundManager.playSystemSound( /* appropriate sound */ );
        if(this._hudWindow) this._hudWindow.refresh(); // Force HUD refresh for message
    };


    Scene_MugenBattle.prototype.addP1InputToBuffer = function(inputType) {
        this._p1InputBuffer.push({ type: inputType, frame: Graphics.frameCount });
        if (this._p1InputBuffer.length > this._p1InputBufferMaxLength) {
            this._p1InputBuffer.shift();
        }
    };

    Scene_MugenBattle.prototype.updateInputBuffer = function() {
        const currentFrame = Graphics.frameCount;
        this._p1InputBuffer = this._p1InputBuffer.filter(
            input => (currentFrame - input.frame) < this._p1InputBufferTimeout
        );
    };

    Scene_MugenBattle.prototype.updateInput = function() {
        if (this._roundOver) return;
        if (Input.isTriggered("left")) this.addP1InputToBuffer("left");
        if (Input.isTriggered("right")) this.addP1InputToBuffer("right");
        if (Input.isTriggered("up")) this.addP1InputToBuffer("up");
        if (Input.isTriggered("down")) this.addP1InputToBuffer("down");

        if (!this._player1Sprite || !this._player1Sprite.canPerformAction()) return;

        let p1ToOpponentDir = 0;
        if (this._player2Sprite) p1ToOpponentDir = (this._player2Sprite.x > this._player1Sprite.x) ? 1 : -1;

        const isHoldingLeft = Input.isPressed("left");
        const isHoldingRight = Input.isPressed("right");
        const isAttemptingBlock = (isHoldingLeft && p1ToOpponentDir === 1) || (isHoldingRight && p1ToOpponentDir === -1);

        if (isAttemptingBlock && (this._player1Sprite._state === Jules.MugenBattle.States.IDLE || this._player1Sprite._state === Jules.MugenBattle.States.WALKING)) {
            if (this._player1Sprite._direction !== p1ToOpponentDir) {
                 this._player1Sprite._direction = p1ToOpponentDir;
                 this._player1Sprite.scale.x = Math.abs(this._player1Sprite._characterData.scale || 1.0) * this._player1Sprite._direction;
            }
            this._player1Sprite.attemptBlock();
        } else if (this._player1Sprite._state === Jules.MugenBattle.States.BLOCKING_STAND && !isAttemptingBlock) {
            this._player1Sprite.stopBlock();
        } else if (isHoldingLeft) {
            this._player1Sprite.walk(-1);
        } else if (isHoldingRight) {
            this._player1Sprite.walk(1);
        } else {
            if (this._player1Sprite._state === Jules.MugenBattle.States.WALKING) this._player1Sprite.stopWalk();
        }

        if (Input.isTriggered("ok") || Input.isTriggered("up")) {
            if(Input.isTriggered("ok")) this.addP1InputToBuffer("jump_button");
            this._player1Sprite.performJump();
        }

        if (Input.isTriggered("shift") || Input.isTriggered("pagedown")) {
            this.addP1InputToBuffer("punch_light");
            this._player1Sprite.performAttack("punch_light");
        } else if (Input.isTriggered("control")) {
             this.addP1InputToBuffer("punch_heavy");
             this._player1Sprite.performAttack("punch_heavy");
        }
    };

    Scene_MugenBattle.prototype.updatePlayer2AI = function() {
        if (this._roundOver) return;
        const p2 = this._player2Sprite; const p1 = this._player1Sprite;
        if (!p2 || !p1 ) return;
        if (p2._aiActionTimer > 0) {
            p2._aiActionTimer--;
            if (p2._state === Jules.MugenBattle.States.BLOCKING_STAND && p2._aiActionTimer <= 0) { p2.stopBlock(); p2._aiCurrentAction = 'idle'; }
            else if ((p2._aiCurrentAction === 'walk_towards' || p2._aiCurrentAction === 'walk_away') && p2._aiActionTimer <= 0) { p2.stopWalk(); p2._aiCurrentAction = 'idle';}
            if (p2._aiActionTimer > 0 && p2._state === Jules.MugenBattle.States.BLOCKING_STAND) return;
        }
        if (!p2.canPerformAction() && !(p2._state === Jules.MugenBattle.States.WALKING && p2._aiActionTimer <= 0) ) return;
        p2._aiDecisionTimer--;
        if (p2._aiDecisionTimer <= 0) {
            const intensity = p2._aiIntensity;
            const decisionCooldownBase = 45 - (intensity * 6);
            const decisionCooldownRandom = 35 - (intensity * 5);
            p2._aiDecisionTimer = Math.max(5, decisionCooldownBase) + Math.randomInt(Math.max(5, decisionCooldownRandom));
            const dX = Math.abs(p1.x - p2.x);
            const p1F = p1._animationFrames[p1._frameIndex] || (p1._characterData.animations.idle ? p1._characterData.animations.idle.frames[0] : {w:50});
            const p2F = p2._animationFrames[p2._frameIndex] || (p2._characterData.animations.idle ? p2._characterData.animations.idle.frames[0] : {w:50});
            const p1W = p1F.w * Math.abs(p1.scale.x||1.0); const p2W = p2F.w * Math.abs(p2.scale.x||1.0);
            const closeRange = (p1W/2 + p2W/2) + 10 + (intensity * 8);
            const blockProx = closeRange + 30 + (intensity * 8);
            const sight = 300 + (intensity * 40);
            if (p2._state === Jules.MugenBattle.States.IDLE || p2._state === Jules.MugenBattle.States.WALKING) {
                if (p1.x < p2.x && p2._direction === 1) p2._direction = -1; else if (p1.x > p2.x && p2._direction === -1) p2._direction = 1;
                p2.scale.x = Math.abs(p2._characterData.scale || 1.0) * p2._direction;
            }
            const blockChance = Math.min(0.95, 0.50 + (intensity - 1) * (0.40 / 4));
            const attackChance = Math.min(0.90, 0.30 + (intensity - 1) * (0.45 / 4));
            const walkTowardsChance = Math.min(0.90, 0.45 + (intensity - 1) * (0.30 / 4));
            const walkAwayChance = Math.min(0.60, 0.15 + (intensity - 1) * (0.20 / 4));
            if (p1._state === Jules.MugenBattle.States.ATTACKING && dX < blockProx && p1._activeHitboxes.length > 0) {
                if (Math.random() < blockChance) {
                    if ((p2._direction === 1 && p1.x > p2.x) || (p2._direction === -1 && p1.x < p2.x)) {
                        p2.attemptBlock(); p2._aiCurrentAction = 'blocking'; p2._aiActionTimer = 15 + Math.randomInt(10 + intensity * 2);
                    }
                }
            } else if (dX < closeRange) {
                if (Math.random() < attackChance && p2.canPerformAction()) {
                    const attackChoice = (intensity >= 3 && Math.random() < (0.2 + intensity * 0.1) && p2._characterData.attacks["punch_heavy"]) ? "punch_heavy" : "punch_light";
                    p2.performAttack(attackChoice); p2._aiCurrentAction = 'attacking';
                } else if (Math.random() < walkAwayChance && p2.canPerformAction()) {
                    p2.walk(-p2._direction); p2._aiCurrentAction = 'walk_away';
                    p2._aiActionTimer = 10 + Math.randomInt(10 + intensity);
                } else { p2._aiCurrentAction = 'idle'; if (p2._state === Jules.MugenBattle.States.WALKING) p2.stopWalk(); }
            } else if (dX < sight) {
                if (Math.random() < walkTowardsChance && p2.canPerformAction()) {
                    p2.walk(p2._direction); p2._aiCurrentAction = 'walk_towards';
                    p2._aiActionTimer = 20 + Math.randomInt(25 + intensity * 5);
                } else { if (p2._state === Jules.MugenBattle.States.WALKING) p2.stopWalk(); p2._aiCurrentAction = 'idle'; }
            } else { if (p2._state === Jules.MugenBattle.States.WALKING) p2.stopWalk(); p2._aiCurrentAction = 'idle'; }
        } else if (p2._aiActionTimer <= 0 && (p2._aiCurrentAction === 'walk_towards' || p2._aiCurrentAction === 'walk_away')) {
            p2.stopWalk(); p2._aiCurrentAction = 'idle';
        }
    };

    Scene_MugenBattle.prototype.stop = function() { /* ... */
        Scene_Base.prototype.stop.call(this); AudioManager.stopBgm();
    };
    Scene_MugenBattle.prototype.createBackgrounds = function() { /* ... */
        this._back1Sprite = new Sprite_Battleback(this.battleback1Name(), 0);
        this._back2Sprite = new Sprite_Battleback(this.battleback2Name(), 1);
        this._battleField = new Sprite(); this._spriteset.addChild(this._battleField);
        this._battleField.addChild(this._back1Sprite); this._battleField.addChild(this._back2Sprite);
    };
    Scene_MugenBattle.prototype.battleback1Name = function() { /* ... */
        if ($gameParty.inBattle() && $gameTroop.battleback1Name()) return $gameTroop.battleback1Name();
        if ($gameMap.battleback1Name()) return $gameMap.battleback1Name();
        if ($dataSystem && $dataSystem.battleBacks1 && $dataSystem.battleBacks1.length > 0) return $dataSystem.battleBacks1[0].name;
        return "";
    };
    Scene_MugenBattle.prototype.battleback2Name = function() { /* ... */
        if ($gameParty.inBattle() && $gameTroop.battleback2Name()) return $gameTroop.battleback2Name();
        if ($gameMap.battleback2Name()) return $gameMap.battleback2Name();
        if ($dataSystem && $dataSystem.battleBacks2 && $dataSystem.battleBacks2.length > 0) return $dataSystem.battleBacks2[0].name;
        return "";
    };
    Scene_MugenBattle.prototype.createForeground = function() { /* ... */
        this._foregroundSprite = new Sprite(new Bitmap(Graphics.width, Graphics.height));
        this._spriteset.addChild(this._foregroundSprite); this.drawFloorLine();
    };
    Scene_MugenBattle.prototype.drawFloorLine = function() { /* ... */
        if (this._stageData && this._foregroundSprite && this._foregroundSprite.bitmap) {
            const y = this._stageData.floor_level_y || Graphics.height * 0.8;
            this._foregroundSprite.bitmap.fillRect(0, y -1, Graphics.width, 2, 'rgba(255,0,0,0.5)');
        }
    };
    Scene_MugenBattle.prototype.getFloorY = function() { /* ... */
        return (this._stageData && this._stageData.floor_level_y) ? this._stageData.floor_level_y : Graphics.height * 0.8;
    };
    Scene_MugenBattle.prototype.getBounds = function() { /* ... */
        if (this._stageData) return { left: this._stageData.bounds_left || 0, right: this._stageData.bounds_right || Graphics.width };
        return { left: 0, right: Graphics.width };
    };
    Rectangle.prototype.intersects = function(other) { /* ... */
        return (this.x < other.x + other.width && this.x + this.width > other.x &&
                this.y < other.y + other.height && this.y + this.height > other.y);
    };

    Scene_MugenBattle.prototype.checkCollisions = function() { /* ... */
        const checkAttackerVsDefender = (attacker, defender) => {
            if (attacker && defender &&
                attacker._state === Jules.MugenBattle.States.ATTACKING &&
                attacker._activeHitboxes.length > 0 &&
                !attacker._currentAttackHasHit) {
                const attackerHitboxes = attacker.getGlobalCollisionRects(attacker._activeHitboxes);
                const defenderHurtboxes = defender.getGlobalCollisionRects(defender._activeHurtboxes);
                for (const hitBox of attackerHitboxes) {
                    for (const hurtBox of defenderHurtboxes) {
                        if (hitBox.intersects(hurtBox)) {
                            attacker._currentAttackHasHit = true;
                            const attackName = attacker._currentAttackName;
                            const defaultAttackProps = { animation: "punch_light_anim", damage: 10, hitStunFrames: 10, blockStunFrames: 5, chipDamage: 1, pushbackX: 2, pushbackY: -1, blockPushbackX: 1 };
                            let attackData = (attacker._characterData.attacks && attacker._characterData.attacks[attackName]) || defaultAttackProps;

                            let scaledDamage = attackData.damage;
                            if (attacker._isAiControlled) {
                                scaledDamage *= attacker.attackPowerMultiplier;
                            }
                            if (attacker._comboHits > 0) {
                                scaledDamage = Math.max(Math.round(attackData.damage * 0.1), Math.round(scaledDamage * Math.pow(0.9, attacker._comboHits)));
                            }
                            scaledDamage = Math.round(scaledDamage);

                            const damagePayload = {
                                damage: scaledDamage,
                                hitStunFrames: attackData.hitStunFrames,
                                blockStunFrames: attackData.blockStunFrames,
                                chipDamage: attackData.chipDamage,
                                pushbackX: attackData.pushbackX,
                                blockPushbackX: attackData.blockPushbackX !== undefined ? attackData.blockPushbackX : (attackData.pushbackX / 2),
                                pushbackY: attackData.pushbackY,
                                hitAnimationName: attackData.hitAnimationName || "hit_light",
                                blockAnimationName: attackData.blockAnimationName || "block_stand",
                                attackerDirection: attacker._direction
                            };
                            const wasBlocked = defender.takeHit(damagePayload);
                            if (wasBlocked) { attacker._comboHits = 0; }
                            else { attacker._comboHits++; }
                            return true;
                        }
                    }
                }
            }
            return false;
        };
        if (checkAttackerVsDefender(this._player1Sprite, this._player2Sprite)) return;
        if (checkAttackerVsDefender(this._player2Sprite, this._player1Sprite)) return;
    };

    Scene_MugenBattle.prototype.loadCharacterData = function() { /* ... */
        const loadChar = (filename, isPlayer1) => {
            const xhr = new XMLHttpRequest();
            const url = 'data/mugen_chars/' + filename;
            xhr.open('GET', url, false);
            try {
                xhr.send();
                if (xhr.status === 200 || (xhr.status === 0 && xhr.responseText)) {
                    const data = JSON.parse(xhr.responseText);
                    if (data.sprite_sheet) ImageManager.loadBitmap(Jules.MugenBattle.Params.CharacterImageDir, data.sprite_sheet, 0, true);
                    return data;
                } else { return this.defaultCharacterData((isPlayer1 ? "Player 1" : "Player 2") + " Default"); }
            } catch (e) { return this.defaultCharacterData((isPlayer1 ? "Player 1" : "Player 2") + " Default"); }
        };
        this._player1Data = loadChar(Jules.MugenBattle.Params.DefaultPlayer1CharacterFile, true);
        if (Jules.MugenBattle.Params.DefaultPlayer2CharacterFile === Jules.MugenBattle.Params.DefaultPlayer1CharacterFile && this._player1Data) {
            this._player2Data = JSON.parse(JSON.stringify(this._player1Data));
            this._player2Data.name = (this._player1Data.name || "Player 1") + " (Clone P2)";
        } else { this._player2Data = loadChar(Jules.MugenBattle.Params.DefaultPlayer2CharacterFile, false); }
    };
    Scene_MugenBattle.prototype.defaultCharacterData = function(name = "Default Character") { /* ... */
        return {
            name: name, author: "Fallback", version_date: "N/A", scale: 1.0, sprite_sheet: "", offset_x": 0, offset_y": 0,
            health:1000, maxHealth:1000,
            animations: {
                idle: { frames: [{ "x": 0, "y": 0, "w": 50, "h": 100, "duration": 60, "hurtboxes": [{"type":"hurt","x":-25,"y":-100,"w":50,"h":100}] }], loop: true },
                walk: { frames: [{ "x": 0, "y": 0, "w": 50, "h": 100, "duration": 60, "hurtboxes": [{"type":"hurt","x":-25,"y":-100,"w":50,"h":100}] }], loop: true },
                jump_neutral_up: { frames: [{ "x": 0, "y": 0, "w": 50, "h": 100, "duration": 60, "hurtboxes": [{"type":"hurt","x":-25,"y":-100,"w":50,"h":100}] }], loop: false },
                jump_neutral_peak: { frames: [{ "x": 0, "y": 0, "w": 50, "h": 100, "duration": 60, "hurtboxes": [{"type":"hurt","x":-25,"y":-100,"w":50,"h":100}] }], loop: false },
                jump_neutral_down: { frames: [{ "x": 0, "y": 0, "w": 50, "h": 100, "duration": 60, "hurtboxes": [{"type":"hurt","x":-25,"y":-100,"w":50,"h":100}] }], loop: false },
                punch_light_anim: { frames: [{ "x": 0, "y": 0, "w": 50, "h": 100, "duration": 10, "hurtboxes": [{"type":"hurt","x":-25,"y":-100,"w":50,"h":100}], "hitboxes":[{"type":"hit","x":20,"y":-80,"w":40,"h":20}] }], loop: false },
                punch_heavy_anim: { frames: [{ "x": 0, "y": 0, "w": 50, "h": 100, "duration": 20, "hurtboxes": [{"type":"hurt","x":-25,"y":-100,"w":50,"h":100}], "hitboxes":[{"type":"hit","x":25,"y":-80,"w":45,"h":25}] }], loop: false },
                hit_light: { frames: [{ "x": 0, "y": 0, "w": 50, "h": 100, "duration": 20, "hurtboxes": [{"type":"hurt","x":-25,"y":-100,"w":50,"h":100}] }], loop: false },
                block_stand: { frames: [{ "x": 0, "y": 0, "w": 50, "h": 100, "duration": 5, "hurtboxes": [{"type":"hurt","x":-25,"y":-100,"w":50,"h":100}] }], loop: false }
            },
            movement: { walk_fwd_speed": 2, walk_back_speed": 1.5, jump_neutral_y_velocity": -12, gravity": 0.6 },
            attacks: {
                punch_light: { animation: "punch_light_anim", damage: 50, hitStunFrames: 15, blockStunFrames: 7, chipDamage: 2, blockPushbackX: 1, pushbackX:3, pushbackY: -1 },
                punch_heavy: { animation: "punch_heavy_anim", damage: 100, hitStunFrames: 25, blockStunFrames: 12, chipDamage: 5, pushbackX:5, pushbackY: -3, blockPushbackX: 2 }
            }
        };
    };

    //=============================================================================
    // Sprite_FightingCharacter
    //=============================================================================
    function Sprite_FightingCharacter() { this.initialize(...arguments); }
    Sprite_FightingCharacter.prototype = Object.create(Sprite.prototype);
    Sprite_FightingCharacter.prototype.constructor = Sprite_FightingCharacter;

    Sprite_FightingCharacter.prototype.initialize = function(characterData) {
        Sprite.prototype.initialize.call(this);
        this._characterData = characterData;
        this._animationName = null; this._animationFrames = []; this._animationLoop = false;
        this._animationSpeedFactor = 1.0; this._animationTimer = 0; this._frameIndex = 0;
        this._activeHitboxes = []; this._activeHurtboxes = [];
        this._state = Jules.MugenBattle.States.IDLE;
        this._xVelocity = 0; this._yVelocity = 0;
        this._currentAttackName = null; this._hitStunTimer = 0; this._comboHits = 0;
        this._direction = 1;
        this._gravity = (this._characterData.movement && this._characterData.movement.gravity) || 0.7;

        this._aiDecisionTimer = 0; this._aiActionTimer = 0;
        this._aiCurrentAction = 'idle';
        this._isAiControlled = false;
        this._aiIntensity = Jules.MugenBattle.Params.DefaultAiIntensity;

        this.attackPowerMultiplier = 1.0;
        this.movementSpeedMultiplier = 1.0;
        this.defenseFactor = 1.0;

        this.anchor.x = 0.5; this.anchor.y = 1.0;

        if (this._characterData.sprite_sheet) {
            this.bitmap = ImageManager.loadBitmap(Jules.MugenBattle.Params.CharacterImageDir, this._characterData.sprite_sheet, 0, true);
        } else { this.bitmap = new Bitmap(1,1); }

        if (this._characterData.scale) {
            this.scale.x = this._characterData.scale; this.scale.y = this._characterData.scale;
        }
        this.health = this._characterData.health || 1000;
        this.maxHealth = this._characterData.maxHealth || 1000;
    };

    Sprite_FightingCharacter.prototype.setupAiModifiers = function() {
        if (!this._isAiControlled) return;
        const intensity = this._aiIntensity;
        this.attackPowerMultiplier = 1 + (intensity - 1) * 0.1;
        this.movementSpeedMultiplier = 1 + (intensity - 1) * 0.05;
        this.defenseFactor = Math.max(0.5, 1 - (intensity - 1) * 0.05);
        console.log(`${this._characterData.name} (AI Intensity ${intensity}): APM=${this.attackPowerMultiplier}, MSM=${this.movementSpeedMultiplier}, DF=${this.defenseFactor}`);
    };

    Sprite_FightingCharacter.prototype.playAnimation = function(animationName) { /* ... */
        if (!this._characterData.animations || !this._characterData.animations[animationName]) {
            if (this._characterData.animations["idle"]) animationName = "idle";
            else { this._animationFrames = []; this._animationName = animationName; this.setFrame(0,0,0,0); return; }
        }
        if (this._animationName === animationName && this._animationFrames.length > 0 && this._animationLoop && this._state !== Jules.MugenBattle.States.HIT_STUN) return;
        const animData = this._characterData.animations[animationName];
        this._animationName = animationName; this._animationFrames = animData.frames || [];
        this._animationLoop = animData.loop !== undefined ? animData.loop : false;
        this._animationSpeedFactor = animData.speed !== undefined ? animData.speed : 1.0;
        this._frameIndex = 0; this._animationTimer = 0;
        this.updateAnimationFrame();
    };
    Sprite_FightingCharacter.prototype.update = function() { /* ... */
        Sprite.prototype.update.call(this); this.updateState(); this.updateAnimation();
    };
    Sprite_FightingCharacter.prototype.setState = function(newState) { /* ... */
        if (this._state === newState && newState !== Jules.MugenBattle.States.ATTACKING && newState !== Jules.MugenBattle.States.KO) return;

        const oldState = this._state;
        this._state = newState;

        if (oldState !== newState || (newState === Jules.MugenBattle.States.ATTACKING || newState === Jules.MugenBattle.States.KO)) { // Reset animation if state changes or it's an attack/KO
            this._animationTimer = 0;
            this._frameIndex = 0;
        }

        switch (this._state) {
            case Jules.MugenBattle.States.IDLE:
                this.playAnimation("idle");
                if (oldState !== Jules.MugenBattle.States.BLOCKING_STAND) this._xVelocity = 0; // Allow slide from block
                break;
            case Jules.MugenBattle.States.WALKING:
                this.playAnimation("walk");
                break;
            case Jules.MugenBattle.States.JUMPING_UP:
                if (oldState !== Jules.MugenBattle.States.JUMPING_UP) { // Only set initial jump velocity if not already jumping up
                    this._yVelocity = (this._characterData.movement && this._characterData.movement.jump_neutral_y_velocity) || -15;
                }
                this.playAnimation("jump_neutral_up");
                break;
            case Jules.MugenBattle.States.JUMPING_PEAK:
                this.playAnimation("jump_neutral_peak");
                break;
            case Jules.MugenBattle.States.JUMPING_DOWN:
                this.playAnimation("jump_neutral_down");
                break;
            case Jules.MugenBattle.States.LANDING:
                this.setState(Jules.MugenBattle.States.IDLE);
                break;
            case Jules.MugenBattle.States.ATTACKING:
                if (!this.isAerialState()) this._xVelocity = 0;
                // Animation is set by performAttack
                break;
            case Jules.MugenBattle.States.HIT_STUN:
                this._currentAttackName = null;
                this._activeHitboxes = [];
                // Animation is set by takeHit
                break;
            case Jules.MugenBattle.States.BLOCKING_STAND:
                this.playAnimation("block_stand");
                // _xVelocity might be set by pushback during block
                break;
            case Jules.MugenBattle.States.KO:
                this._xVelocity = 0;
                // Potentially a small _yVelocity if KO'd mid-air to fall.
                // if (!this.isOnGround()) this._yVelocity = Math.min(this._yVelocity, 2); // Ensure falling if KO'd in air
                this._activeHitboxes = [];
                this._activeHurtboxes = []; // No longer hittable
                if (this._characterData.animations["ko_fall_anim"]) {
                    this.playAnimation("ko_fall_anim");
                } else if (this._characterData.animations["hit_heavy"]) { // Fallback KO anim
                    this.playAnimation("hit_heavy");
                } else { // Generic fallback
                    this.playAnimation("hit_light");
                }
                break;
        }
    };
    Sprite_FightingCharacter.prototype.updateState = function() { /* ... */
        if (this._hitStunTimer > 0) {
            this._hitStunTimer--;
            if (this._hitStunTimer === 0 && this._state === Jules.MugenBattle.States.HIT_STUN) {
                this.setState(Jules.MugenBattle.States.IDLE);
            }
        }
        switch (this._state) {
            case Jules.MugenBattle.States.JUMPING_UP: case Jules.MugenBattle.States.JUMPING_PEAK: case Jules.MugenBattle.States.JUMPING_DOWN:
                this.updateStateJumping(); break;
            case Jules.MugenBattle.States.ATTACKING: this.updateStateAttacking(); break;
        }
        this.updateCommonMovement();
    };
    Sprite_FightingCharacter.prototype.updateStateJumping = function() { /* ... */
        if (this._state === Jules.MugenBattle.States.ATTACKING) return;
        if (this._yVelocity < -1 && this._state !== Jules.MugenBattle.States.JUMPING_UP) this.playAnimation("jump_neutral_up");
        else if (this._yVelocity > 1 && this._state !== Jules.MugenBattle.States.JUMPING_DOWN) this.playAnimation("jump_neutral_down");
        else if (Math.abs(this._yVelocity) <= 1 && this._state !== Jules.MugenBattle.States.JUMPING_PEAK && this._characterData.animations["jump_neutral_peak"]) this.playAnimation("jump_neutral_peak");
    };
    Sprite_FightingCharacter.prototype.updateStateAttacking = function() { /* ... */
        if (!this.isAnimationLooping() && this.isAnimationOnLastFrame()) {
            const frame = this._animationFrames[this._frameIndex];
            if (frame && this._animationTimer >= Math.round(frame.duration / this._animationSpeedFactor) -1 ) this.finishAttack();
        }
    };
    Sprite_FightingCharacter.prototype.updateCommonMovement = function() { /* ... (Apply movementSpeedMultiplier for AI walk) ... */
        const onGround = this.y >= SceneManager._scene.getFloorY() - (this._characterData.offset_y || 0);
        if (this.isAerialState() || (this._state === Jules.MugenBattle.States.HIT_STUN && !onGround) || this._yVelocity < 0) {
            this._yVelocity += this._gravity;
        } else if (onGround && !this.isAerialState()) { this._yVelocity = 0; }

        let currentXVelocity = this._xVelocity;

        if (this._state === Jules.MugenBattle.States.HIT_STUN) { /* Pushback X Velocity already set by takeHit */ }
        else if (this._state === Jules.MugenBattle.States.BLOCKING_STAND) { currentXVelocity = 0; }
        else if (!this.isAerialState() && this._state === Jules.MugenBattle.States.ATTACKING) { currentXVelocity = 0; }

        this.x += currentXVelocity; this.y += this._yVelocity;

        const floorY = SceneManager._scene.getFloorY() - (this._characterData.offset_y || 0);
        if (this.y >= floorY && this._yVelocity >= 0) {
            this.y = floorY; this._yVelocity = 0;
            if (this.isAerialState() || this._state === Jules.MugenBattle.States.HIT_STUN) {
                if (Input.isPressed("left") || Input.isPressed("right") && this.canPerformAction()) {
                     this.setState(Jules.MugenBattle.States.WALKING);
                     if (Input.isPressed("left")) this.walk(-1, true); else this.walk(1, true);
                } else { this.setState(Jules.MugenBattle.States.IDLE); }
            }
        }
        const bounds = SceneManager._scene.getBounds();
        const charEffWidth = (this.bitmap && this.bitmap.isReady() && this._animationFrames[this._frameIndex]) ?
                             (this._animationFrames[this._frameIndex].w * Math.abs(this.scale.x)) :
                             ((this._characterData.animations.idle.frames[0].w) * Math.abs(this.scale.x) );
        if (this.x - charEffWidth * this.anchor.x < bounds.left) {
            this.x = bounds.left + charEffWidth * this.anchor.x;
            if(this._state !== Jules.MugenBattle.States.HIT_STUN) this._xVelocity = 0;
        } else if (this.x + charEffWidth * (1-this.anchor.x) > bounds.right) {
            this.x = bounds.right - charEffWidth * (1-this.anchor.x);
            if(this._state !== Jules.MugenBattle.States.HIT_STUN) this._xVelocity = 0;
        }
        const opponent = (this === SceneManager._scene._player1Sprite) ? SceneManager._scene._player2Sprite : SceneManager._scene._player1Sprite;
        if (opponent && (this._state === Jules.MugenBattle.States.IDLE || this._state === Jules.MugenBattle.States.WALKING || (this.isAerialState() && this._state !== Jules.MugenBattle.States.ATTACKING)) &&
            this._state !== Jules.MugenBattle.States.HIT_STUN && this._state !== Jules.MugenBattle.States.BLOCKING_STAND && this._state !== Jules.MugenBattle.States.KO) {
            if (this.x < opponent.x) this._direction = 1; else if (this.x > opponent.x) this._direction = -1;
        } else if (this._state !== Jules.MugenBattle.States.HIT_STUN && this._state !== Jules.MugenBattle.States.ATTACKING && this._state !== Jules.MugenBattle.States.BLOCKING_STAND) {
            if (this._xVelocity > 0) this._direction = 1; if (this._xVelocity < 0) this._direction = -1;
        }
        this.scale.x = Math.abs(this._characterData.scale || 1.0) * this._direction;
    };
    Sprite_FightingCharacter.prototype.canPerformAction = function() { /* ... */
        switch(this._state) {
            case Jules.MugenBattle.States.IDLE: case Jules.MugenBattle.States.WALKING:
            case Jules.MugenBattle.States.JUMPING_UP: case Jules.MugenBattle.States.JUMPING_PEAK: case Jules.MugenBattle.States.JUMPING_DOWN:
                return true;
            case Jules.MugenBattle.States.ATTACKING: return this.canInterruptAttack();
            case Jules.MugenBattle.States.HIT_STUN: case Jules.MugenBattle.States.LANDING: case Jules.MugenBattle.States.KO:
            case Jules.MugenBattle.States.BLOCKING_STAND: case Jules.MugenBattle.States.BLOCKING_CROUCH:
                return false;
            default: return true;
        }
    };
    Sprite_FightingCharacter.prototype.canInterruptAttack = function() { return false; };
    Sprite_FightingCharacter.prototype.isAerialState = function() { /* ... */
        return this._state === Jules.MugenBattle.States.JUMPING_UP || this._state === Jules.MugenBattle.States.JUMPING_PEAK || this._state === Jules.MugenBattle.States.JUMPING_DOWN;
    };
    Sprite_FightingCharacter.prototype.walk = function(direction, alreadyWalking = false) {
        if (!this._characterData.movement) return;
        if (!alreadyWalking && !this.canPerformAction()) return;
        this._direction = direction;
        let speed = direction === 1 ? (this._characterData.movement.walk_fwd_speed || 2) : (this._characterData.movement.walk_back_speed || 1.5);
        if (this._isAiControlled) {
            speed *= this.movementSpeedMultiplier;
        }
        this._xVelocity = direction * speed;
        if (this._state !== Jules.MugenBattle.States.WALKING && !this.isAerialState()) this.setState(Jules.MugenBattle.States.WALKING);
    };
    Sprite_FightingCharacter.prototype.stopWalk = function() { /* ... */
        if (this._state === Jules.MugenBattle.States.WALKING) { this._xVelocity = 0; this.setState(Jules.MugenBattle.States.IDLE); }
    };
    Sprite_FightingCharacter.prototype.performJump = function() { /* ... */
        if (this.canPerformAction() || (this.isAerialState() && !this.isAttackState())) {
             if(!this.isAerialState()) this.setState(Jules.MugenBattle.States.JUMPING_UP);
        }
    };
    Sprite_FightingCharacter.prototype.isAttackState = function() { return this._state === Jules.MugenBattle.States.ATTACKING; };
    Sprite_FightingCharacter.prototype.performAttack = function(attackName) {
        if (!this._characterData.attacks || !this._characterData.attacks[attackName]) {
            console.warn(`Attack definition "${attackName}" not found for ${this._characterData.name}`); return;
        }
        if (this.canPerformAction() || (this.isAerialState() && this._state !== Jules.MugenBattle.States.ATTACKING)) {
            const attackData = this._characterData.attacks[attackName];
            this._currentAttackName = attackName; this._currentAttackHasHit = false;
            this.playAnimation(attackData.animation || attackName + "_anim");
            this.setState(Jules.MugenBattle.States.ATTACKING);
        }
    };
    Sprite_FightingCharacter.prototype.finishAttack = function() {
        if (this._state === Jules.MugenBattle.States.ATTACKING && !this._currentAttackHasHit) {
            this._comboHits = 0;
            console.log(`${this._characterData.name} attack whiffed, combo reset.`);
        }
        this._currentAttackName = null; this._currentAttackHasHit = false;
        if (this.isAerialState() && this._state !== Jules.MugenBattle.States.HIT_STUN) this.setState(Jules.MugenBattle.States.JUMPING_DOWN);
        else if (this._state !== Jules.MugenBattle.States.HIT_STUN) this.setState(Jules.MugenBattle.States.IDLE);
    };
    Sprite_FightingCharacter.prototype.takeHit = function(damagePayload) {
        if (!this._characterData) return false;
        this._comboHits = 0;
        const opponent = (this === SceneManager._scene._player1Sprite) ? SceneManager._scene._player2Sprite : SceneManager._scene._player1Sprite;
        let wasBlocked = false;
        if (this._state === Jules.MugenBattle.States.BLOCKING_STAND && opponent) {
            const isAttackerInFront = (this._direction === 1 && opponent.x > this.x) || (this._direction === -1 && opponent.x < this.x);
            if (isAttackerInFront) wasBlocked = true;
        }

        let finalDamage = damagePayload.damage || 0;
        let finalChipDamage = damagePayload.chipDamage || 0;

        if (this._isAiControlled) {
            finalDamage = Math.round(finalDamage * this.defenseFactor);
            finalChipDamage = Math.round(finalChipDamage * this.defenseFactor);
        }

        if (wasBlocked) {
            this.playAnimation(damagePayload.blockAnimationName || "block_stand");
            this._hitStunTimer = damagePayload.blockStunFrames || 10;
            this._xVelocity = (damagePayload.blockPushbackX || 1.5) * -(damagePayload.attackerDirection || 1);
            if (finalChipDamage > 0) { this.health -= finalChipDamage; if (this.health < 0) this.health = 0; }
            this.setState(Jules.MugenBattle.States.BLOCKING_STAND);
        } else {
            this.health -= finalDamage; if (this.health < 0) this.health = 0;
            console.log(`${this._characterData.name} took ${finalDamage} damage. Health: ${this.health}/${this.maxHealth}`);
            this._hitStunTimer = damagePayload.hitStunFrames || 15;
            this.setState(Jules.MugenBattle.States.HIT_STUN);
            this.playAnimation(damagePayload.hitAnimationName || "hit_light");
            this._xVelocity = (damagePayload.pushbackX || 3) * -(damagePayload.attackerDirection || 1);
            if (damagePayload.pushbackY) this._yVelocity = damagePayload.pushbackY;
        }
        this._activeHitboxes = [];
        return wasBlocked;
    };
    Sprite_FightingCharacter.prototype.attemptBlock = function() {
        if (this._state === Jules.MugenBattle.States.IDLE || this._state === Jules.MugenBattle.States.WALKING) {
            this.setState(Jules.MugenBattle.States.BLOCKING_STAND);
        }
    };
    Sprite_FightingCharacter.prototype.stopBlock = function() {
        if (this._state === Jules.MugenBattle.States.BLOCKING_STAND || this._state === Jules.MugenBattle.States.BLOCKING_CROUCH) {
            this.setState(Jules.MugenBattle.States.IDLE);
        }
    };
    Sprite_FightingCharacter.prototype.updateAnimation = function() { /* ... */
        if (!this._animationFrames || this._animationFrames.length === 0) { this.setFrame(0,0,0,0); return; }
        this._animationTimer++; const currentFrameData = this._animationFrames[this._frameIndex]; if (!currentFrameData) return;
        const frameDuration = Math.round(currentFrameData.duration / this._animationSpeedFactor);
        if (this._animationTimer >= frameDuration) {
            this._animationTimer = 0; this._frameIndex++;
            if (this._frameIndex >= this._animationFrames.length) {
                if (this._animationLoop) this._frameIndex = 0; else this._frameIndex = this._animationFrames.length - 1;
            } this.updateAnimationFrame();
        }
    };
    Sprite_FightingCharacter.prototype.updateAnimationFrame = function() { /* ... */
        this._activeHitboxes = []; this._activeHurtboxes = [];
        if (this._animationFrames && this._animationFrames.length > 0 && this._frameIndex < this._animationFrames.length) {
            const frameData = this._animationFrames[this._frameIndex];
            this.setFrame(frameData.x, frameData.y, frameData.w, frameData.h);
            if (frameData.hitboxes) frameData.hitboxes.forEach(box => this._activeHitboxes.push(new Rectangle(box.x, box.y, box.w, box.h)));
            if (frameData.hurtboxes) frameData.hurtboxes.forEach(box => this._activeHurtboxes.push(new Rectangle(box.x, box.y, box.w, box.h)));
        } else { this.setFrame(0,0,0,0); }
    };
    Sprite_FightingCharacter.prototype.currentAnimationName = function() { return this._animationName; };
    Sprite_FightingCharacter.prototype.isAnimationLooping = function() { return this._animationLoop; };
    Sprite_FightingCharacter.prototype.isAnimationOnLastFrame = function() { /* ... */
        if (this._animationLoop || !this._animationFrames || this._animationFrames.length === 0) return false;
        return this._frameIndex === this._animationFrames.length - 1;
    };

    //=============================================================================
    // Window_MugenHud
    //=============================================================================
    function Window_MugenHud() { this.initialize(...arguments); }
    Window_MugenHud.prototype = Object.create(Window_Base.prototype);
    Window_MugenHud.prototype.constructor = Window_MugenHud;
    Window_MugenHud.prototype.initialize = function(rect) {
        Window_Base.prototype.initialize.call(this, rect); this.opacity = 0;
        this._player1Sprite = null; this._player2Sprite = null;
        this._lastP1Health = -1; this._lastP2Health = -1; this._lastP1Combo = -1;
        this._lastRoundTimer = -1; this._lastRoundOverMessage = "";
    };
    Window_MugenHud.prototype.setFighters = function(p1Sprite, p2Sprite) {
        this._player1Sprite = p1Sprite; this._player2Sprite = p2Sprite; this.refresh();
    };
    Window_MugenHud.prototype.refresh = function() {
        this.contents.clear(); if (!this._player1Sprite || !this._player2Sprite) return;
        const barW = Math.floor(Graphics.boxWidth / 3); const barH = 20; const nameYOff = -28; const hpTextYOff = barH - 8; const yP = 30;
        const p1X = 40; const p2X = Graphics.boxWidth - barW - 40;
        if (this._player1Sprite._characterData) {
            this.drawGauge(p1X, yP, barW, this._player1Sprite.health / this._player1Sprite.maxHealth, this.hpGaugeColor1(), this.hpGaugeColor2());
            this.drawText(this._player1Sprite._characterData.name || "P1", p1X, yP + nameYOff, barW, "left");
            this.drawText(`${this._player1Sprite.health}/${this._player1Sprite.maxHealth}`, p1X, yP + hpTextYOff, barW, "right");
            if (this._player1Sprite._comboHits > 1) this.drawText(`${this._player1Sprite._comboHits} HITS!`, p1X + barW + 10, yP, 150, "left");
        }
        if (this._player2Sprite._characterData) {
            this.drawGauge(p2X, yP, barW, this._player2Sprite.health / this._player2Sprite.maxHealth, this.hpGaugeColor1(), this.hpGaugeColor2());
            this.drawText(this._player2Sprite._characterData.name || "P2", p2X, yP + nameYOff, barW, "left");
            this.drawText(`${this._player2Sprite.health}/${this._player2Sprite.maxHealth}`, p2X, yP + hpTextYOff, barW, "right");
        }
        // Round Timer
        if (SceneManager._scene && SceneManager._scene._roundTimer !== undefined) {
            const timerX = Graphics.boxWidth / 2;
            const timerY = yP - this.lineHeight() / 2 + 5;
            const seconds = Math.max(0, Math.ceil(SceneManager._scene._roundTimer / 60));
            this.changeTextColor(ColorManager.normalColor());
            this.contents.fontSize = 36;
            this.drawText(seconds, timerX, timerY - 15, 48, "center");
            this.resetFontSettings();
        }
        // KO Message or Round End Message
        if (SceneManager._scene && SceneManager._scene._roundOverMessage && SceneManager._scene._roundOverMessage !== "") {
            this.contents.fontSize = 48;
            this.changeTextColor(ColorManager.crisisColor());
            this.drawText(SceneManager._scene._roundOverMessage, 0, Graphics.boxHeight / 2 - 60, Graphics.boxWidth, "center");
            this.resetFontSettings();
        }
    };
    Window_MugenHud.prototype.update = function() {
        Window_Base.prototype.update.call(this);
        if (this.isOpen() && SceneManager._scene && SceneManager._scene.isActive && SceneManager._scene.isActive()) {
            if (this._player1Sprite && this._player2Sprite) {
                const p1H = this._player1Sprite.health; const p2H = this._player2Sprite.health; const p1C = this._player1Sprite._comboHits;
                const rT = SceneManager._scene._roundTimer; const rOM = SceneManager._scene._roundOverMessage || "";
                if (p1H !== this._lastP1Health || p2H !== this._lastP2Health || p1C !== this._lastP1Combo || rT !== this._lastRoundTimer || rOM !== this._lastRoundOverMessage) {
                    this.refresh(); this._lastP1Health = p1H; this._lastP2Health = p2H; this._lastP1Combo = p1C;
                    this._lastRoundTimer = rT; this._lastRoundOverMessage = rOM;
                }
            }
        }
    };
    Window_MugenHud.prototype.hpGaugeColor1 = function() { return ColorManager.hpGaugeColor1(); };
    Window_MugenHud.prototype.hpGaugeColor2 = function() { return ColorManager.hpGaugeColor2(); };

})();
