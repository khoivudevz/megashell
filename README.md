# Megashell

Megashell is a modern, high-performance terminal emulator built with **Tauri v2**, **React**, and **internal Rust PTY management**. It is designed to look beautiful on Windows with transparency effects and provide a seamless developer experience with smart features.

![Megashell Screenshot](https://via.placeholder.com/800x450?text=Megashell+Preview)

## Features

- ** Modern UI**: Sleek, dark-themed interface with glassmorphism (acrylic blur) effects.
- ** Multi-Tab Support**: Create multiple persistent terminal sessions.
- ** Tab Management**:
  - **Reorder**: Drag and drop tabs to organize them.
  - **Rename**: Double-click any tab to rename it.
  - **Persist**: Tab order and names stay consistent.
- ** Resizable Layout**: Draggable sidebar for managing your workspace.
- ** Smart Autocomplete**:
  - Enhanced Tab completion that prioritizes local files in the current directory (prefixed with `.\`).
  - Falls back to global PATH commands when no local match is found.
- ** GPU Accelerated**: Powered by `xterm.js` with WebGL rendering for high performance.
- ** Shortcuts**: Global hotkeys for quick navigation and control.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Zustand, Framer Motion, @dnd-kit
- **Backend**: Rust, Tauri v2, `portable-pty`
- **Shell**: PowerShell (Windows)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [Rust](https://www.rust-lang.org/) (latest stable)
- [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (for Windows development)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/khoivudevz/megashell.git
   cd megashell
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Run the development server:
   ```bash
   bun run tauri dev
   ```

## Keyboard Shortcuts

| Shortcut             | Action                 |
| -------------------- | ---------------------- |
| `Ctrl + T`           | Open New Tab           |
| `Ctrl + W`           | Close Current Tab      |
| `Ctrl + Tab`         | Next Tab               |
| `Ctrl + Shift + Tab` | Previous Tab           |
| `Ctrl + Shift + O`   | Close Other Tabs       |
| `Ctrl + B`           | Toggle Sidebar         |
| `Ctrl + F`           | Find / Search          |
| `Ctrl + Shift + F`   | Toggle Fullscreen      |
| `Ctrl + Shift + /`   | Toggle Shortcuts Modal |

## Customization

### Fonts

Megashell uses **FiraCode Nerd Font** by default. Ensure you have the font installed or update `src/styles/global.css` to use your preferred monospace font.

### Themes

The UI is built with Tailwind CSS. You can customize colors and opacity in the source code.

## License

MIT
