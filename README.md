# 🌌 Lorekeeper (Mythos Platform)

![Mythos Dashboard](https://img.shields.io/badge/Status-Active-success) ![React](https://img.shields.io/badge/React-18-blue) ![ThreeJS](https://img.shields.io/badge/Three.js-3D-black) ![Tailwind](https://img.shields.io/badge/TailwindCSS-v4-06B6D4) 

**Lorekeeper** (formerly Mythos) is a next-generation worldbuilding and narrative tracking dashboard. Built for authors, dungeon masters, and world designers, it provides a highly visual and structured way to track characters, locations, events, and their interconnected relationships.

## ✨ Features

- **🪐 3D Cosmos Map**: A fully interactive, native WebGL 3D network graph built with React Three Fiber. Visualize relationships between characters, factions, and places in real-time.
- **📚 Entity Management**: Dedicated tables and hubs for Characters, Places, Events, and Mythology.
- **🎨 Premium Dark-Glass UI**: State-of-the-art aesthetic using Tailwind CSS with deep ambient glows, frosted glassmorphism borders, and bespoke typography.
- **⚡ Blazing Fast**: Powered by Vite and globally managed by Zustand for zero-latency data reflection across the entire application.
- **🖥️ Responsive Workspace**: Features a toggleable, collapsible sidebar designed to maximize your screen real estate for the 3D map or large relationship tables.

## 🛠️ Technology Stack

- **Core**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- **3D Rendering**: [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/) + [Three.js](https://threejs.org/) + [Drei](https://github.com/pmndrs/drei)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom Glassmorphism Utility Layers
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Routing**: React Router v7
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/YusufUzak1/Lorekeeper.git
   cd Lorekeeper
   ```

2. Install the dependencies (Note: We strictly use React-Three-Fiber v8 and React 18):
   ```bash
   npm install --legacy-peer-deps
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173/`.

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── dashboard/       # Main dashboard layout
│   │   ├── cosmos/      # 3D Node Map components (R3F)
│   │   └── ui/          # Sidebar, Topbar, Entity Tables
│   ├── HeroSection.tsx  # Landing page entry point
│   ...
├── store/               # Zustand state stores
│   └── useUniverseStore.ts # Central nervous system for entity data
├── index.css            # Tailwind directives and custom variables
├── types.ts             # TypeScript interfaces for Entities and Connections
└── App.tsx              # React Router setup
```

## 🧠 Architecture Notes
- **Unified Global State:** The `useUniverseStore` dictates the absolute truth. If a character is added or their "faction" changes, the 3D Cosmos Map will instantly rerender the node's geometry and colors to reflect this change.
- **React 18 Compatibility:** To prevent React compilation errors, the 3D map relies on `react-three-fiber@8` rather than the React 19-bound `v9`.

---
*Created with ❤️ for storytellers and worldbuilders.*
