# Light Novel Reader System Documentation

This document describes the system architecture and logic flow of the `Jules_LNReader` plugin for RPG Maker MZ.

## 1. System Architecture (Component Overview)

The system is built on a Model-View-Controller (MVC) inspired architecture:

*   **Model (LN_Manager):** A static class that holds the narrative data (`story.txt`) and trigger data (`triggers.txt`). It manages the state machine (INIT -> LOADING -> READY) and the current narrative index.
*   **View (Window_LNReader):** A single unified window that renders all visual layers (Backgrounds, Busts, Items, Narrative Text) and the interactive Control Bar.
*   **Controller (Scene_LNReader):** Coordinates between the Manager and the Window. It initializes the environment and handles scene transitions.

---

## 2. Narrative Flow Diagram (Pseudo Code)

### A. Initialization & Loading
```text
[Game Start / Menu Click]
|
v
Scene_LNReader.create()
|-- Window_LNReader.create()
|   |-- Initialize Visual Layers (BG, Sprite, Text)
|   |-- Setup Selectable Controls (Play, Next, etc.)
v
LN_Manager.loadData() (Asynchronous)
|-- Fetch story.txt -> Parse into Array
|-- Fetch triggers.txt -> Parse into JSON Object
v
On Success: Set State = READY
v
Window_LNReader.refreshReader()
|-- Window_LNReader.refresh() (Draw current text)
|-- Window_LNReader.executeTriggers() (Process Line 0 Actions)
```

### B. Frame Update Loop (State Machine)
```text
Window_LNReader.update()
|-- If State == PLAYING:
|   |-- Auto-Play Timer++
|   |-- If Timer >= 120 Frames:
|       |-- Execute "Next" Logic
|
|-- updateInternalSprites() (CRITICAL)
|   |-- For each Child Sprite (Bust/Item):
|       |-- Child.update() (Drive Fade/Move/Zoom animations)
|   |-- For each Active Animation (Particles):
|       |-- Animation.update()
|       |-- If finished: Remove from Layer
```

### C. Narrative Navigation
```text
Input: [OK] on "Next" Button
|
v
LN_Manager.next()
|-- Increment currentIndex
|-- Return TRUE if within bounds
v
Window_LNReader.refreshReader()
|-- Contents.clear()
|-- Draw current story line text
|-- executeTriggers(currentIndex)
    |-- switch(trigger.type):
        |-- "bg": Update Background Bitmaps
        |-- "bust": Add/Replace Sprite at Pos (apply entrance effect)
        |-- "item": Add/Replace Item Sprite
        |-- "music/se": Play Audio via AudioManager
        |-- "particles": Play Animation via Sprite_Animation
```

---

## 3. Interaction Logic (Pseudo Code)

### Button Handling (`processOk`)
```javascript
FUNCTION processOk():
    index = this.index()

    SWITCH index:
        CASE 0 (Play): Toggle State (PLAYING <-> PAUSED)
        CASE 1 (Next): LN_Manager.next() -> refreshReader()
        CASE 2 (Prev): LN_Manager.previous() -> refreshReader()
        CASE 3 (FF): LN_Manager.jumpTo(current + 10) -> refreshReader()
        CASE 4 (RW): LN_Manager.jumpTo(current - 10) -> refreshReader()
        CASE 5 (Mute): Toggle ConfigManager.bgmVolume
        CASE 6 (Set): SceneManager.push(Scene_Options)

    this.activate() // Keep window active for next input
```

### Trigger Execution (`executeTriggers`)
```javascript
FUNCTION executeTriggers(triggers):
    FOR EACH trigger IN triggers:
        IF trigger.type == "bust":
            // Avoid stacking: remove existing bust at same position
            IF this._busts[trigger.pos] EXISTS:
                Remove old bust

            newBust = CREATE Sprite_LNBust
            newBust.setup(trigger.name, trigger.pos)
            newBust.applyEffect(trigger.effect, trigger.duration)
            this._busts[trigger.pos] = newBust

        ELSE IF trigger.type == "clearSprites":
            Remove all children from SpriteLayer
            Reset bust/item tracking objects
```
