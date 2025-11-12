# 🌧️ Night Rain Canvas Animation

A beautiful HTML5 Canvas animation featuring rain falling in a starry night sky with occasional lightning strikes, built with TypeScript.

## ✨ Features

- **Realistic Rain Animation**: Individual raindrops with varying speeds, lengths, and opacity
- **Starry Night Sky**: Twinkling stars in a gradient night sky background
- **Lightning Effects**: Random lightning strikes with branching bolts and screen flash
- **Interactive Controls**: Toggle rain/lightning and adjust rain intensity
- **Responsive Design**: Adapts to window resize
- **TypeScript**: Fully typed with modern ES2020 features

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- A modern web browser
- TypeScript (installed via npm)

### Installation

1. Clone or download this project
2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the TypeScript code:

   ```bash
   npm run build
   ```

4. Start a local server:

   ```bash
   npm run serve
   ```

5. Open your browser and navigate to `http://localhost:8000`

## 🎮 Controls

- **Toggle Rain**: Start/stop the rain animation
- **Toggle Lightning**: Enable/disable lightning effects
- **More Rain**: Increase rain intensity (add more raindrops)
- **Less Rain**: Decrease rain intensity (remove raindrops)

## 🏗️ Project Structure

```
canvas-rain-night/
├── src/
│   ├── main.ts          # Application entry point
│   ├── rainScene.ts     # Main scene manager
│   ├── raindrop.ts      # Individual raindrop class
│   └── lightning.ts     # Lightning effects
├── dist/                # Compiled JavaScript (generated)
├── index.html           # Main HTML file
├── package.json         # NPM configuration
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

## 🛠️ Development

### Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Watch for changes and auto-compile
- `npm run serve` - Start a local HTTP server

### Development Workflow

1. Start the TypeScript compiler in watch mode:

   ```bash
   npm run dev
   ```

2. In another terminal, start the local server:

   ```bash
   npm run serve
   ```

3. Make changes to the TypeScript files in the `src/` directory
4. The compiler will automatically rebuild, and you can refresh the browser to see changes

## 🎨 Customization

### Rain Properties

Modify the `Raindrop` class in `src/raindrop.ts`:

- Speed range
- Length and width variations
- Opacity and color
- Movement patterns

### Lightning Effects

Adjust lightning in `src/lightning.ts`:

- Strike frequency and timing
- Branch patterns and complexity
- Flash intensity and duration
- Lightning colors and glow effects

### Scene Settings

Configure the overall scene in `src/rainScene.ts`:

- Number of stars and their behavior
- Background gradient colors
- Default rain intensity
- Canvas update frequency

## 🌟 Technical Details

- **Canvas API**: Uses HTML5 Canvas 2D rendering context
- **Animation Loop**: Efficient requestAnimationFrame-based animation
- **Performance**: Optimized rendering with proper cleanup and batching
- **Responsive**: Handles window resize and visibility changes
- **Modern JavaScript**: ES2020 modules with proper imports/exports

## 🎯 Future Enhancements

Potential improvements you could add:

- Sound effects (rain, thunder)
- Wind effects on rain direction
- Different weather patterns (heavy/light rain)
- Ground puddles and splash effects
- Buildings or landscape silhouettes
- Particle system for more complex effects

## 🤝 Contributing

Feel free to fork this project and add your own creative touches! Some ideas:

- Add new weather effects
- Improve the lightning algorithm
- Add sound integration
- Create different time-of-day themes
- Optimize performance further

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

Enjoy the calming night rain! 🌧️✨
