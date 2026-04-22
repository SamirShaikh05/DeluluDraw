# 🎨 DeluluDraw -- Real-Time Multiplayer Drawing Game

**Author:** Samir Jamil Shaikh\
**Project Type:** Full Stack / Real-Time Systems\
**Core Concepts:** WebSockets, Event-Driven Architecture, State
Synchronization, Multiplayer Systems\
**Live Demo:** https://delulu-draw.vercel.app/

------------------------------------------------------------------------

# Project Overview

DeluluDraw is a real-time multiplayer drawing and guessing game where
players join rooms, draw words, and guess them in real time. The system
ensures synchronized gameplay across multiple users using WebSockets.

The backend acts as the **single source of truth**, managing all game
logic, while the frontend renders real-time updates seamlessly.

------------------------------------------------------------------------

# Objective

The objective of this project is to build a **real-time distributed
system** that:

-   Synchronizes multiple clients instantly
-   Maintains consistent game state across users
-   Handles player interactions (drawing, guessing, chat)
-   Ensures scalability and performance
-   Supports reconnection and mid-game joining

------------------------------------------------------------------------

# Core Features

## Multiplayer System

-   Public matchmaking (auto-join rooms)
-   Private rooms with shareable links
-   Dynamic player join/leave handling

## Game Engine

-   Turn-based drawing system
-   Word selection with multiple options
-   Timer-based rounds and transitions
-   Scoring and leaderboard system

## Real-Time Sync

-   WebSocket-based communication (Socket.IO)
-   Event-driven updates for all actions
-   Server-side state management

## Drawing System

-   HTML5 Canvas-based drawing
-   Real-time stroke synchronization
-   Brush colors and sizes

## Chat & Guessing

-   Unified chat system for guesses and messages
-   Automatic correct guess detection
-   System notifications for events

## Advanced Features

-   Mid-game joining
-   Reconnection handling
-   Persistent session tracking
-   Optimized network communication

------------------------------------------------------------------------

# High-Level Architecture

The system follows a **client-server model**:

-   **Frontend (React)** → UI + Canvas + Socket Client
-   **Backend (Node.js)** → Game Logic + Room Management
-   **WebSockets** → Real-time communication layer

------------------------------------------------------------------------

# Flow Chart

## Mermaid

``` mermaid
graph TD;

A[User Opens App] --> B[Enter Name];
B --> C{Join Public or Private Room};

C -->|Public| D[Matchmaking System];
C -->|Private| E[Join via Room Code];

D --> F[Waiting for Players];
E --> F;

F --> G{Players >= 2?};
G -->|No| F;
G -->|Yes| H[Game Starts];

H --> I[Word Selection Phase];
I --> J[Drawing Phase];

J --> K[Players Send Guesses];
K --> L{Correct Guess?};

L -->|Yes| M[Update Scores];
L -->|No| K;

M --> N[Round Ends];
N --> O{More Rounds?};

O -->|Yes| I;
O -->|No| P[Game Over];

P --> Q[Show Leaderboard];
Q --> F;
```

------------------------------------------------------------------------

#  WebSocket Architecture

## Room Events

-   create_room → Create new room
-   join_room → Join existing room
-   player_joined / player_left → Sync players

## Game Events

-   start_game → Start match
-   round_start → Begin round
-   word_chosen → Drawer selects word
-   round_end → End round
-   game_over → End game

## Drawing Events

-   draw_start → Begin stroke
-   draw_move → Continue stroke
-   draw_end → End stroke
-   canvas_clear → Clear canvas

## Chat Events

-   guess → Send guess
-   chat_message → Broadcast message

------------------------------------------------------------------------

# System Design Concepts

## Server as Source of Truth

All game logic is executed on backend to prevent cheating and ensure
consistency.

## Event-Driven Architecture

All actions (draw, guess, join) trigger events that update all clients.

## State Synchronization

Backend maintains state and broadcasts updates to all connected clients.

## Optimized Communication

Only minimal drawing data (coordinates) is transmitted, not full canvas.

------------------------------------------------------------------------

# Project Structure

    DeluluDraw/
    ├── Backend/
    │   ├── src/
    │   │   ├── core/
    │   │   ├── socket/
    │   │   ├── utils/
    │   │   └── index.js
    │   └── package.json
    │
    ├── Frontend/
    │   ├── src/
    │   │   ├── components/
    │   │   ├── pages/
    │   │   ├── hooks/
    │   │   └── App.jsx
    │   └── package.json
    │
    └── README.md

------------------------------------------------------------------------

# Tech Stack

  Layer        Technology
  ------------ ---------------------------
  Frontend     React, Vite, Tailwind CSS
  Backend      Node.js, Express
  Real-Time    Socket.IO (WebSockets)
  Canvas       HTML5 Canvas API
  Deployment   Vercel, Render

------------------------------------------------------------------------

# Setup Instructions

## Backend

``` bash
cd Backend
npm install
npm run dev
```

## Frontend

``` bash
cd Frontend
npm install
npm run dev
```

------------------------------------------------------------------------

# Environment Variables

## Backend

PORT=4000\
CLIENT_URL=http://localhost:5173

## Frontend

VITE_SERVER_URL=http://localhost:4000

------------------------------------------------------------------------

# Deployment

-   **Frontend:** Vercel
-   **Backend:** Render

Live URL: https://delulu-draw.vercel.app/

------------------------------------------------------------------------

# Key Learnings

-   Building real-time systems using WebSockets
-   Managing distributed state across clients
-   Designing scalable backend architectures
-   Optimizing real-time data transfer
-   Handling reconnection and edge cases

------------------------------------------------------------------------

# Future Improvements

-   AI-based drawing hints
-   Mobile responsiveness improvements
-   Replay system
-   Database integration for persistence
-   Authentication system

------------------------------------------------------------------------

# Conclusion

DeluluDraw demonstrates a complete real-time multiplayer system with
scalable architecture, efficient communication, and robust game logic,
showcasing strong full-stack and system design skills.
