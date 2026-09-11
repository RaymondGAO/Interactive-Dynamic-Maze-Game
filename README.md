# Interactive Dynamic Maze Game

A browser-based Night Neon maze game controlled with the keyboard.

## Easy Ways to Launch

### Play Online with GitHub Pages

GitHub Pages turns this repository into a public website. After it is enabled, anyone can play by opening:

https://raymondgao.github.io/Interactive-Dynamic-Maze-Game/

To enable it once:

1. Open the repository **Settings** page.
2. Select **Pages** in the left sidebar.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and the `/ (root)` folder, then select **Save**.
5. Wait briefly, then open the link above.

### Download and Open Directly

No installation is required.

1. Open the repository page: https://github.com/RaymondGAO/Interactive-Dynamic-Maze-Game
2. Select **Code**, then choose **Download ZIP**.
3. Extract the ZIP file.
4. Open `index.html` in the extracted folder. It redirects to `neon.html` and starts the game.

### Clone and Run Locally

Clone the repository with Git:

   ```text
   git clone https://github.com/RaymondGAO/Interactive-Dynamic-Maze-Game.git
   ```

Then serve the repository from inside its folder with a local static server:

```text
python3 -m http.server
```

Then open `http://localhost:8000` in a browser.

## Controls

| Key | Direction |
| --- | --- |
| Up arrow or `8` | Up |
| Down arrow or `2` | Down |
| Left arrow or `4` | Left |
| Right arrow or `6` | Right |
| `R` | Restart the run |

The numeric controls follow the compact-keyboard layout shown in the game:

```text
  8
4 2 6
```

## Game Rules

- The maze is a fixed 10×10 grid.
- `@@` is the player.
- `W` cells are walls and cannot be entered.
- Open cells can be crossed.
- `EX` cells are exits. Reaching any exit wins the game. The current maze has three exits.
- `MR` is a mirror item.
- `RT` is a rotation item.
- The step counter records every cell entered during movement.
- Attempting to move directly into a wall does not add steps.

### Momentum Movement

Each directional input begins by checking the next cell. If it is open, `@@` continues moving in that direction until one of these conditions is reached:

- The next cell is a wall or the edge of the grid.
- The current cell is an exit, mirror, or rotation item.
- The next cell is an exit, mirror, or rotation item.
- The current cell is a junction with more than two walkable neighbors.

This means one key press may move the player across multiple cells. A light-blue trail marks the starting cell and cells crossed during that movement, then fades automatically.

### Special Items

- **Mirror (`MR`)**: Flips the entire maze from left to right and updates the player position to the matching mirrored cell.
- **Rotation (`RT`)**: Rotates the entire maze 90 degrees clockwise and moves the player to the corresponding rotated position. The player remains on the same `RT` tile after the transformation.

The maze layout and player position are transformed together, so walls, exits, items, and the player keep their relative locations after each effect.

## Winning

The run ends when `@@` reaches an exit. The game displays the completed step count and a neon celebration message. Press `R` or click **Restart run** to start again.

## Project Files

- `index.html` - Entry page that redirects to the game.
- `neon.html` - Game interface markup.
- `game.js` - Maze data and gameplay logic.
- `styles.css` - Layout, Night Neon styling, trails, and celebration animations.
