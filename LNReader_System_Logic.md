# Light Novel Reader System Documentation

This document describes the system architecture and logic flow of the `Jules_LNReader` plugin for RPG Maker MZ, refactored to follow core engine standards.

## 1. System Architecture (Component Overview)

The system follows the standard RPG Maker MZ prototype-based architecture and MVC pattern:

*   **Model (LN_Manager):** A global-like static manager that handles narrative data (`story.txt`) and trigger data (`triggers.txt`). It manages the state machine (init -> loading -> ready -> playing -> paused).
*   **View (Window_LNReader):** A single full-screen window (inheriting from `Window_Selectable`) that manages hierarchical sprite layers for backgrounds, character busts, and items. It renders narrative text using `drawTextEx`.
*   **Controller (Scene_LNReader):** The orchestrator (inheriting from `Scene_Base`) that initializes the manager, creates the window, and resolves user interactions via the standard handler pattern.

---

## 2. Narrative Flow Diagram (Pseudo Code)

### A. Initialization & Loading
```text
[Game Start / Menu Click]
|
v
Scene_LNReader.create()
|-- Scene_LNReader.createReaderWindow()
|   |-- Window_LNReader.initialize()
|   |-- Window_LNReader.setHandler(symbol, method) // Link buttons to Scene methods
v
LN_Manager.loadData() (Asynchronous)
|-- Fetch story.txt -> Parse into Array
|-- Fetch triggers.txt -> Parse into JSON Object
v
On Success: Set State = "ready"
v
Scene_LNReader (Trigger first turn):
|-- Window_LNReader.refreshReader()
|   |-- Window_LNReader.refresh() (Draw current text)
|   |-- Window_LNReader.executeTriggers() (Process Line 0 Actions)
```

### B. Frame Update Loop
```text
Window_LNReader.update()
|-- Window_Selectable.prototype.update.call(this) (Automatic child sprite updates)
|-- Window_LNReader.updateStateMachine()
|   |-- If State == "playing":
|       |-- Auto-Play Timer++
|       |-- If Timer >= 120 Frames: Execute "next" Handler
|
|-- Window_LNReader.updateAnimationCleanup()
|   |-- For each Active Effekseer Animation:
|       |-- If finished: Remove from Layer
```

### C. Narrative Navigation
```text
Input: [OK] on "Next" Button
|
v
Window_LNReader.processOk()
|-- Window_LNReader.callHandler("next")
v
Scene_LNReader.onControlNext()
|-- LN_Manager.next()
|-- If success: Window_LNReader.refreshReader()
    |-- Contents.clear()
    |-- Draw current story line text
    |-- executeTriggers(currentIndex)
```

---

## 3. Interaction Logic (Pseudo Code)

### Button Handler Resolution (Scene-level)
```javascript
// Scene_LNReader handles the "How" of the controls
FUNCTION onControlMute():
    ConfigManager.bgmVolume = toggle(0, 100)
    ConfigManager.save()
    ConfigManager.applyData()
    this._readerWindow.refresh()

FUNCTION onControlPlay():
    LN_Manager.setState(is_playing ? "paused" : "playing")
    this._readerWindow.refresh()
```

### Sprite Layering & Replacement
```javascript
// Window_LNReader handles the "What" of visuals
FUNCTION showBust(name, pos, effect, duration):
    // Position-based replacement prevents sprite stacking
    IF this._busts[pos] EXISTS:
        this._spriteLayer.removeChild(this._busts[pos])

    bust = NEW Sprite_LNBust()
    bust.setup(name, pos)
    bust.applyEffect(effect, duration)
    this._spriteLayer.addChild(bust)
    this._busts[pos] = bust
```
