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
            const config = JSON.parse(configStr); // Each element of struct array is also a string
            return {
                instanceName: String(config.instanceName || "MyWindow"),
                sceneName: String(config.sceneName || "Scene_Map"),
                windowType: String(config.windowType || "Window_Base"),
                x: Number(config.x || 0),
                y: Number(config.y || 0),
                width: Number(config.width || 240), // Default fixed width
                height: Number(config.height || 180), // Default fixed height
                windowskin: String(config.windowskin || "Window"),
                backgroundType: Number(config.backgroundType || 0),
                windowOpacity: Number(config.windowOpacity !== undefined ? config.windowOpacity : 255),
                openCloseSpeed: Number(config.openCloseSpeed || 16),
                initiallyOpen: config.initiallyOpen === "true" || config.initiallyOpen === true // Handle string "true" or boolean true
            };
        });
    }

    console.log("DynamicWindowManager Configs Loaded:", Jules.DynamicWindowManager.Configs);

    Jules.DynamicWindowManager.createWindowFromConfig = function(config, scene) {
        if (!config) return null;

        const rect = new Rectangle(config.x, config.y, config.width, config.height);
        let windowInstance = null;

        switch (config.windowType) {
            case "Window_Base":
                windowInstance = new Window_Base(rect);
                break;
            case "Window_Selectable":
                windowInstance = new Window_Selectable(rect);
                break;
            case "Window_Command":
                // Window_Command usually requires makeCommandList, but for just showing the shell:
                windowInstance = new Window_Command(rect);
                // It will be empty. We can call _makeCommandList later if options are defined.
                break;
            case "Window_Options":
                // Window_Options also requires specific setup (makeCommandList, addCommand)
                windowInstance = new Window_Options(rect);
                // It will be empty.
                break;
            default:
                console.error("DynamicWindowManager: Unknown window type specified - ", config.windowType);
                return null;
        }

        if (windowInstance) {
            // windowInstance.windowskin = ImageManager.loadSystem(config.windowskin); // This needs to be handled carefully
            // For default windows, changing skin after creation requires more work (refreshing parts).
            // We'll assume default skin for now, or this property is for custom window types.
            // A better approach for default windows might be to alias their initialize.

            windowInstance.setBackgroundType(config.backgroundType);
            windowInstance.opacity = config.windowOpacity; // Overall window opacity for frame/back
            // windowInstance.contentsOpacity = config.contentsOpacity || 255; // If we add this param

            // openCloseSpeed is used by open() and close() methods internally
            // We don't directly set a speed property that changes their default behavior
            // without overriding updateOpen/updateClose.
            // However, we can store it if our custom open/close logic uses it.
            windowInstance.dw_openCloseSpeed = config.openCloseSpeed; // Custom property for potential use

            if (config.initiallyOpen) {
                windowInstance.open(); // Uses its internal speed (Window_Base.OPEN_SPEED (255/frame) or its own updateOpen)
            } else {
                windowInstance.openness = 0;
                windowInstance.close(); // Ensure it's properly closed if not initially open
            }
        }
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
