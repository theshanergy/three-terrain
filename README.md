# Three Terrain

A procedural terrain generation system built with Three.js, React Three Fiber, and React. Features dynamic level-of-detail (LOD) terrain rendering, multiple biomes, vegetation generation, and interactive controls.

## Features

- **Procedural Terrain Generation**: Noise-based heightmap generation with configurable parameters
- **Level of Detail (LOD)**: Quadtree-based terrain subdivision for optimized rendering performance
- **Multiple Biomes**: Desert, mountain, and winter environments with unique characteristics
- **Dynamic Vegetation**: Procedurally placed vegetation based on terrain properties
- **Water Simulation**: Animated water with custom shaders
- **Environment System**: Sky, sun, and atmospheric effects
- **Performance Monitoring**: Built-in FPS and performance tracking
- **Interactive Controls**: Real-time terrain parameter adjustment via UI controls

## Tech Stack

- **Three.js** - 3D graphics rendering
- **React Three Fiber** - React renderer for Three.js
- **React Drei** - Helpful Three.js components
- **React** - UI framework
- **Vite** - Build tool and dev server
- **Leva** - GUI controls for parameter tweaking
- **Zustand** - State management
- **Tailwind CSS** - Styling

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/theshanergy/three-terrain.git

# Navigate to project directory
cd three-terrain

# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev
```

Open your browser and navigate to the local development URL (typically `http://localhost:5173`).

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
├── components/          # React components
│   ├── scene/          # 3D scene components
│   │   ├── environment/ # Sky, sun, terrain
│   │   └── managers/   # Performance monitoring
│   └── ui/             # UI components
├── config/             # Configuration files
│   └── biomes/         # Biome definitions
├── hooks/              # Custom React hooks
├── shaders/            # GLSL shader files
├── store/              # State management
├── utils/              # Utility functions
└── api/                # API entry point
```

## Configuration

### Biomes

The project includes three preset biomes:
- **Desert**: Warm, sandy environment with sparse vegetation
- **Mountain**: Rocky terrain with varied elevation
- **Winter**: Snow-covered landscape with cold atmosphere

Biome configurations can be found in `config/biomes/`.

### Terrain Parameters

Adjust terrain generation through the UI controls:
- Height scale and amplitude
- Noise frequency and octaves
- Lacunarity and persistence
- Vegetation density
- Water level

## Usage as a Library

This package can be imported and used in other projects:

```javascript
import { Terrain, TerrainTile, Vegetation } from 'three-terrain'
```

## Performance

The terrain system uses several optimization techniques:
- Quadtree-based LOD for efficient mesh subdivision
- Frustum culling to skip off-screen tiles
- Instance rendering for vegetation
- Shader-based water animation

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.
