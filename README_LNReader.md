# Jules_LNReader - Format Templates

This guide explains how to format the `story.txt` and `triggers.txt` files for the Jules_LNReader plugin.

## 1. Story File (`story.txt`)
The story file is a plain text file where each line corresponds to a frame of narrative text.

**Format:**
- Each line is a new piece of narration.
- Empty lines are ignored.
- Line indices start from 0 (the first line is index 0).

**Example:**
```text
This is the first line of the story.
A mysterious figure appears in the background.
The figure moves closer to the foreground.
"Hello there," the figure says.
```

---

## 2. Trigger File (`triggers.txt`)
The trigger file is a JSON file that maps story line indices to specific visual or audio actions.

**Format:**
```json
{
  "LINE_INDEX": [
    { "type": "ACTION_TYPE", "PARAM1": "VALUE1", ... },
    ...
  ]
}
```

### Supported Trigger Types

#### `bg` (Background Change)
Changes the upper or lower background image.
- `name`: File name in `img/parallaxes/`.
- `layer`: `"background"` (upper) or `"foreground"` (lower).

#### `bust` (Character Bust)
Shows a character sprite at a specific depth.
- `name`: File name in `img/pictures/`.
- `pos`: `"upperLeft"` (background depth) or `"lowerLeft"` (foreground depth).
- `effect`: `"fadeIn"` or `"move"`.
- `duration`: Time in frames.

#### `item` (Full Screen / Item)
Shows a centered item or full-screen image.
- `name`: File name in `img/pictures/`.
- `effect`: `"zoomIn"`.
- `duration`: Time in frames.

#### `music` (BGM)
Plays background music.
- `name`: File name in `audio/bgm/`.
- `volume`: 0 to 100.

#### `se` (Sound Effect)
Plays a one-shot sound.
- `name`: File name in `audio/se/`.

#### `particles` (Effekseer Animation)
Plays an RPG Maker MZ animation.
- `name`: The name of the animation in the database.

#### `clearSprites`
Clears all busts and items from the screen.

---

## Full Example Template

**story.txt:**
```text
The sun was setting over the ancient forest.
Suddenly, a warrior appeared from the shadows.
He brandished a glowing relic.
```

**triggers.txt:**
```json
{
  "0": [
    { "type": "clearSprites" },
    { "type": "bg", "name": "SunsetForest", "layer": "background" },
    { "type": "bg", "name": "Grass", "layer": "foreground" },
    { "type": "music", "name": "ForestAmbience", "volume": 80 }
  ],
  "1": [
    { "type": "bust", "name": "Warrior", "pos": "upperLeft", "effect": "fadeIn", "duration": 60 }
  ],
  "2": [
    { "type": "item", "name": "HolyRelic", "effect": "zoomIn", "duration": 45 },
    { "type": "se", "name": "MagicCharge" },
    { "type": "particles", "name": "LightFlash" }
  ]
}
```
