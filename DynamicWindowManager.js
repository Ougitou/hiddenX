//=============================================================================
// DynamicWindowManager.js
//=============================================================================

/*:
 * @target MZ
 * @plugindesc (v0.01) Dynamically creates and manages windows based on configurations.
 * @author Jules
 * @url https://example.com/dynamicwindowmanager
 *
 * @help
 * DynamicWindowManager.js
 * Version 0.01
 *
 * This plugin allows you to define multiple window configurations through
 * plugin parameters. These windows can then be instantiated in specified
 * scenes.
 *
 * Phase 1: Basic window instance creation and core properties.
 *
 * @param windowConfigurations
 * @text Window Configurations
 * @desc Define configurations for multiple dynamic windows.
 * @type struct<WindowConfig>[]
 * @default []
 *
 * ============================================================================
 * Structure Definitions
 * ============================================================================
 * @struct WindowConfig
 *
 * @param instanceName
 * @text Instance Name
 * @desc A unique name/ID for this window instance (e.g., "StatusSummary", "ConfirmExit").
 * @type string
 * @default MyWindow
 *
 * @param sceneName
 * @text Scene Name
 * @desc The name of the scene this window belongs to (e.g., "Scene_Map", "Scene_Menu").
 * @type string
 * @default Scene_Map
 *
 * @param windowType
 * @text Window Type
 * @desc The base type of the window to create.
 * @type select
 * @option Window_Base
 * @value Window_Base
 * @option Window_Selectable
 * @value Window_Selectable
 * @option Window_Command
 * @value Window_Command
 * @option Window_Options
 * @value Window_Options
 * @default Window_Base
 *
 * @param x
 * @text X Position
 * @desc The X coordinate of the window.
 * @type number
 * @default 0
 *
 * @param y
 * @text Y Position
 * @desc The Y coordinate of the window.
 * @type number
 * @default 0
 *
 * @param width
 * @text Width
 * @desc The width of the window.
 * @type number
 * @min 1
 * @default 240
 *
 * @param height
 * @text Height
 * @desc The height of the window.
 * @type number
 * @min 1
 * @default 180
 *
 * @param windowskin
 * @text Windowskin
 * @desc The windowskin file to use from img/system/.
 * @type file
 * @dir img/system/
 * @default Window
 *
 * @param backgroundType
 * @text Background Type
 * @desc Type of window background (0: Normal, 1: Dimmed, 2: Transparent).
 * @type select
 * @option Normal
 * @value 0
 * @option Dimmed
 * @value 1
 * @option Transparent
 * @value 2
 * @default 0
 *
 * @param windowOpacity
 * @text Window Opacity
 * @desc Overall opacity of the window frame and background (0-255).
 * @type number
 * @min 0
 * @max 255
 * @default 255
 *
 * @param openCloseSpeed
 * @text Open/Close Speed
 * @desc Speed of the window's opening/closing animation (higher is faster).
 * @type number
 * @min 1
 * @default 16
 *
 * @param initiallyOpen
 * @text Initially Open
 * @desc Whether the window should be open when the scene starts.
 * @type boolean
 * @default true
 *
 * @param commands
 * @text Commands/Options
 * @desc For Command/Options windows: list of entries.
 * @type struct<CommandEntry>[]
 * @default []
 *
 * @struct CommandEntry
 *
 * @param name
 * @text Name
 * @desc The text displayed for the command/option.
 * @type string
 * @default Command
 *
 * @param symbol
 * @text Symbol
 * @desc Optional symbol for the command handler. If empty, derived from name.
 * @type string
 * @default
 *
 * @param enabled
 * @text Enabled (Default)
 * @desc Is the command enabled by default? (Can be overridden by JS Condition).
 * @type boolean
 * @default true
 *
 * @param ext
 * @text Extra Data (ext)
 * @desc Optional extra data associated with this command (passed to handler).
 * @type string
 * @default
 *
 * @param scriptCall
 * @text Script Call on OK
 * @desc JavaScript code to execute when this command is triggered.
 * @type note
 * @default ""
 *
 * @param jsCondition
 * @text JS Condition (Enabled)
 * @desc JavaScript code that evaluates to true or false to determine if enabled. Overrides 'Enabled (Default)'.
 * @type note
 * @default ""
 *
 * @param cursorFixed
 * @text Cursor Fixed
 * @desc For Selectable windows, is the cursor fixed (does not move)?
 * @type boolean
 * @default false
 *
 * @param horizontalCommands
 * @text Horizontal Commands
 * @desc For Command windows, arrange commands horizontally?
 * @type boolean
 * @default false
 *
 * @param contentText
 * @text Content Text
 * @desc Text to draw in the window. Use \\n for new lines. Supports some message codes like \\c[n], \\i[n].
 * @type multiline_string
 * @default
 *
 * @param contentAlignment
 * @text Content Alignment
 * @desc Horizontal alignment for the content text (Currently mainly affects Window_Base with drawText).
 * @type select
 * @option left
 * @value left
 * @option center
 * @value center
 * @option right
 * @value right
 * @default left
 *
 * @param customPadding
 * @text Custom Padding
 * @desc Override default window padding. -1 to use default.
 * @type number
 * @min -1
 * @default -1
 *
 * @param customLineHeight
 * @text Custom Line Height
 * @desc Override default line height. 0 to use default.
 * @type number
 * @min 0
 * @default 0
 *
 * @param windowBackgroundImage
 * @text Window Background Image
 * @desc Image file from img/pictures/ to use as window background.
 * @type file
 * @dir img/pictures/
 * @default
 *
 * @param backgroundImageOpacity
 * @text Background Image Opacity
 * @desc Opacity for the window background image (0-255).
 * @type number
 * @min 0
 * @max 255
 * @default 255
 *
 * @param parallaxLoopX
 * @text Parallax Loop X
 * @desc Horizontal looping speed for the background image (0 for none).
 * @type number
 * @default 0
 *
 * @param parallaxLoopY
 * @text Parallax Loop Y
 * @desc Vertical looping speed for the background image (0 for none).
 * @type number
 * @default 0
 *
 */

var Jules = Jules || {};
Jules.DynamicWindowManager = Jules.DynamicWindowManager || {};
Jules.DynamicWindowManager.pluginName = "DynamicWindowManager";

// Configs will be populated by parsing parameters
Jules.DynamicWindowManager.Configs = [];
// Active window instances will be stored here
Jules.DynamicWindowManager.ActiveWindows = {};

(() => {
    'use strict';

    const script = Jules.DynamicWindowManager.pluginName;
    const params = PluginManager.parameters(script);

    // Parameter parsing will go here in the next step.
    // For now, Jules.DynamicWindowManager.Configs remains empty or will be manually
    // populated for testing if needed before full parsing is implemented.

    const rawConfigs = params['windowConfigurations'];
    if (rawConfigs) {
        const parsedConfigs = JSON.parse(rawConfigs);
        Jules.DynamicWindowManager.Configs = parsedConfigs.map(configStr => {
            const config = JSON.parse(configStr);

            let commands = [];
            if (config.commands) {
                try {
                    const parsedCommandsArray = JSON.parse(config.commands);
                    if (Array.isArray(parsedCommandsArray)) {
                        commands = parsedCommandsArray.map(cmdStr => {
                            const cmdConfig = JSON.parse(cmdStr);
                            return {
                                name: String(cmdConfig.name || "Command"),
                                symbol: String(cmdConfig.symbol || ""),
                                enabled: cmdConfig.enabled === "true" || cmdConfig.enabled === true,
                                ext: String(cmdConfig.ext || ""),
                                scriptCall: String(cmdConfig.scriptCall || "").trim(),
                                jsCondition: String(cmdConfig.jsCondition || "").trim()
                            };
                        });
                    }
                } catch (e) {
                    console.error("DynamicWindowManager: Error parsing commands for config", config.instanceName, e);
                }
            }

            return {
                instanceName: String(config.instanceName || "MyWindow"),
                sceneName: String(config.sceneName || "Scene_Map"),
                windowType: String(config.windowType || "Window_Base"),
                x: Number(config.x || 0),
                y: Number(config.y || 0),
                width: Number(config.width || 240),
                height: Number(config.height || 180),
                windowskin: String(config.windowskin || "Window"),
                backgroundType: Number(config.backgroundType || 0),
                windowOpacity: Number(config.windowOpacity !== undefined ? config.windowOpacity : 255),
                openCloseSpeed: Number(config.openCloseSpeed || 16),
                initiallyOpen: config.initiallyOpen === "true" || config.initiallyOpen === true,
                commands: commands,
                cursorFixed: config.cursorFixed === "true" || config.cursorFixed === true,
                horizontalCommands: config.horizontalCommands === "true" || config.horizontalCommands === true,
                contentText: String(config.contentText || ""), // New
                contentAlignment: String(config.contentAlignment || "left"), // New
                customPadding: Number(config.customPadding !== undefined ? config.customPadding : -1),
                customLineHeight: Number(config.customLineHeight || 0),
                windowBackgroundImage: String(config.windowBackgroundImage || ""), // New
                backgroundImageOpacity: Number(config.backgroundImageOpacity !== undefined ? config.backgroundImageOpacity : 255), // New
                parallaxLoopX: Number(config.parallaxLoopX || 0), // New
                parallaxLoopY: Number(config.parallaxLoopY || 0)  // New
            };
        });
    }

    console.log("DynamicWindowManager Configs Loaded:", Jules.DynamicWindowManager.Configs);

    Jules.DynamicWindowManager.createWindowFromConfig = function(config, scene) {
        if (!config) return null;

        const rect = new Rectangle(config.x, config.y, config.width, config.height);
        let windowInstance = null;

        // Common window setup before type-specific instantiation
        const commonSetup = (win) => {
            win.setBackgroundType(config.backgroundType);
            win.opacity = config.windowOpacity;
            win.dw_openCloseSpeed = config.openCloseSpeed;

            // Apply custom padding if specified
            if (config.customPadding >= 0 && typeof win.updatePadding === 'function') {
                // Directly setting _padding and calling updatePadding is safer for default windows
                win._padding = config.customPadding;
                win.updatePadding();
            }

            // Override lineHeight if specified (instance-specific)
            if (config.customLineHeight > 0 && typeof win.lineHeight === 'function') {
                win.lineHeight = function() { return config.customLineHeight; };
            }

            // Content drawing for Window_Base types with text
            if (config.windowType === "Window_Base" && config.contentText && config.contentText.trim() !== "") {
                win.refresh = function() {
                    this.contents.clear();
                    const lines = config.contentText.split("\\n"); // Literal \n for new lines
                    let y = 0;
                    const x = this.itemPadding(); // For drawTextEx, x is the starting point
                    // Note: contentAlignment is not fully handled by drawTextEx for block alignment.
                    // For now, all lines will be left-aligned starting at itemPadding().
                    // To implement full alignment for drawTextEx, each line would need width calculation
                    // and x adjustment, or switch to drawText for simpler alignment but less escape code support per line.
                    for (const line of lines) {
                        this.drawTextEx(line, x, y);
                        y += this.lineHeight();
                    }
                };
            }


            if (config.initiallyOpen) {
                win.open(); // This will also call refresh if the window implements it that way
            } else {
                win.openness = 0;
                win.close();
            }

            // Explicitly refresh if open and refresh exists, to ensure content is drawn after all overrides
            if (win.isOpen() && typeof win.refresh === 'function') {
                win.refresh();
            }

            // Handle Window Background Image
            if (config.windowBackgroundImage && config.windowBackgroundImage !== "") {
                const bitmap = ImageManager.loadPicture(config.windowBackgroundImage);
                // Ensure bitmap is loaded before creating TilingSprite to avoid issues with width/height
                // However, TilingSprite can be created with a not-yet-loaded bitmap.
                // It will update its texture once the bitmap loads.
                const bgSprite = new TilingSprite(bitmap);

                bgSprite.width = win.innerWidth; // Use innerWidth/Height to fit inside padding
                bgSprite.height = win.innerHeight;
                bgSprite.x = win.padding; // Position it at the content origin
                bgSprite.y = win.padding;

                bgSprite.opacity = config.backgroundImageOpacity;
                bgSprite.dw_parallaxX = config.parallaxLoopX; // Store custom parallax speeds
                bgSprite.dw_parallaxY = config.parallaxLoopY;

                win._dwBgSprite = bgSprite; // Store reference on the window
                win.addChildAt(win._dwBgSprite, 0); // Add as the very first child (lowest z-index within window)

                // Force window's own background to be transparent so image can be seen
                win.setBackgroundType(2);
            }
        };

        switch (config.windowType) {
            case "Window_Base":
                windowInstance = new Window_Base(rect);
                commonSetup(windowInstance);
                break;
            case "Window_Selectable":
                windowInstance = new Window_Selectable(rect);
                commonSetup(windowInstance);
                if (windowInstance.setCursorFixed) { // Check if method exists
                    windowInstance.setCursorFixed(!!config.cursorFixed);
                }
                break;
            case "Window_Command":
                windowInstance = new Window_Command(rect);
                commonSetup(windowInstance);
                if (windowInstance.setCursorFixed) {
                    windowInstance.setCursorFixed(!!config.cursorFixed);
                }
                if (config.horizontalCommands) {
                    windowInstance.maxCols = function() {
                        // Return number of commands, or a fixed number if too many to fit
                        const numCmds = this._list ? this._list.length : 1;
                        return Math.max(1, numCmds); // Ensure at least 1 col
                    };
                    // Window_Command constructor calls refresh, which should use new maxCols.
                }
                // Command population logic (ensure it's after commonSetup if refresh is called there)
                if (config.commands && config.commands.length > 0) {
                    windowInstance.makeCommandList = function() {
                        config.commands.forEach(cmdConfig => {
                            const isEnabled = cmdConfig.jsCondition ? !!eval(cmdConfig.jsCondition) : cmdConfig.enabled;
                            const symbol = cmdConfig.symbol || cmdConfig.name.toLowerCase().replace(/\s+/g, '_');
                            this.addCommand(cmdConfig.name, symbol, isEnabled, cmdConfig.ext);
                        });
                    };
                    // Window_Command's constructor calls refresh, which will use the overridden makeCommandList.
                    // If the window was setup to be initially open, commonSetup would have called open(), which calls refresh.
                    // If it was initially closed, then opened later, its open() will call refresh.
                    // If already open from commonSetup, and makeCommandList is defined *after* that, ensure refresh.
                    if (windowInstance.isOpen() && !windowInstance._opening) windowInstance.refresh();


                    config.commands.forEach(cmdConfig => {
                        if (cmdConfig.scriptCall) {
                            const symbol = cmdConfig.symbol || cmdConfig.name.toLowerCase().replace(/\s+/g, '_');
                            windowInstance.setHandler(symbol, function() {
                                console.log("Dynamic Window Command:", cmdConfig.name, "Symbol:", symbol, "Ext:", this.currentExt());
                                try {
                                    eval(cmdConfig.scriptCall);
                                } catch (e) {
                                    console.error("Error executing scriptCall for command:", cmdConfig.name, e);
                                }
                                if (this.active && !this.isClosedOrClosing()) {
                                    this.activate();
                                }
                            }.bind(windowInstance));
                        }
                    });
                }
                break;
            case "Window_Options":
                windowInstance = new Window_Options(rect);
                commonSetup(windowInstance);
                if (windowInstance.setCursorFixed) {
                    windowInstance.setCursorFixed(!!config.cursorFixed);
                }
                 if (config.commands && config.commands.length > 0) {
                    windowInstance.makeCommandList = function() {
                        config.commands.forEach(cmdConfig => {
                            const isEnabled = cmdConfig.jsCondition ? !!eval(cmdConfig.jsCondition) : cmdConfig.enabled;
                            const symbol = cmdConfig.symbol || cmdConfig.name.toLowerCase().replace(/\s+/g, '_');
                            this.addCommand(cmdConfig.name, symbol, isEnabled);
                        });
                    };
                    if (windowInstance.isOpen()) windowInstance.refresh();

                    config.commands.forEach(cmdConfig => {
                        if (cmdConfig.scriptCall) {
                            const symbol = cmdConfig.symbol || cmdConfig.name.toLowerCase().replace(/\s+/g, '_');
                            windowInstance.setHandler(symbol, function() {
                                console.log("Dynamic Options Window Command:", cmdConfig.name, "Symbol:", symbol);
                                 try {
                                    eval(cmdConfig.scriptCall);
                                } catch (e) {
                                    console.error("Error executing scriptCall for option:", cmdConfig.name, e);
                                }
                                if (this.active && !this.isClosedOrClosing()) {
                                    this.activate();
                                }
                            }.bind(windowInstance));
                        }
                    });
                }
                break;
            default:
                console.error("DynamicWindowManager: Unknown window type specified - ", config.windowType);
                return null;
        }

        // commonSetup(windowInstance) is called inside each case now if windowInstance is created.
        return windowInstance;
    };

    //=============================================================================
    // Window_Base Parallax Update
    //=============================================================================
    const _Window_Base_update = Window_Base.prototype.update;
    Window_Base.prototype.update = function() {
        _Window_Base_update.call(this);
        if (this._dwBgSprite && this._dwBgSprite.bitmap && this._dwBgSprite.bitmap.isReady() && this.isOpen()) {
            if (this._dwBgSprite.dw_parallaxX !== 0) {
                this._dwBgSprite.origin.x += this._dwBgSprite.dw_parallaxX;
            }
            if (this._dwBgSprite.dw_parallaxY !== 0) {
                this._dwBgSprite.origin.y += this._dwBgSprite.dw_parallaxY;
            }
        }
    };

    const _Scene_Base_createWindowLayer = Scene_Base.prototype.createWindowLayer;
    Scene_Base.prototype.createWindowLayer = function() {
        _Scene_Base_createWindowLayer.call(this);

        // console.log("DynamicWindowManager: Checking windows for scene:", this.constructor.name);
        Jules.DynamicWindowManager.Configs.forEach(config => {
            if (config.sceneName === this.constructor.name) {
                // console.log("DynamicWindowManager: Creating window for config:", config.instanceName);
                const windowInstance = Jules.DynamicWindowManager.createWindowFromConfig(config, this);
                if (windowInstance) {
                    Jules.DynamicWindowManager.ActiveWindows[config.instanceName] = windowInstance;
                    this.addWindow(windowInstance);
                    // console.log("DynamicWindowManager: Added window:", config.instanceName, windowInstance);
                }
            }
        });
    };

})();
