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
                horizontalCommands: config.horizontalCommands === "true" || config.horizontalCommands === true
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
            // win.windowskin = ImageManager.loadSystem(config.windowskin); // Deferred
            win.setBackgroundType(config.backgroundType);
            win.opacity = config.windowOpacity;
            win.dw_openCloseSpeed = config.openCloseSpeed;

            if (config.initiallyOpen) {
                win.open();
            } else {
                win.openness = 0;
                win.close();
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
                    // If not, a manual refresh might be needed after this, or adjust window width based on items.
                }
                if (config.commands && config.commands.length > 0) {
                    windowInstance.makeCommandList = function() {
                        config.commands.forEach(cmdConfig => {
                            const isEnabled = cmdConfig.jsCondition ? !!eval(cmdConfig.jsCondition) : cmdConfig.enabled;
                            const symbol = cmdConfig.symbol || cmdConfig.name.toLowerCase().replace(/\s+/g, '_');
                            this.addCommand(cmdConfig.name, symbol, isEnabled, cmdConfig.ext);
                        });
                    };
                    // Window_Command constructor calls refresh, which calls its makeCommandList.
                    // If we override makeCommandList after construction, we might need to manually call refresh
                    // or ensure it's called if the window is opened.
                    // However, Window_Command's initialize() calls this.refresh() which calls this.makeCommandList().
                    // So this should work as the constructor will use the overridden version.
                    // Let's ensure refresh is called if already open.
                    if (windowInstance.isOpen()) windowInstance.refresh();


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
