import express from "express";
import path from "path";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import { PARAGRAPHS } from "./src/data/paragraphs.js";
import { Paragraph, VehicleType } from "./src/types.js";

interface Player {
  id: string;
  name: string;
  vehicle: VehicleType;
  progress: number;
  wpm: number;
  isFinished: boolean;
  finishTime?: number;
  accuracy?: number;
  ready: boolean;
  isHost: boolean;
}

interface Room {
  id: string;
  type: "public" | "custom";
  lang: "mn" | "en";
  difficulty: "all" | "easy" | "medium" | "hard";
  status: "lobby" | "countdown" | "playing" | "finished";
  players: Map<string, Player>;
  paragraph: Paragraph;
  countdown: number;
  lobbyCountdown: number;
  lobbyCountdownInterval: NodeJS.Timeout | null;
  raceCountdownInterval: NodeJS.Timeout | null;
  raceStartTime: number | null;
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  // Track active multiplayer rooms
  const rooms = new Map<string, Room>();

  // Helper: Select a random paragraph
  function getRandomParagraph(lang: "mn" | "en", difficulty: "all" | "easy" | "medium" | "hard"): Paragraph {
    let filtered = PARAGRAPHS.filter((p) => p.lang === lang);
    if (difficulty !== "all") {
      filtered = filtered.filter((p) => p.difficulty === difficulty);
    }
    if (filtered.length === 0) {
      // Fallback if no matching
      filtered = PARAGRAPHS.filter((p) => p.lang === lang);
    }
    const randomIndex = Math.floor(Math.random() * filtered.length);
    return filtered[randomIndex] || PARAGRAPHS[0];
  }

  // Helper: Generate custom room ID
  function generateRoomId(): string {
    let code = "";
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `ROOM-${code}`;
  }

  // Setup WebSocket Server attached to the same HTTP server
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    const { pathname } = new URL(request.url || "", `http://${request.headers.host}`);
    if (pathname === "/ws") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  // Keep track of which room and player ID each WebSocket connection corresponds to
  const clientInfo = new Map<WebSocket, { roomId: string; playerId: string }>();

  function broadcastToRoom(roomId: string, message: any) {
    const room = rooms.get(roomId);
    if (!room) return;
    const msgStr = JSON.stringify(message);
    
    for (const [ws, info] of clientInfo.entries()) {
      if (info.roomId === roomId && ws.readyState === WebSocket.OPEN) {
        ws.send(msgStr);
      }
    }
  }

  function sendToClient(ws: WebSocket, message: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  function leaveRoom(ws: WebSocket) {
    const info = clientInfo.get(ws);
    if (!info) return;

    const { roomId, playerId } = info;
    const room = rooms.get(roomId);
    clientInfo.delete(ws);

    if (room) {
      const leavingPlayer = room.players.get(playerId);
      room.players.delete(playerId);
      console.log(`Player ${playerId} left room ${roomId}`);

      // Broadcast player left
      broadcastToRoom(roomId, {
        type: "player-left",
        playerId,
        playerName: leavingPlayer?.name || "Someone",
      });

      // If room is empty, delete it and clear intervals
      if (room.players.size === 0) {
        if (room.lobbyCountdownInterval) clearInterval(room.lobbyCountdownInterval);
        if (room.raceCountdownInterval) clearInterval(room.raceCountdownInterval);
        rooms.delete(roomId);
        console.log(`Room ${roomId} deleted because it became empty.`);
      } else {
        // If the host left, assign a new host
        if (leavingPlayer?.isHost) {
          const nextPlayerId = Array.from(room.players.keys())[0];
          const nextPlayer = room.players.get(nextPlayerId);
          if (nextPlayer) {
            nextPlayer.isHost = true;
            console.log(`Player ${nextPlayer.name} is now the host of room ${roomId}`);
          }
        }

        // Check if lobby countdown needs to be stopped (if public room has < 2 players)
        if (room.type === "public" && room.status === "lobby" && room.players.size < 2) {
          if (room.lobbyCountdownInterval) {
            clearInterval(room.lobbyCountdownInterval);
            room.lobbyCountdownInterval = null;
          }
          room.lobbyCountdown = 10;
          broadcastToRoom(roomId, {
            type: "lobby-countdown-cancelled",
            message: "Waiting for more players to join...",
          });
        }

        // Send updated player list
        broadcastToRoom(roomId, {
          type: "room-players-update",
          players: Array.from(room.players.values()),
        });
      }
    }
  }

  function startRaceCountdown(room: Room) {
    if (room.lobbyCountdownInterval) {
      clearInterval(room.lobbyCountdownInterval);
      room.lobbyCountdownInterval = null;
    }

    room.status = "countdown";
    room.countdown = 5;

    broadcastToRoom(room.id, {
      type: "room-status-update",
      status: "countdown",
      countdown: room.countdown,
    });

    room.raceCountdownInterval = setInterval(() => {
      room.countdown--;
      
      broadcastToRoom(room.id, {
        type: "countdown-tick",
        countdown: room.countdown,
      });

      if (room.countdown <= 0) {
        if (room.raceCountdownInterval) {
          clearInterval(room.raceCountdownInterval);
          room.raceCountdownInterval = null;
        }
        room.status = "playing";
        room.raceStartTime = Date.now();
        
        broadcastToRoom(room.id, {
          type: "race-start",
        });
      }
    }, 1000);
  }

  wss.on("connection", (ws: WebSocket) => {
    console.log("New WebSocket connection established");

    ws.on("message", (rawMessage: string) => {
      try {
        const data = JSON.parse(rawMessage);
        
        switch (data.type) {
          case "join": {
            const { name, vehicle, roomType, roomId, lang, difficulty } = data;
            const chosenLang = lang || "mn";
            const chosenDifficulty = difficulty || "all";
            const playerId = `player-${Math.floor(1000 + Math.random() * 9000)}`;

            let room: Room | undefined;

            if (roomType === "custom" && roomId) {
              // Join custom room by ID
              const cleanId = roomId.trim().toUpperCase();
              room = rooms.get(cleanId);
              if (!room) {
                sendToClient(ws, {
                  type: "error",
                  message: chosenLang === "en" ? "Room not found!" : "Өрөө олдсонгүй!",
                });
                return;
              }
              if (room.status !== "lobby") {
                sendToClient(ws, {
                  type: "error",
                  message: chosenLang === "en" ? "Race already in progress!" : "Уралдаан аль хэдийн эхэлсэн байна!",
                });
                return;
              }
            } else if (roomType === "custom") {
              // Create new custom room
              const newId = generateRoomId();
              room = {
                id: newId,
                type: "custom",
                lang: chosenLang,
                difficulty: chosenDifficulty,
                status: "lobby",
                players: new Map(),
                paragraph: getRandomParagraph(chosenLang, chosenDifficulty),
                countdown: 5,
                lobbyCountdown: 10,
                lobbyCountdownInterval: null,
                raceCountdownInterval: null,
                raceStartTime: null,
              };
              rooms.set(newId, room);
              console.log(`Created custom room ${newId}`);
            } else {
              // Matchmaking for public quick race
              // Try to find a public room in lobby with the same language and difficulty
              for (const r of rooms.values()) {
                if (r.type === "public" && r.status === "lobby" && r.lang === chosenLang && r.difficulty === chosenDifficulty) {
                  room = r;
                  break;
                }
              }

              if (!room) {
                // Create a new public room
                const newId = `PUBLIC-${chosenLang.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
                room = {
                  id: newId,
                  type: "public",
                  lang: chosenLang,
                  difficulty: chosenDifficulty,
                  status: "lobby",
                  players: new Map(),
                  paragraph: getRandomParagraph(chosenLang, chosenDifficulty),
                  countdown: 5,
                  lobbyCountdown: 10,
                  lobbyCountdownInterval: null,
                  raceCountdownInterval: null,
                  raceStartTime: null,
                };
                rooms.set(newId, room);
                console.log(`Created public matchmaking room ${newId}`);
              }
            }

            // Create player object
            const isHost = room.players.size === 0;
            const newPlayer: Player = {
              id: playerId,
              name: name || `Racer-${playerId.split("-")[1]}`,
              vehicle: vehicle || "car",
              progress: 0,
              wpm: 0,
              isFinished: false,
              ready: room.type === "public" ? true : false, // Auto-ready in public rooms
              isHost,
            };

            room.players.set(playerId, newPlayer);
            clientInfo.set(ws, { roomId: room.id, playerId });

            console.log(`Player ${newPlayer.name} joined room ${room.id}`);

            // Acknowledge join success
            sendToClient(ws, {
              type: "joined",
              roomId: room.id,
              playerId,
              isHost,
              paragraph: room.paragraph,
              status: room.status,
              players: Array.from(room.players.values()),
            });

            // Notify others
            broadcastToRoom(room.id, {
              type: "player-joined",
              player: newPlayer,
            });

            // Sync players
            broadcastToRoom(room.id, {
              type: "room-players-update",
              players: Array.from(room.players.values()),
            });

            // If public room has >= 2 players and countdown hasn't started, start it
            if (room.type === "public" && room.players.size >= 2 && !room.lobbyCountdownInterval && room.status === "lobby") {
              room.lobbyCountdown = 10;
              broadcastToRoom(room.id, {
                type: "lobby-countdown-tick",
                seconds: room.lobbyCountdown,
              });

              room.lobbyCountdownInterval = setInterval(() => {
                room.lobbyCountdown--;
                broadcastToRoom(room.id, {
                  type: "lobby-countdown-tick",
                  seconds: room.lobbyCountdown,
                });

                if (room.lobbyCountdown <= 0) {
                  if (room.lobbyCountdownInterval) {
                    clearInterval(room.lobbyCountdownInterval);
                    room.lobbyCountdownInterval = null;
                  }
                  startRaceCountdown(room!);
                }
              }, 1000);
            }
            break;
          }

          case "update-config": {
            const info = clientInfo.get(ws);
            if (!info) return;
            const room = rooms.get(info.roomId);
            if (!room || room.status !== "lobby") return;

            // Only host can change configuration
            const player = room.players.get(info.playerId);
            if (!player || !player.isHost) return;

            const { lang, difficulty } = data;
            if (lang) room.lang = lang;
            if (difficulty) room.difficulty = difficulty;
            
            // Generate a new paragraph matching options
            room.paragraph = getRandomParagraph(room.lang, room.difficulty);

            broadcastToRoom(room.id, {
              type: "room-config-updated",
              lang: room.lang,
              difficulty: room.difficulty,
              paragraph: room.paragraph,
            });
            break;
          }

          case "toggle-ready": {
            const info = clientInfo.get(ws);
            if (!info) return;
            const room = rooms.get(info.roomId);
            if (!room || room.status !== "lobby") return;

            const player = room.players.get(info.playerId);
            if (!player) return;

            player.ready = !player.ready;

            broadcastToRoom(room.id, {
              type: "room-players-update",
              players: Array.from(room.players.values()),
            });

            // In custom rooms, if everyone is ready and there are at least 2 players, the host can see a prompt,
            // or we can auto-start. Let's let the host start manually anytime, but show ready states beautifully.
            break;
          }

          case "start-race": {
            const info = clientInfo.get(ws);
            if (!info) return;
            const room = rooms.get(info.roomId);
            if (!room || room.status !== "lobby") return;

            const player = room.players.get(info.playerId);
            if (!player || !player.isHost) return;

            // Force countdown to start immediately
            startRaceCountdown(room);
            break;
          }

          case "progress": {
            const info = clientInfo.get(ws);
            if (!info) return;
            const room = rooms.get(info.roomId);
            if (!room || room.status !== "playing") return;

            const player = room.players.get(info.playerId);
            if (!player || player.isFinished) return;

            const { progress, wpm } = data;
            player.progress = Math.min(100, Math.max(0, progress));
            player.wpm = wpm;

            broadcastToRoom(room.id, {
              type: "player-progress",
              playerId: player.id,
              progress: player.progress,
              wpm: player.wpm,
            });
            break;
          }

          case "finished": {
            const info = clientInfo.get(ws);
            if (!info) return;
            const room = rooms.get(info.roomId);
            if (!room || room.status !== "playing") return;

            const player = room.players.get(info.playerId);
            if (!player || player.isFinished) return;

            const { wpm, accuracy } = data;
            player.isFinished = true;
            player.progress = 100;
            player.wpm = wpm;
            player.accuracy = accuracy;
            
            if (room.raceStartTime) {
              player.finishTime = (Date.now() - room.raceStartTime) / 1000;
            } else {
              player.finishTime = 0;
            }

            broadcastToRoom(room.id, {
              type: "player-finished",
              playerId: player.id,
              wpm: player.wpm,
              accuracy: player.accuracy,
              finishTime: player.finishTime,
            });

            // Check if all players in the room are finished
            const allFinished = Array.from(room.players.values()).every((p) => p.isFinished);
            if (allFinished) {
              room.status = "finished";
              broadcastToRoom(room.id, {
                type: "room-status-update",
                status: "finished",
                players: Array.from(room.players.values()),
              });
            }
            break;
          }

          case "chat": {
            const info = clientInfo.get(ws);
            if (!info) return;
            const room = rooms.get(info.roomId);
            if (!room) return;

            const player = room.players.get(info.playerId);
            if (!player) return;

            broadcastToRoom(room.id, {
              type: "chat-msg",
              senderId: player.id,
              senderName: player.name,
              message: data.message,
              timestamp: Date.now(),
            });
            break;
          }

          case "leave": {
            leaveRoom(ws);
            break;
          }
        }
      } catch (err) {
        console.error("Error handling WebSocket message:", err);
      }
    });

    ws.on("close", () => {
      console.log("WebSocket connection closed");
      leaveRoom(ws);
    });

    ws.on("error", (err) => {
      console.error("WebSocket connection error:", err);
      leaveRoom(ws);
    });
  });

  // Serve static assets in production, use Vite dev server in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
