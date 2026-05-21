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

    const pluginName = "Jules_LNReader";
    const parameters = PluginManager.parameters(pluginName);
    const menuCommandName = String(parameters["menuCommandName"] || "LN Reader");
    const showInMenu = parameters["showInMenu"] === "true";
    const storyFilePath = String(parameters["storyFile"] || "text/story.txt");
    const triggerFilePath = String(parameters["triggerFile"] || "text/triggers.txt");

    //-----------------------------------------------------------------------------
    // LN_Manager
    //
    // The static class that manages the light novel data and state.

    function LN_Manager() {
        throw new Error("This is a static class");
    }

    LN_Manager.initialize = function() {
        this._story = [];
        this._triggers = {};
        this._currentIndex = -1;
        this._state = "init";
    };

    LN_Manager.state = function() {
        return this._state;
    };

    LN_Manager.setState = function(state) {
        this._state = state;
    };

    LN_Manager.isReady = function() {
        return this._state !== "init" && this._state !== "loading";
    };

    LN_Manager.loadData = async function() {
        this.setState("loading");
        try {
            const storyRes = await fetch(storyFilePath);
            if (!storyRes.ok) throw new Error("Could not load " + storyFilePath);
            const storyText = await storyRes.text();
            this._story = storyText.split(/\r?\n/).filter(line => line.trim() !== "");

            const triggersRes = await fetch(triggerFilePath);
            if (!triggersRes.ok) throw new Error("Could not load " + triggerFilePath);
            const triggersJson = await triggersRes.json();
            this._triggers = triggersJson;

            this._currentIndex = 0;
            this.setState("ready");
        } catch (e) {
            console.error("LN_Manager: Failed to load data", e);
            this._story = ["Error: Could not load story data."];
            this.setState("error");
        }
    };

    LN_Manager.currentText = function() {
        return this._story[this._currentIndex] || "";
    };

    LN_Manager.currentTriggers = function() {
        return this._triggers[this._currentIndex] || [];
    };

    LN_Manager.next = function() {
        if (this._currentIndex < this._story.length - 1) {
            this._currentIndex++;
            return true;
        }
        return false;
    };

    LN_Manager.previous = function() {
        if (this._currentIndex > 0) {
            this._currentIndex--;
            return true;
        }
        return false;
    };

    LN_Manager.jumpTo = function(index) {
        this._currentIndex = Math.max(0, Math.min(index, this._story.length - 1));
    };

    LN_Manager.currentIndex = function() {
        return this._currentIndex;
    };

    LN_Manager.storyLength = function() {
        return this._story.length;
    };

    Jules.LNReader.Manager = LN_Manager;
    LN_Manager.initialize();

    //-----------------------------------------------------------------------------
    // Sprite_LNBust
    //
    // A sprite class for character busts.

    function Sprite_LNBust() {
        this.initialize(...arguments);
    }

    Sprite_LNBust.prototype = Object.create(Sprite.prototype);
    Sprite_LNBust.prototype.constructor = Sprite_LNBust;

    Sprite_LNBust.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this.anchor.x = 0.5;
        this.anchor.y = 1.0;
        this._duration = 0;
    };

    Sprite_LNBust.prototype.setup = function(name, pos) {
        this.bitmap = ImageManager.loadPicture(name);
        this._targetX = 0;
        this._targetY = 0;

        if (pos === "lowerLeft") {
            this._targetX = Graphics.width * 0.2;
            this._targetY = Graphics.height * 0.88;
        } else if (pos === "upperLeft") {
            this._targetX = Graphics.width * 0.2;
            this._targetY = Graphics.height * 0.44;
        }
        this.x = this._targetX;
        this.y = this._targetY;
    };

    Sprite_LNBust.prototype.applyEffect = function(effect, duration) {
        this._effect = effect;
        this._duration = duration || 60;
        this._initialDuration = this._duration;
        if (effect === "fadeIn") {
            this.opacity = 0;
        } else if (effect === "move") {
            this.x = -200;
            this._startX = this.x;
        }
    };

    Sprite_LNBust.prototype.update = function() {
        Sprite.prototype.update.call(this);
        if (this._duration > 0) {
            if (this._effect === "fadeIn") {
                this.opacity += 255 / this._initialDuration;
            } else if (this._effect === "move") {
                this.x += (this._targetX - this._startX) / this._initialDuration;
            }
            this._duration--;
        }
    };

    //-----------------------------------------------------------------------------
    // Sprite_LNFullImage
    //
    // A sprite class for full screen images or items.

    function Sprite_LNFullImage() {
        this.initialize(...arguments);
    }

    Sprite_LNFullImage.prototype = Object.create(Sprite.prototype);
    Sprite_LNFullImage.prototype.constructor = Sprite_LNFullImage;

    Sprite_LNFullImage.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this._duration = 0;
    };

    Sprite_LNFullImage.prototype.setup = function(name) {
        this.bitmap = ImageManager.loadPicture(name);
        this.x = Graphics.width / 2;
        this.y = Graphics.height / 2;
    };

    Sprite_LNFullImage.prototype.applyEffect = function(effect, duration) {
        this._effect = effect;
        this._duration = duration || 60;
        this._initialDuration = this._duration;
        if (effect === "zoomIn") {
            this.scale.x = 0;
            this.scale.y = 0;
        }
    };

    Sprite_LNFullImage.prototype.update = function() {
        Sprite.prototype.update.call(this);
        if (this._duration > 0) {
            if (this._effect === "zoomIn") {
                this.scale.x += 1 / this._initialDuration;
                this.scale.y += 1 / this._initialDuration;
            }
            this._duration--;
        }
    };

    //-----------------------------------------------------------------------------
    // Window_LNReader
    //
    // Consolidated window for everything.

    function Window_LNReader() {
        this.initialize(...arguments);
    }

    Window_LNReader.prototype = Object.create(Window_Selectable.prototype);
    Window_LNReader.prototype.constructor = Window_LNReader;

    Window_LNReader.prototype.initialize = function(rect) {
        Window_Selectable.prototype.initialize.call(this, rect);
        this.opacity = 0;
        this.padding = 0;
        this.openness = 255;
        this._playWaitCount = 0;
        this._busts = {};
        this._itemSprite = null;
        this._animations = [];
        this.createVisualLayers();
        this.refresh();
    };

    Window_LNReader.prototype.createVisualLayers = function() {
        const width = Graphics.width;
        const height = Graphics.height;
        this._controlHeight = Math.floor(height * 0.12);
        this._visualHeight = height - this._controlHeight;
        this._halfVisualHeight = Math.floor(this._visualHeight / 2);

        this._bgContainer = new Sprite();
        this.addChildAt(this._bgContainer, 0);

        this._bgUpper = new Sprite();
        this._bgUpper.bitmap = new Bitmap(width, this._halfVisualHeight);
        this._bgContainer.addChild(this._bgUpper);

        this._bgLower = new Sprite();
        this._bgLower.y = this._halfVisualHeight;
        this._bgLower.bitmap = new Bitmap(width, this._halfVisualHeight);
        this._bgContainer.addChild(this._bgLower);

        this._spriteLayer = new Sprite();
        this.addChildAt(this._spriteLayer, 1);
    };

    Window_LNReader.prototype.maxCols = function() { return 7; };
    Window_LNReader.prototype.maxItems = function() { return 7; };

    Window_LNReader.prototype.itemRect = function(index) {
        const width = Math.floor(this.innerWidth / this.maxCols());
        const height = this._controlHeight;
        const x = index * width;
        const y = this.innerHeight - height;
        return new Rectangle(x, y, width, height);
    };

    Window_LNReader.prototype.drawAllItems = function() {
        const rect = new Rectangle(0, this.innerHeight - this._controlHeight, this.innerWidth, this._controlHeight);
        this.contents.fillRect(rect.x, rect.y, rect.width, rect.height, "#00000088");
        Window_Selectable.prototype.drawAllItems.call(this);
    };

    Window_LNReader.prototype.drawItem = function(index) {
        const rect = this.itemLineRect(index);
        const commands = ["Play", "Next", "Prev", "FF", "RW", "Mute", "Set"];
        let text = commands[index];
        if (index === 0 && LN_Manager.state() === "playing") text = "Pause";
        this.contents.fontSize = 20;
        this.drawText(text, rect.x, rect.y, rect.width, "center");
    };

    Window_LNReader.prototype.refresh = function() {
        if (this.contents) {
            this.contents.clear();
            this.drawAllItems();
            this.drawNarrative();
        }
    };

    Window_LNReader.prototype.drawNarrative = function() {
        const text = LN_Manager.currentText();
        const width = this.innerWidth;
        const y = this._halfVisualHeight - 40;
        this.contents.fontSize = 26;
        this.drawTextEx(text, 20, y, width - 40);
    };

    Window_LNReader.prototype.update = function() {
        Window_Selectable.prototype.update.call(this);
        this.updateStateMachine();
        this.updateAnimationCleanup();
    };

    Window_LNReader.prototype.updateStateMachine = function() {
        if (LN_Manager.state() === "playing") {
            this._playWaitCount++;
            if (this._playWaitCount >= 120) {
                this._playWaitCount = 0;
                this.onControlNext();
            }
        }
    };

    Window_LNReader.prototype.updateAnimationCleanup = function() {
        for (let i = this._animations.length - 1; i >= 0; i--) {
            const anim = this._animations[i];
            if (!anim.isPlaying()) {
                this._spriteLayer.removeChild(anim);
                this._animations.splice(i, 1);
            }
        }
    };

    Window_LNReader.prototype.onControlPlay = function() {
        if (LN_Manager.state() === "playing") LN_Manager.setState("paused");
        else LN_Manager.setState("playing");
        this._playWaitCount = 0;
        this.refresh();
    };

    Window_LNReader.prototype.onControlNext = function() {
        if (LN_Manager.next()) this.refreshReader();
    };

    Window_LNReader.prototype.onControlPrev = function() {
        if (LN_Manager.previous()) this.refreshReader();
    };

    Window_LNReader.prototype.onControlSkipF = function() {
        LN_Manager.jumpTo(LN_Manager.currentIndex() + 10);
        this.refreshReader();
    };

    Window_LNReader.prototype.onControlSkipB = function() {
        LN_Manager.jumpTo(LN_Manager.currentIndex() - 10);
        this.refreshReader();
    };

    Window_LNReader.prototype.onControlMute = function() {
        ConfigManager.bgmVolume = ConfigManager.bgmVolume > 0 ? 0 : 100;
        ConfigManager.save();
        ConfigManager.applyData();
    };

    Window_LNReader.prototype.onControlSettings = function() {
        SceneManager.push(Scene_Options);
    };

    Window_LNReader.prototype.refreshReader = function() {
        this.refresh();
        this.executeTriggers(LN_Manager.currentTriggers());
    };

    Window_LNReader.prototype.executeTriggers = function(triggers) {
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
    };

    Window_LNReader.prototype.clearSprites = function() {
        while (this._spriteLayer.children.length > 0) this._spriteLayer.removeChildAt(0);
        this._busts = {};
        this._itemSprite = null;
        this._animations = [];
    };

    Window_LNReader.prototype.updateBackgroundLayer = function(name, layer) {
        const bitmap = ImageManager.loadParallax(name);
        if (layer === "background") this._bgUpper.bitmap = bitmap;
        else if (layer === "foreground") this._bgLower.bitmap = bitmap;
    };

    Window_LNReader.prototype.showBust = function(name, pos, effect, duration) {
        if (this._busts[pos]) {
            this._spriteLayer.removeChild(this._busts[pos]);
        }
        const bust = new Sprite_LNBust();
        bust.setup(name, pos);
        this._spriteLayer.addChild(bust);
        bust.applyEffect(effect, duration);
        this._busts[pos] = bust;
    };

    Window_LNReader.prototype.showItem = function(name, effect, duration) {
        if (this._itemSprite) {
            this._spriteLayer.removeChild(this._itemSprite);
        }
        const item = new Sprite_LNFullImage();
        item.setup(name);
        this._spriteLayer.addChildAt(item, 0);
        item.applyEffect(effect, duration);
        this._itemSprite = item;
    };

    Window_LNReader.prototype.playMusic = function(name, volume) {
        AudioManager.playBgm({ name, pan: 0, pitch: 100, volume: volume || 90 });
    };

    Window_LNReader.prototype.playSe = function(name) {
        AudioManager.playSe({ name, pan: 0, pitch: 100, volume: 90 });
    };

    Window_LNReader.prototype.playParticles = function(name) {
        const animation = $dataAnimations.find(a => a && a.name === name);
        if (animation) {
            const sprite = new Sprite_Animation();
            sprite.setup([this._spriteLayer], animation, false, 0, null);
            this._spriteLayer.addChild(sprite);
            this._animations.push(sprite);
        }
    };

    Window_LNReader.prototype.processOk = function() {
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
    };

    //-----------------------------------------------------------------------------
    // Scene_LNReader
    //
    // The scene class for the light novel reader.

    function Scene_LNReader() {
        this.initialize(...arguments);
    }

    Scene_LNReader.prototype = Object.create(Scene_Base.prototype);
    Scene_LNReader.prototype.constructor = Scene_LNReader;

    Scene_LNReader.prototype.initialize = function() {
        Scene_Base.prototype.initialize.call(this);
    };

    Scene_LNReader.prototype.create = function() {
        Scene_Base.prototype.create.call(this);
        this.createBackground();
        this.createWindowLayer();
        this.createReaderWindow();
        LN_Manager.loadData().then(() => this._readerWindow.refreshReader());
    };

    Scene_LNReader.prototype.createBackground = function() {
        this._backgroundSprite = new Sprite(SceneManager.backgroundBitmap());
        this.addChild(this._backgroundSprite);
    };

    Scene_LNReader.prototype.createReaderWindow = function() {
        const rect = new Rectangle(0, 0, Graphics.width, Graphics.height);
        this._readerWindow = new Window_LNReader(rect);
        this._readerWindow.setHandler("cancel", this.popScene.bind(this));
        this.addWindow(this._readerWindow);
        this._readerWindow.activate();
        this._readerWindow.select(0);
    };

    Scene_LNReader.prototype.isReady = function() {
        return Scene_Base.prototype.isReady.call(this) && LN_Manager.isReady();
    };

    window.Scene_LNReader = Scene_LNReader;

    //-----------------------------------------------------------------------------
    // Menu Integration
    //

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
