# Progressive Grid Pattern

A dynamic grid pattern visualization inspired by Polish artist Ryszard Winiarski.

## Overview

- **Square A**: A 6×6 grid (36 cells) that can be black or white
- **Square B**: A 6×6 arrangement of Square A (36 total copies)
- **Progressive Pattern**: Each Square A has incrementally more black cells (1st has 1, 2nd has 2, etc., up to 36th having all 36 black)

Total: 1,296 individual cells arranged in a structured pattern.

## Controls

### Randomize Positions
- Randomizes black cell placement within each Square A
- Maintains progressive count (Square 1 still has 1 black cell, Square 2 has 2, etc.)

### Reset to Sequential
- Returns to original pattern with black cells filling top-left to bottom-right
- Turns off Keep State mode

### Keep State Toggle
- **OFF (default)**: Each Square A is generated independently
- **ON**: Each Square A inherits the previous Square A's pattern and adds one more black cell

## Keep State Behavior

**Keep State OFF**: Normal progressive pattern
- Square 1: 1 black cell
- Square 2: 2 black cells  
- Square 3: 3 black cells
- etc.

**Keep State ON**: Cumulative inheritance pattern
- Square 1: 1 black cell (base pattern)
- Square 2: inherits Square 1's pattern + 1 more black cell
- Square 3: inherits Square 2's pattern + 1 more black cell
- etc.

This creates an organic evolution where patterns build cumulatively across squares, rather than being generated independently.

## Technical Details

- **HTML5/CSS3/Vanilla JavaScript** - No external dependencies
- **CSS Grid** for responsive layout
- **State management** within createSquareB function during iteration
- **Memory efficient** with local state handling

(c) Vincent Bruijn 2025