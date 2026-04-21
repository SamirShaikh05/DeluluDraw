# 🎨 DeluluDraw -- Real-Time Multiplayer Drawing Game

## 🚀 Live Demo

👉 https://delulu-draw.vercel.app/

------------------------------------------------------------------------

##  Overview

DeluluDraw is a real-time multiplayer drawing and guessing game inspired
by skribbl.io. Players join rooms, draw words, and guess drawings in
real time using WebSockets.

------------------------------------------------------------------------

##  Core Features

-   Real-time multiplayer rooms (public & private)
-   Turn-based drawing system
-   Live canvas synchronization
-   Word selection with hints
-   Scoring & leaderboard system
-   Chat-based guessing system
-   Reconnection & mid-game joining

------------------------------------------------------------------------

##  Tech Stack

-   Frontend: React + Vite + Tailwind CSS
-   Backend: Node.js + Express
-   Real-time: Socket.IO (WebSockets)
-   Canvas: HTML5 Canvas API
-   Deployment: Vercel (Frontend), Render (Backend)

------------------------------------------------------------------------

##  Architecture

Client-Server architecture with WebSockets for real-time sync.

-   Server = Source of truth
-   Clients = Render state & send actions

------------------------------------------------------------------------

##  Flow Chart

## Mermaid

``` mermaid
graph TD;
User-->JoinRoom;
JoinRoom-->Lobby;
Lobby-->StartGame;
StartGame-->WordSelection;
WordSelection-->Drawing;
Drawing-->Guessing;
Guessing-->ScoreUpdate;
ScoreUpdate-->NextRound;
NextRound-->GameEnd;
GameEnd-->Lobby;
```

------------------------------------------------------------------------

##  Game Flow

1.  User joins or creates room
2.  Game starts when players join
3.  Drawer selects word
4.  Drawing begins
5.  Players guess via chat
6.  Points awarded
7.  Next round starts

------------------------------------------------------------------------

##  Setup Instructions

### Backend

``` bash
cd Backend
npm install
npm run dev
```

### Frontend

``` bash
cd Frontend
npm install
npm run dev
```

------------------------------------------------------------------------

##  Environment Variables

### Backend

PORT=4000\
CLIENT_URL=http://localhost:5173

### Frontend

VITE_SERVER_URL=http://localhost:4000

------------------------------------------------------------------------

## 🔌 WebSocket Events

### Room

-   create_room
-   join_room
-   player_joined
-   player_left

### Game

-   start_game
-   round_start
-   word_chosen
-   round_end
-   game_over

### Drawing

-   draw_start
-   draw_move
-   draw_end
-   canvas_clear

### Chat

-   guess
-   chat_message

------------------------------------------------------------------------

##  Key Concepts

-   Event-driven architecture
-   Real-time synchronization
-   Server-managed game state
-   Canvas rendering optimization

------------------------------------------------------------------------

##  Features vs Task Requirements

✔ Multiplayer rooms\
✔ Real-time drawing\
✔ Word system\
✔ Scoring system\
✔ WebSockets integration\
✔ Lobby & game flow

(Aligned with assignment requirements) fileciteturn3file1

------------------------------------------------------------------------

##  Deployment

-   Frontend: Vercel
-   Backend: Render

------------------------------------------------------------------------

## Future Improvements

-   Database integration
-   Authentication system
-   Mobile optimization
-   Replay feature

------------------------------------------------------------------------

##  Author

Samir Shaikh
