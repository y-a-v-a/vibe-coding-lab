# Chess Music: Game of the Century

An interactive audio-visual experience that transforms chess games into musical compositions using Web Audio API and visual animations.

## How it works

1. **Input chess notation** in standard algebraic notation (PGN format)
2. **Click "Play Music"** to hear the game as a musical composition
3. **Watch the chessboard** - squares light up and animate with each move
4. **Adjust volume** with the slider control

## Musical mapping

Each chess element is mapped to specific audio characteristics:

### Pieces → Waveforms

- **King (K)**: Sine wave (pure, regal tone)
- **Queen (Q)**: Square wave (powerful, rich harmonics)
- **Rook (R)**: Sawtooth wave (strong, cutting sound)
- **Bishop (B)**: Triangle wave (smooth, flowing tone)
- **Knight (N)**: Sine wave (elegant, pure sound)
- **Pawn (P)**: Square wave (simple, foundational)

### Board → Frequencies

- **Files (a-h)**: Mapped to musical notes (a=261Hz to h=523Hz)
- **Ranks (1-8)**: Modify pitch height and note duration
- **Captures (x)**: Add extra harmonics for richer sound
- **Castling (O-O)**: Special harmonic chord

## Features

- **Real-time audio synthesis** using Web Audio API
- **Visual feedback** - chessboard squares flicker and animate during play
- **Harmony generation** - creates chord progressions for complex moves
- **Volume control** - adjustable audio levels
- **Customizable notation** - edit the chess moves in the text area

## Default game

The application loads with Bobby Fischer's famous "Game of the Century" (1956) - his brilliant victory over Donald Byrne at age 13, featuring spectacular sacrifices and tactical brilliance.

## Usage

1. Open the HTML file in a modern web browser
2. Optionally modify the chess notation in the text area
3. Click "Play Music" to start the audio-visual performance
4. Adjust volume as needed

## Technical details

- Built with vanilla JavaScript and Web Audio API
- Uses oscillators to generate different waveforms
- Implements chess move parsing and frequency mapping
- Synchronized audio and visual animations
- Responsive design with dark theme

Perfect for chess enthusiasts, musicians, and anyone interested in the intersection of games and generative art!

Vincent Bruijn <vebruijn@gmail.com> – (c) 2025
