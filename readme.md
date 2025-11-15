# Brick Smasher 3D  
**A simple, satisfying physics destruction car game built with Three.js + Cannon.js**

## Aim of the Project
To create a fun, lightweight, browser-based 3D arcade game where the player drives a blocky car made of primitive shapes and smashes through destructible brick walls for points.  
The focus is on **juicy physics-based destruction**, simple controls, and instant replayability — all in a single HTML file with zero build tools required.

## Game Concept
- You control a colorful boxy car using **WASD** to drive and **Spacebar** to jump.
- Your mission: crash into brick walls at high speed and watch hundreds of bricks fly apart realistically.
- Each destroyed brick gives you **+10 points**.
- The arena is a **closed bounded box** — drive too far and you hit invisible walls (or visible barriers later).
- Press **R** to instantly reset the car and respawn random walls — endless smashing!

It’s like a love letter to classic destruction derby games, but built from scratch with pure WebGL and physics.

## Features (MVP - What We Will 100% Implement)

- [ ] Bounded 3D arena (big box with visible or invisible walls)
- [ ] Simple car made of Three.js primitive shapes (box + cylinders)
- [ ] Realistic drivable physics using Cannon.js `RaycastVehicle`
- [ ] Controls:  
  W/S → Accelerate / Reverse + Brake  
  A/D → Steering  
  Space → Big Jump (upward impulse)  
- [ ] Smooth third-person chase camera
- [ ] Multiple destructible brick walls (stacked physics boxes)
- [ ] Realistic brick scattering on impact
- [ ] Score counter (+10 per brick destroyed)
- [ ] Speed display (km/h)
- [ ] Simple UI overlay (score, speed, "R to restart")
- [ ] Full restart system (R key resets car position + randomizes walls)
- [ ] Object pooling for bricks (smooth performance with 200+ bricks)

## Bonus (Nice-to-have, if time allows)
- [ ] Particle effects on big crashes
- [ ] Screen shake on impact
- [ ] Simple sound effects (engine, crash, jump)
- [ ] Different car colors on restart
- [ ] Visible arena walls with textures

## Tech Stack
- Three.js (r165+) – 3D rendering
- Cannon.js (classic) – Physics engine
- Vanilla JavaScript – No frameworks, no build tools
- Single `index.html` file (easy to share and host)

## How to Run
1. Download or clone this repo
2. Open `index.html` in any modern browser (Chrome/Firefox recommended)
3. Smash stuff!

## Controls
| Key       | Action                  |
|---------|-------------------------|
| W / S   | Accelerate / Reverse    |
| A / D   | Steer left / right      |
| Space   | Jump                    |
| R       | Restart game            |

---

**Made with love and physics by [Your Name] in 2025**  
Wanna smash? Just open the file and drive!

---