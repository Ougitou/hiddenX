//=============================================================================
// Jules_LNReader.js
//=============================================================================

/*:
 * @target MZ
 * @plugindesc (v1.0.0) A consolidated single-window light novel reader for RPG Maker MZ.
 * @author Jules
 *
 * @help Jules_LNReader.js
 *
 * This plugin creates a light novel reader scene that uses a single window
 * for all visuals and controls.
 *
 * Use the following command to start the reader:
 *   SceneManager.push(Scene_LNReader);
 *
 * @param menuCommandName
 * @text Menu Command Name
 * @desc The name of the command shown in the main menu.
 * @default LN Reader
 *
 * @param showInMenu
 * @text Show in Menu
 * @desc Whether to show the LN Reader command in the main menu.
 * @type boolean
 * @default true
 *
 * @param storyFile
 * @text Story File
 * @desc The path to the story .txt file.
 * @default text/story.txt
 *
 * @param triggerFile
 * @text Trigger File
 * @desc The path to the trigger data file.
 * @default text/triggers.txt
 */

var Jules = Jules || {};
Jules.LNReader = Jules.LNReader || {};

(() => {
    "use strict";

    // --- Plugin Parameters Initialization ---
    const pluginName = "Jules_LNReader";
    const parameters = PluginManager.parameters(pluginName);
    const menuCommandName = String(parameters["menuCommandName"] || "LN Reader");
    const showInMenu = parameters["showInMenu"] === "true";
    const storyFilePath = String(parameters["storyFile"] || "text/story.txt");
    const triggerFilePath = String(parameters["triggerFile"] || "text/triggers.txt");

    /**
     * LN_STATE Enum
     * Defines the possible states for the reader's state machine.
     */
    const LN_STATE = {
        INIT: "init",
        LOADING: "loading",
        READY: "ready",
        PLAYING: "playing",
        PAUSED: "paused",
        ERROR: "error"
    };

    //-----------------------------------------------------------------------------
    // LN_Manager
    //
    // The static class that manages the light novel data, navigation, and global state.

    class LN_Manager {
        constructor() {
            throw new Error("This is a static class");
        }

        /**
         * initialize
         * Resets the manager state. Called once when the plugin loads.
         */
        static initialize() {
            this._story = [];      // Array of strings (each line is a narrative frame)
            this._triggers = {};   // Object mapping line indices to trigger arrays
            this._currentIndex = -1;
            this._state = LN_STATE.INIT;
        }

        static state() { return this._state; }
        static setState(state) { this._state = state; }
        static isReady() { return this._state !== LN_STATE.INIT && this._state !== LN_STATE.LOADING; }

        /**
         * loadData
         * Asynchronously fetches the story and trigger files from the paths
         * specified in the plugin parameters.
         */
        static async loadData() {
            this.setState(LN_STATE.LOADING);
            try {
                // Fetch and parse story text
                const storyRes = await fetch(storyFilePath);
                if (!storyRes.ok) throw new Error("Could not load " + storyFilePath);
                const storyText = await storyRes.text();
                // Filter out empty lines to avoid blank frames
                this._story = storyText.split(/\r?\n/).filter(line => line.trim() !== "");

                // Fetch and parse trigger JSON
                const triggersRes = await fetch(triggerFilePath);
                if (!triggersRes.ok) throw new Error("Could not load " + triggerFilePath);
                const triggersJson = await triggersRes.json();
                this._triggers = triggersJson;

                this._currentIndex = 0;
                this.setState(LN_STATE.READY);
            } catch (e) {
                console.error("LN_Manager: Failed to load data", e);
                this._story = ["Error: Could not load story data."];
                this.setState(LN_STATE.ERROR);
            }
        }

        /**
         * Data Accessors
         */
        static currentText() { return this._story[this._currentIndex] || ""; }
        static currentTriggers() { return this._triggers[this._currentIndex] || []; }

        /**
         * Navigation Logic
         */
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

        static currentIndex() { return this._currentIndex; }
        static storyLength() { return this._story.length; }
    }

    Jules.LNReader.Manager = LN_Manager;
    LN_Manager.initialize();

    //-----------------------------------------------------------------------------
    // Sprite_LNBust
    //
    // A specialized sprite class for character busts with depth-simulating positioning
    // and basic entrance animations.

    class Sprite_LNBust extends Sprite {
        constructor() {
            super();
            this.anchor.x = 0.5;
            this.anchor.y = 1.0;
            this._duration = 0;
        }

        /**
         * setup
         * @param {string} name - Picture filename.
         * @param {string} pos - "lowerLeft" (foreground) or "upperLeft" (background).
         */
        setup(name, pos) {
            this.bitmap = ImageManager.loadPicture(name);
            this._targetX = 0;
            this._targetY = 0;

            // Layout calculations based on the 88% visual / 12% control split
            if (pos === "lowerLeft") {
                this._targetX = Graphics.width * 0.2;
                this._targetY = Graphics.height * 0.88;
            } else if (pos === "upperLeft") {
                this._targetX = Graphics.width * 0.2;
                this._targetY = Graphics.height * 0.44;
            }
            this.x = this._targetX;
            this.y = this._targetY;
        }

        /**
         * applyEffect
         * Sets up an entrance effect.
         */
        applyEffect(effect, duration) {
            this._effect = effect;
            this._duration = duration || 60;
            this._initialDuration = this._duration;
            if (effect === "fadeIn") {
                this.opacity = 0;
            } else if (effect === "move") {
                this.x = -200; // Start off-screen
                this._startX = this.x;
            }
        }

        /**
         * update
         * Manually called by the parent window to drive animations.
         */
        update() {
            super.update();
            if (this._duration > 0) {
                if (this._effect === "fadeIn") {
                    this.opacity += 255 / this._initialDuration;
                } else if (this._effect === "move") {
                    this.x += (this._targetX - this._startX) / this._initialDuration;
                }
                this._duration--;
            }
        }
    }

    //-----------------------------------------------------------------------------
    // Sprite_LNFullImage
    //
    // A sprite class for centered full-screen images or items.

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
            this._initialDuration = this._duration;
            if (effect === "zoomIn") {
                this.scale.x = 0;
                this.scale.y = 0;
            }
        }

        update() {
            super.update();
            if (this._duration > 0) {
                if (this._effect === "zoomIn") {
                    this.scale.x += 1 / this._initialDuration;
                    this.scale.y += 1 / this._initialDuration;
                }
                this._duration--;
            }
        }
    }

    //-----------------------------------------------------------------------------
    // Window_LNReader
    //
    // The core "Single Window" class. It manages all visuals (backgrounds, sprites, text)
    // and interactive controls (buttons).

    class Window_LNReader extends Window_Selectable {
        constructor(rect) {
            super(rect);
            this.opacity = 0;      // Hidden frame
            this.padding = 0;      // Full utilization of space
            this.openness = 255;   // Fully open to allow input processing
            this._playWaitCount = 0;
            this._busts = {};      // Track active busts by position key
            this._itemSprite = null;
            this._animations = []; // Active Effekseer animations
            this.createVisualLayers();
            this.refresh();
        }

        /**
         * createVisualLayers
         * Initializes the hierarchical layers for the visual components.
         */
        createVisualLayers() {
            const width = Graphics.width;
            const height = Graphics.height;
            this._controlHeight = Math.floor(height * 0.12);
            this._visualHeight = height - this._controlHeight;
            this._halfVisualHeight = Math.floor(this._visualHeight / 2);

            // Layer 0: Backgrounds
            this._bgContainer = new Sprite();
            this.addChildAt(this._bgContainer, 0);

            this._bgUpper = new Sprite();
            this._bgUpper.bitmap = new Bitmap(width, this._halfVisualHeight);
            this._bgContainer.addChild(this._bgUpper);

            this._bgLower = new Sprite();
            this._bgLower.y = this._halfVisualHeight;
            this._bgLower.bitmap = new Bitmap(width, this._halfVisualHeight);
            this._bgContainer.addChild(this._bgLower);

            // Layer 1: Sprites (Busts/Items)
            this._spriteLayer = new Sprite();
            this.addChildAt(this._spriteLayer, 1);
        }

        /**
         * Window_Selectable overrides
         * Maps the single window's selection logic to the bottom control bar.
         */
        maxCols() { return 7; }
        maxItems() { return 7; }

        itemRect(index) {
            const width = Math.floor(this.innerWidth / this.maxCols());
            const height = this._controlHeight;
            const x = index * width;
            const y = this.innerHeight - height;
            return new Rectangle(x, y, width, height);
        }

        drawAllItems() {
            // Draw semi-transparent background for the control bar
            const rect = new Rectangle(0, this.innerHeight - this._controlHeight, this.innerWidth, this._controlHeight);
            this.contents.fillRect(rect.x, rect.y, rect.width, rect.height, "#00000088");
            super.drawAllItems();
        }

        drawItem(index) {
            const rect = this.itemLineRect(index);
            const commands = ["Play", "Next", "Prev", "FF", "RW", "Mute", "Set"];
            let text = commands[index];
            if (index === 0 && LN_Manager.state() === LN_STATE.PLAYING) text = "Pause";
            this.contents.fontSize = 20;
            this.drawText(text, rect.x, rect.y, rect.width, "center");
        }

        /**
         * refresh
         * Redraws the UI (buttons and current narrative text).
         */
        refresh() {
            if (this.contents) {
                this.contents.clear();
                this.drawAllItems();
                this.drawNarrative();
            }
        }

        /**
         * drawNarrative
         * Renders the current story line using drawTextEx for word wrapping.
         */
        drawNarrative() {
            const text = LN_Manager.currentText();
            const width = this.innerWidth;
            const y = this._halfVisualHeight - 40; // Center text on the horizon line
            this.contents.fontSize = 26;
            this.drawTextEx(text, 20, y, width - 40);
        }

        /**
         * update
         * The main update loop for the window.
         */
        update() {
            super.update();
            this.updateStateMachine();
            this.updateInternalSprites();
        }

        /**
         * updateStateMachine
         * Handles auto-play timing when in the PLAYING state.
         */
        updateStateMachine() {
            if (LN_Manager.state() === LN_STATE.PLAYING) {
                this._playWaitCount++;
                if (this._playWaitCount >= 120) { // 2 second delay between frames
                    this._playWaitCount = 0;
                    this.onControlNext();
                }
            }
        }

        /**
         * updateInternalSprites
         * IMPORTANT: Manually calls update() on all child sprites (busts, items, animations)
         * since RM MZ windows do not automatically update their child objects.
         */
        updateInternalSprites() {
            for (const child of this._spriteLayer.children) {
                if (child.update) child.update();
            }
            // Update and cleanup finished animations
            for (let i = this._animations.length - 1; i >= 0; i--) {
                const anim = this._animations[i];
                if (anim.update) anim.update();
                if (!anim.isPlaying()) {
                    this._spriteLayer.removeChild(anim);
                    this._animations.splice(i, 1);
                }
            }
        }

        /**
         * Control Event Handlers
         */
        onControlPlay() {
            if (LN_Manager.state() === LN_STATE.PLAYING) LN_Manager.setState(LN_STATE.PAUSED);
            else LN_Manager.setState(LN_STATE.PLAYING);
            this._playWaitCount = 0;
            this.refresh();
        }

        onControlNext() {
            if (LN_Manager.next()) this.refreshReader();
        }

        onControlPrev() {
            if (LN_Manager.previous()) this.refreshReader();
        }

        onControlSkipF() {
            LN_Manager.jumpTo(LN_Manager.currentIndex() + 10);
            this.refreshReader();
        }

        onControlSkipB() {
            LN_Manager.jumpTo(LN_Manager.currentIndex() - 10);
            this.refreshReader();
        }

        onControlMute() {
            // Toggles master BGM volume between 0 and 100
            ConfigManager.bgmVolume = ConfigManager.bgmVolume > 0 ? 0 : 100;
            ConfigManager.save();
            ConfigManager.applyData();
        }

        onControlSettings() {
            SceneManager.push(Scene_Options);
        }

        /**
         * refreshReader
         * Updates the UI and executes all visual/audio triggers for the new line.
         */
        refreshReader() {
            this.refresh();
            this.executeTriggers(LN_Manager.currentTriggers());
        }

        /**
         * executeTriggers
         * Iterates through trigger data and dispatches actions.
         */
        executeTriggers(triggers) {
            if (!triggers || !Array.isArray(triggers)) return;
            for (const trigger of triggers) {
                switch (trigger.type) {
                    case "bg": this.updateBackgroundLayer(trigger.name, trigger.layer); break;
                    case "bust": this.showBust(trigger.name, trigger.pos, trigger.effect, trigger.duration); break;
                    case "item": this.showItem(trigger.name, trigger.effect, trigger.duration); break;
                    case "music": this.playMusic(trigger.name, trigger.volume); break;
                    case "se": this.playSe(trigger.name); break;
                    case "particles": this.playParticles(trigger.name); break;
                    case "clearSprites": this.clearSprites(); break;
                }
            }
        }

        clearSprites() {
            while (this._spriteLayer.children.length > 0) this._spriteLayer.removeChildAt(0);
            this._busts = {};
            this._itemSprite = null;
            this._animations = [];
        }

        updateBackgroundLayer(name, layer) {
            const bitmap = ImageManager.loadParallax(name);
            if (layer === "background") this._bgUpper.bitmap = bitmap;
            else if (layer === "foreground") this._bgLower.bitmap = bitmap;
        }

        showBust(name, pos, effect, duration) {
            // If a bust exists in this position, remove it to prevent stacking
            if (this._busts[pos]) {
                this._spriteLayer.removeChild(this._busts[pos]);
            }
            const bust = new Sprite_LNBust();
            bust.setup(name, pos);
            this._spriteLayer.addChild(bust);
            bust.applyEffect(effect, duration);
            this._busts[pos] = bust;
        }

        showItem(name, effect, duration) {
            if (this._itemSprite) {
                this._spriteLayer.removeChild(this._itemSprite);
            }
            const item = new Sprite_LNFullImage();
            item.setup(name);
            // Items are added at index 0 to stay behind character busts
            this._spriteLayer.addChildAt(item, 0);
            item.applyEffect(effect, duration);
            this._itemSprite = item;
        }

        playMusic(name, volume) {
            AudioManager.playBgm({ name, pan: 0, pitch: 100, volume: volume || 90 });
        }

        playSe(name) {
            AudioManager.playSe({ name, pan: 0, pitch: 100, volume: 90 });
        }

        playParticles(name) {
            const animation = $dataAnimations.find(a => a && a.name === name);
            if (animation) {
                const sprite = new Sprite_Animation();
                sprite.setup([this._spriteLayer], animation, false, 0, null);
                this._spriteLayer.addChild(sprite);
                this._animations.push(sprite);
            }
        }

        /**
         * processOk
         * Maps button index to the corresponding event handler.
         */
        processOk() {
            const index = this.index();
            const handlers = [
                this.onControlPlay, this.onControlNext, this.onControlPrev,
                this.onControlSkipF, this.onControlSkipB, this.onControlMute, this.onControlSettings
            ];
            if (handlers[index]) {
                this.playOkSound();
                handlers[index].call(this);
            }
            this.activate();
        }
    }

    //-----------------------------------------------------------------------------
    // Scene_LNReader
    //
    // The scene class that initializes the reader environment.

    class Scene_LNReader extends Scene_Base {
        /**
         * create
         * Setup the visual hierarchy and trigger data loading.
         */
        create() {
            super.create();
            this.createBackground();
            this.createWindowLayer();
            this.createReaderWindow();
            // Start data load and refresh UI once ready
            LN_Manager.loadData().then(() => this._readerWindow.refreshReader());
        }

        createBackground() {
            this._backgroundSprite = new Sprite(SceneManager.backgroundBitmap());
            this.addChild(this._backgroundSprite);
        }

        createReaderWindow() {
            const rect = new Rectangle(0, 0, Graphics.width, Graphics.height);
            this._readerWindow = new Window_LNReader(rect);
            this._readerWindow.setHandler("cancel", this.popScene.bind(this));
            this.addWindow(this._readerWindow);
            this._readerWindow.activate();
            this._readerWindow.select(0);
        }

        /**
         * isReady
         * The scene is ready once both Scene_Base and the LN_Manager are ready.
         */
        isReady() { return super.isReady() && LN_Manager.isReady(); }
    }

    window.Scene_LNReader = Scene_LNReader;

    //-----------------------------------------------------------------------------
    // Menu Integration (Aliases)
    //
    // Patches the main menu to include the LN Reader command.

    const _Window_MenuCommand_addMainCommands = Window_MenuCommand.prototype.addMainCommands;
    Window_MenuCommand.prototype.addMainCommands = function() {
        _Window_MenuCommand_addMainCommands.call(this);
        if (showInMenu) this.addCommand(menuCommandName, "lnReader", true);
    };

    const _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function() {
        _Scene_Menu_createCommandWindow.call(this);
        this._commandWindow.setHandler("lnReader", () => SceneManager.push(Scene_LNReader));
    };

})();
