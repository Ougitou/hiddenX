//=============================================================================
// Jules_LNReader.js
//=============================================================================

/*:
 * @target MZ
 * @plugindesc (v1.0.0) A light novel reader for RPG Maker MZ.
 * @author Jules
 *
 * @help Jules_LNReader.js
 *
 * This plugin creates a light novel reader scene.
 * It reads story text from text/story.txt and trigger data from text/triggers.txt.
 *
 * Use the following command to start the reader:
 *   SceneManager.push(Scene_LNReader);
 */

var Jules = Jules || {};
Jules.LNReader = Jules.LNReader || {};

(() => {
    "use strict";

    //-----------------------------------------------------------------------------
    // LN_Manager
    //
    // The static class that manages the light novel data and state.

    class LN_Manager {
        constructor() {
            throw new Error("This is a static class");
        }

        static initialize() {
            this._story = [];
            this._triggers = {};
            this._currentIndex = -1;
            this._isReady = false;
        }

        static isReady() {
            return this._isReady;
        }

        static async loadData() {
            try {
                const storyRes = await fetch("text/story.txt");
                if (!storyRes.ok) throw new Error("Could not load text/story.txt");
                const storyText = await storyRes.text();
                this._story = storyText.split(/\r?\n/).filter(line => line.trim() !== "");

                const triggersRes = await fetch("text/triggers.txt");
                if (!triggersRes.ok) throw new Error("Could not load text/triggers.txt");
                const triggersJson = await triggersRes.json();
                this._triggers = triggersJson;

                this._currentIndex = 0;
                this._isReady = true;
            } catch (e) {
                console.error("LN_Manager: Failed to load data", e);
                // Fallback or error handling
                this._story = ["Error: Could not load story data."];
                this._isReady = true;
            }
        }

        static currentText() {
            return this._story[this._currentIndex] || "";
        }

        static currentTriggers() {
            return this._triggers[this._currentIndex] || [];
        }

        static next() {
            if (this._currentIndex < this._story.length - 1) {
                this._currentIndex++;
                return true;
            }
            return false;
        }

        static previous() {
            if (this._currentIndex > 0) {
                this._currentIndex--;
                return true;
            }
            return false;
        }

        static jumpTo(index) {
            this._currentIndex = Math.max(0, Math.min(index, this._story.length - 1));
        }

        static currentIndex() {
            return this._currentIndex;
        }

        static storyLength() {
            return this._story.length;
        }
    }

    Jules.LNReader.Manager = LN_Manager;
    LN_Manager.initialize();

    //-----------------------------------------------------------------------------
    // Window_LNNarrative
    //
    // The window for displaying narrative text at the line between background layers.

    class Window_LNNarrative extends Window_Base {
        constructor(rect) {
            super(rect);
            this.setBackgroundType(2); // Transparent
            this._text = "";
        }

        setText(text) {
            if (this._text !== text) {
                this._text = text;
                this.refresh();
            }
        }

        refresh() {
            this.contents.clear();
            const width = this.contentsWidth();
            this.drawTextEx(this._text, 0, 0, width);
        }
    }

    //-----------------------------------------------------------------------------
    // Sprite_LNBust
    //
    // A sprite class for character busts.

    class Sprite_LNBust extends Sprite {
        constructor() {
            super();
            this.anchor.x = 0.5;
            this.anchor.y = 1.0;
            this._duration = 0;
        }

        setup(name, pos) {
            this.bitmap = ImageManager.loadPicture(name);
            this._targetX = 0;
            this._targetY = 0;

            if (pos === "lowerLeft") {
                this._targetX = Graphics.width * 0.2;
                this._targetY = Graphics.height * 0.92;
            } else if (pos === "upperLeft") {
                this._targetX = Graphics.width * 0.2;
                this._targetY = Graphics.height * 0.46;
            }
            this.x = this._targetX;
            this.y = this._targetY;
        }

        applyEffect(effect, duration) {
            this._effect = effect;
            this._duration = duration || 60;
            if (effect === "fadeIn") {
                this.opacity = 0;
            } else if (effect === "move") {
                this.x = -this.width; // Start from offscreen left
            }
        }

        update() {
            super.update();
            if (this._duration > 0) {
                if (this._effect === "fadeIn") {
                    this.opacity += 255 / (this._duration || 60);
                } else if (this._effect === "move") {
                    this.x += (this._targetX - this.x) / this._duration;
                }
                this._duration--;
            }
        }
    }

    //-----------------------------------------------------------------------------
    // Sprite_LNFullImage
    //
    // A sprite class for full screen images or items.

    class Sprite_LNFullImage extends Sprite {
        constructor() {
            super();
            this.anchor.x = 0.5;
            this.anchor.y = 0.5;
            this._duration = 0;
        }

        setup(name) {
            this.bitmap = ImageManager.loadPicture(name);
            this.x = Graphics.width / 2;
            this.y = Graphics.height / 2;
        }

        applyEffect(effect, duration) {
            this._effect = effect;
            this._duration = duration || 60;
            if (effect === "zoomIn") {
                this.scale.x = 0;
                this.scale.y = 0;
            }
        }

        update() {
            super.update();
            if (this._duration > 0) {
                if (this._effect === "zoomIn") {
                    this.scale.x += 1 / (this._duration || 60);
                    this.scale.y += 1 / (this._duration || 60);
                }
                this._duration--;
            }
        }
    }

    //-----------------------------------------------------------------------------
    // Window_LNControls
    //
    // The control bar at the bottom of the screen.

    class Window_LNControls extends Window_Selectable {
        constructor(rect) {
            super(rect);
            this.opacity = 255;
            this.refresh();
        }

        maxCols() {
            return 7; // Play, Next, Prev, Skip F, Skip B, Mute, Settings
        }

        maxItems() {
            return 7;
        }

        itemRect(index) {
            const rect = super.itemRect(index);
            return rect;
        }

        drawItem(index) {
            const rect = this.itemLineRect(index);
            const commands = ["Play", "Next", "Prev", "FF", "RW", "Mute", "Set"];
            let text = commands[index];
            if (index === 0 && SceneManager._scene && SceneManager._scene._isPlaying) {
                text = "Pause";
            }
            this.drawText(text, rect.x, rect.y, rect.width, "center");
        }

        processOk() {
            const index = this.index();
            this.callHandler(this.indexToSymbol(index));
        }

        indexToSymbol(index) {
            const symbols = ["play", "next", "prev", "skipF", "skipB", "mute", "settings"];
            return symbols[index];
        }
    }

    //-----------------------------------------------------------------------------
    // Scene_LNReader
    //
    // The scene class for the light novel reader.

    class Scene_LNReader extends Scene_Base {
        constructor() {
            super();
        }

        create() {
            super.create();
            this.createBackground();
            this.createLayout();
            this.createWindowLayer();
            this.createNarrativeWindow();
            this.createControlsWindow();
            LN_Manager.loadData().then(() => {
                this.onDataReady();
            });
        }

        createBackground() {
            this._backgroundSprite = new Sprite();
            this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
            this.addChild(this._backgroundSprite);
        }

        createLayout() {
            const width = Graphics.width;
            const height = Graphics.height;
            this._controlHeight = Math.floor(height * 0.08);
            const mainHeight = height - this._controlHeight;
            this._halfHeight = Math.floor(mainHeight / 2);

            // Container for background (upper) and foreground (lower)
            this._mainContainer = new Sprite();
            this.addChild(this._mainContainer);

            this._bgUpper = new Sprite();
            this._bgUpper.move(0, 0);
            this._bgUpper.bitmap = new Bitmap(width, this._halfHeight);
            this._mainContainer.addChild(this._bgUpper);

            this._bgLower = new Sprite();
            this._bgLower.move(0, this._halfHeight);
            this._bgLower.bitmap = new Bitmap(width, this._halfHeight);
            this._mainContainer.addChild(this._bgLower);

            // Layer for character busts and items
            this._spriteLayer = new Sprite();
            this.addChild(this._spriteLayer);
        }

        createNarrativeWindow() {
            const width = Graphics.width;
            const height = 80; // Estimated height for text
            const x = 0;
            const y = this._halfHeight - (height / 2);
            const rect = new Rectangle(x, y, width, height);
            this._narrativeWindow = new Window_LNNarrative(rect);
            this.addWindow(this._narrativeWindow);
        }

        createControlsWindow() {
            const width = Graphics.width;
            const height = this._controlHeight;
            const x = 0;
            const y = Graphics.height - height;
            const rect = new Rectangle(x, y, width, height);
            this._controlsWindow = new Window_LNControls(rect);
            this._controlsWindow.setHandler("play", this.onControlPlay.bind(this));
            this._controlsWindow.setHandler("next", this.onControlNext.bind(this));
            this._controlsWindow.setHandler("prev", this.onControlPrev.bind(this));
            this._controlsWindow.setHandler("skipF", this.onControlSkipF.bind(this));
            this._controlsWindow.setHandler("skipB", this.onControlSkipB.bind(this));
            this._controlsWindow.setHandler("mute", this.onControlMute.bind(this));
            this._controlsWindow.setHandler("settings", this.onControlSettings.bind(this));
            this.addWindow(this._controlsWindow);
            this._controlsWindow.activate();
            this._controlsWindow.select(0);
        }

        update() {
            super.update();
            this.updateAutoPlay();
        }

        updateAutoPlay() {
            if (this._isPlaying && !this.isBusy()) {
                this._playWaitCount = (this._playWaitCount || 0) + 1;
                if (this._playWaitCount >= 120) { // 2 seconds delay
                    this._playWaitCount = 0;
                    this.onControlNext();
                }
            }
        }

        isBusy() {
            return this._narrativeWindow.isOpening() || this._narrativeWindow.isClosing();
        }

        onControlPlay() {
            this._isPlaying = !this._isPlaying;
            this._playWaitCount = 0;
            this._controlsWindow.refresh();
            this._controlsWindow.activate();
        }

        onControlNext() {
            if (LN_Manager.next()) {
                this.refreshReader();
            }
            this._controlsWindow.activate();
        }

        onControlPrev() {
            if (LN_Manager.previous()) {
                this.refreshReader();
            }
            this._controlsWindow.activate();
        }

        onControlSkipF() {
            LN_Manager.jumpTo(LN_Manager.currentIndex() + 10);
            this.refreshReader();
            this._controlsWindow.activate();
        }

        onControlSkipB() {
            LN_Manager.jumpTo(LN_Manager.currentIndex() - 10);
            this.refreshReader();
            this._controlsWindow.activate();
        }

        onControlMute() {
            if (AudioManager.bgmVolume > 0) {
                this._lastVolume = AudioManager.bgmVolume;
                AudioManager.bgmVolume = 0;
            } else {
                AudioManager.bgmVolume = this._lastVolume || 100;
            }
            this._controlsWindow.activate();
        }

        onControlSettings() {
            SceneManager.push(Scene_Options);
        }

        onDataReady() {
            console.log("LN Data Ready. Story lines:", LN_Manager.storyLength());
            this.refreshReader();
        }

        refreshReader() {
            this._narrativeWindow.setText(LN_Manager.currentText());
            this.executeTriggers(LN_Manager.currentTriggers());
        }

        executeTriggers(triggers) {
            if (!triggers || !Array.isArray(triggers)) return;
            for (const trigger of triggers) {
                switch (trigger.type) {
                    case "bg":
                        this.updateBackgroundLayer(trigger.name, trigger.layer);
                        break;
                    case "bust":
                        this.showBust(trigger.name, trigger.pos, trigger.effect, trigger.duration);
                        break;
                    case "item":
                        this.showItem(trigger.name, trigger.effect, trigger.duration);
                        break;
                    case "music":
                        this.playMusic(trigger.name, trigger.volume);
                        break;
                    case "se":
                        this.playSe(trigger.name);
                        break;
                    case "particles":
                        this.playParticles(trigger.name);
                        break;
                    case "clearSprites":
                        this.clearSprites();
                        break;
                }
            }
        }

        clearSprites() {
            while (this._spriteLayer.children.length > 0) {
                this._spriteLayer.removeChildAt(0);
            }
        }

        updateBackgroundLayer(name, layer) {
            const bitmap = ImageManager.loadParallax(name);
            if (layer === "background") {
                this._bgUpper.bitmap = bitmap;
            } else if (layer === "foreground") {
                this._bgLower.bitmap = bitmap;
            }
        }

        showBust(name, pos, effect, duration) {
            const bust = new Sprite_LNBust();
            bust.setup(name, pos);
            this._spriteLayer.addChild(bust);
            bust.applyEffect(effect, duration);
        }

        showItem(name, effect, duration) {
            const item = new Sprite_LNFullImage();
            item.setup(name);
            // Items should be below the text layer but above background
            this._spriteLayer.addChildAt(item, 0);
            item.applyEffect(effect, duration);
        }

        playMusic(name, volume) {
            const bgm = {
                name: name,
                pan: 0,
                pitch: 100,
                volume: volume || 90
            };
            AudioManager.playBgm(bgm);
        }

        playSe(name) {
            const se = {
                name: name,
                pan: 0,
                pitch: 100,
                volume: 90
            };
            AudioManager.playSe(se);
        }

        playParticles(name) {
            const animation = $dataAnimations.find(a => a && a.name === name);
            if (animation) {
                $gameTemp.requestAnimation([this._spriteLayer], animation.id);
            }
        }

        isReady() {
            return super.isReady() && LN_Manager.isReady();
        }
    }

    window.Scene_LNReader = Scene_LNReader;
    Jules.LNReader.Scene_LNReader = Scene_LNReader;

})();
