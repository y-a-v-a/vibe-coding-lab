# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a creative coding laboratory containing a collection of interactive art projects inspired by geometric abstraction, suprematism, and algorithmic art. Each project in the `public/` directory is a self-contained web application focusing on artistic experimentation with minimal technical overhead.

## Common Development Commands

Since this is a static site collection, most development is done directly in the browser:

```bash
# Generate the main index.html with all projects
./generate-index.sh

# Serve locally (use any static file server)
python3 -m http.server 8000
# or
npx serve public
```

## Project Architecture

### Directory Structure
```
public/
├── index.html              # Auto-generated project index
├── project-name/
│   ├── README.md          # Project documentation
│   ├── index.html         # Self-contained application
│   └── [optional files]   # Additional assets
└── generate-index.sh      # Index generation script
```

### Technology Stack
- **HTML5** with Canvas API for graphics rendering
- **Vanilla JavaScript** (no frameworks) with heavy use of:
  - `requestAnimationFrame` for smooth animations
  - Mathematical noise functions for organic movement
  - Canvas 2D context for drawing operations
- **CSS3** with Grid/Flexbox for layout
- **p5.js** or **Processing.js** for some creative coding projects

### Common Patterns

**Interactive Controls:**
- Press 'H' to toggle hidden control panels
- Press 'R' to regenerate/restart animations
- Slider controls for real-time parameter adjustment
- Custom CSS toggle switches for boolean options

**Project Structure:**
- Single-file applications (HTML, CSS, JS in index.html)
- Responsive design with viewport meta tags
- Canvas-based rendering for graphics
- Hidden/toggleable UI controls

**Animation Patterns:**
- 60fps animations using `requestAnimationFrame`
- Progressive/generative content algorithms
- Auto-refresh timers for dynamic content
- Noise-based organic movement

## Development Workflow

### Adding New Projects
1. Create new directory in `public/`
2. Add `index.html` with self-contained application
3. Add `README.md` with project documentation including:
   - Artistic inspiration and historical context
   - Technical implementation details
   - Usage instructions and controls
   - Copyright and attribution
4. Run `./generate-index.sh` to update main index

### Project Guidelines
- Keep projects self-contained and dependency-free
- Use vanilla JavaScript when possible
- Include keyboard shortcuts ('H' for help, 'R' for regenerate)
- Add responsive design for mobile compatibility
- Document artistic inspirations and technical details in README.md

### Testing
- Visual testing in browser is primary method
- Test responsive design on different screen sizes
- Verify keyboard shortcuts work correctly
- Check that animations perform smoothly

## Artistic Context

Projects draw inspiration from:
- **Geometric abstraction** (Mondrian, Malevich influences)
- **Suprematism and Constructivism** movements
- **Algorithmic art** and generative design
- **Mathematical visualization** and pattern generation

Each project should maintain the meditative, contemplative quality typical of the collection while exploring interactive parameter manipulation and real-time generation.

## Memories

### Writing Attribution
- When writing attribution text to a README.md, use this format: Vincent Bruijn <vebruijn@gmail.com> • [y-a-v-a.org](https://www.y-a-v-a.org) • <year>current year or year given</year>