# ⭐ Star Hunter – HTML5 Canvas Game

## 📌 Project Overview
**Star Hunter** is a complete 2D entertainment game developed using **HTML5 Canvas** and **Vanilla JavaScript**.  
The game demonstrates core game development concepts including rendering, animation, collision detection, asset management, and real-time user interaction.

All gameplay logic, rendering, and interaction occur **entirely inside a single Canvas element**, following the same structure and coding style used in class.

---

## 🎯 Game Objectives
- Control the player character using the keyboard
- Move within a fixed game area
- Collect randomly appearing stars before they disappear
- Earn points for each collected star

---

## 🕹️ Controls
| Key | Action |
|----|-------|
| ⬆️ | Move Up |
| ⬇️ | Move Down |
| ⬅️ | Move Left |
| ➡️ | Move Right |

---

## 🧩 Game Features & Requirements

### ✅ Core Requirements Implemented
- Fixed game area with enforced boundaries
- Continuous display of:
  - Game title
  - Player score
- On-screen game instructions shown at the start
- Keyboard-controlled player movement in **four directions**
- Multiple stars generated at **random positions**
- Each star:
  - Has a **random lifetime**
  - Disappears if not collected in time
- Accurate **collision detection** between player and stars
- Real-time **score updates**

---

### ✨ Star Collection Effects
When a star is collected:
- 🔊 A sound effect is played
- 🎞️ A short animation is triggered:
  - Star changes size and rotation
- ⭐ The score increases immediately

---

## 🔄 Game Loop
The game uses a standard game loop structure:
- `update()` – handles movement, collision, timers, and game logic
- `draw()` – renders background, player, stars, UI elements

This ensures smooth animation and consistent gameplay.

---

## 🎨 Assets Used
All assets were selected manually and loaded correctly using JavaScript:

### Images
- Player character sprite
- Star sprite
- Background image

### Sound
- Star collection sound effect

### Asset Sources
- https://opengameart.org  
- https://www.kenney.nl/assets  
- https://itch.io/game-assets  
- https://freesound.org  
- https://mixkit.co/free-sound-effects/

---
## 🗂️ Project Structure
```text
StarHunter/
│── index.html
│── style.css
│── script.js
│── assets/
│   ├── player.png
│   ├── star.png
│   ├── background.png
│   └── collect.wav

<img width="1091" height="865" alt="Image" src="https://github.com/user-attachments/assets/a5b4230e-bfbf-41f7-8957-1abb23d5efc2" />

