import { type EventObject, and, assign, sendParent, setup } from "xstate";

function assertEvent<TEvent extends EventObject, Type extends TEvent["type"]>(
  ev: TEvent,
  type: Type,
): asserts ev is Extract<TEvent, { type: Type }> {
  if (ev.type !== type) {
    throw new Error("Unexpected event type.");
  }
}

type PlayerSide = "x" | "o";

interface Player {
  playerSide: PlayerSide;
  playerName: string | undefined;
  secondsLeft: number;
}

interface TicTacToeContext {
  gameId: string | undefined;
  board: (PlayerSide | null)[];
  moves: number;
  movingPlayer: PlayerSide;
  winner: PlayerSide | undefined;
  players: Player[];
  onlineUsers: string[];
  gameStartTime: Date | undefined;
  lastMoveTime: Date | undefined; // Added field for the last move time
}

export const ticTacToeMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QBUCWBjZBDTB7MABALI4AWqAdmAMQCusYATgHTq4VXoAuA2gAwBdRKAAOuWKi6p2wkAA9EAWgBMAFgCszAGwBOZQA5lAZh17la9QBoQATyUBGffeYB2fVpefVRowcf6AXwDrNEwcZHxiMkowZgBBAHcsSUooAgAFABssGyZiXAA3GgBbQrB+ISQQMQkpGSqFBEVVLWZVNRctfR1uvn11HS1rOwQDZWZ1Pj57Pi11dX0jLV8tIJCMbDxCEnRyKniklIo0rJy8ojLqCtkalPrQRuU3VyWPdRcdI1VvnWHEe10zD4ah6jj46kcAOUaxAoU2EW20X2iWSUmOGWyuUY+SKV3slVE4juFFkj3sOmY9kmMyMwJ0fC+OlUf1GWmc3VMynpOnUywZqiCwRAFFwEDgsjh4UiOz2YBuRLqJIaSmUWj4zCWLl5Ji8fFU+hcLMURmcWhBi30epcU30qhcMMlWyiuxizAA6qjUgQAGK4bGnLHwKq3RWklX2caa7U6XWqX62f5aVpGFxxz5m2bTdQCoWOhHO2UHT3ogPnMry2rSJUPRBc7Rmu28zzGA32Q0JhAA5Op0xLZSZqk59ZhJ0y10AcSwxUIAHkiowK8Swwh9apmHpvoYXP3dHqjCz5totcDJuDTIt7bmNlLES79pPpwQ50xmKXsW77tUFVXl+ovuvLTmPoejccEWXsdp12PHwnCTGNVivEd8zHe8p1nedmAAEUYLAEkXUNlQQP9xg3fUnh3elmQ7ZQBmYEF6T1GimxzIIgA */
  setup({
    types: {
      input: {} as {
        gameId: string;
      },
      context: {} as TicTacToeContext,
      events: {} as
        | { type: "move"; position: number; playerName: string }
        | { type: "play.again" }
        | { type: "become.player"; playerName: string }
        | { type: "user.connect"; userName: string }
        | { type: "user.disconnect"; userName: string },
    },

    actions: {
      updateBoard: assign({
        board: ({ context, event }) => {
          assertEvent(event, "move");
          const updatedBoard = [...context.board];
          updatedBoard[event.position] = context.movingPlayer;
          return updatedBoard;
        },
        moves: ({ context }) => context.moves + 1,
        movingPlayer: ({ context }) =>
          context.movingPlayer === "x" ? "o" : "x",
        gameStartTime: ({ context }) =>
          context.moves + 1 === 2 ? new Date() : context.gameStartTime,
        lastMoveTime: ({ context }) => new Date(), // Set the last move time to the current time
        players: ({ context, event }) => {
          if (context.moves < 2) return context.players;
          assertEvent(event, "move");
          const updatedPlayers = [...context.players];
          const now = new Date();
          const lastMoveDuration = context.lastMoveTime
            ? (now.getTime() - new Date(context.lastMoveTime).getTime()) / 1000
            : 0;
          const movingPlayer = updatedPlayers.find(
            (player) => player.playerSide === context.movingPlayer,
          );
          if (movingPlayer) {
            movingPlayer.secondsLeft = Math.max(
              movingPlayer.secondsLeft - lastMoveDuration,
              0,
            );
          }
          return updatedPlayers;
        },
      }),
      setWinner: assign({
        winner: ({ context }) => (context.movingPlayer === "x" ? "o" : "x"),
      }),
    },

    guards: {
      "check win": ({ context }) => {
        const { board } = context;
        const winningLines = [
          [0, 1, 2],
          [3, 4, 5],
          [6, 7, 8],
          [0, 3, 6],
          [1, 4, 7],
          [2, 5, 8],
          [0, 4, 8],
          [2, 4, 6],
        ];

        for (const line of winningLines) {
          const xWon = line.every((index) => board[index] === "x");
          if (xWon) return true;

          const oWon = line.every((index) => board[index] === "o");
          if (oWon) return true;
        }

        return false;
      },
      "check draw": ({ context }) => {
        return context.moves === 9;
      },
      "move is valid": ({ context, event }) => {
        if (event.type !== "move") {
          return false;
        }

        return context.board[event.position] === null;
      },
      "player is moving": ({ context, event }) => {
        assertEvent(event, "move");
        const player = context.players.find(
          (player) => player.playerName === event.playerName,
        );
        console.log(context.movingPlayer, event);
        if (!player) return false;
        return player.playerSide === context.movingPlayer;
      },
      "2 initial moves done": ({ context }) => {
        return context.moves === 2;
      },
    },
  }).createMachine({
    id: "TicTacToe Machine",
    initial: "Waiting For Players",

    context: ({ input }) => ({
      gameId: input.gameId,
      board: Array(9).fill(null),
      moves: 0,
      movingPlayer: "x",
      winner: undefined,
      players: [
        {
          playerSide: "x",
          playerName: undefined,
          secondsLeft: 300,
        },
        {
          playerSide: "o",
          playerName: undefined,
          secondsLeft: 300,
        },
      ],
      onlineUsers: [],
      gameStartTime: undefined,
      lastMoveTime: undefined, // Initialize lastMoveTime as undefined
    }),

    on: {
      "user.connect": {
        actions: "addUser",
      },
    },

    states: {
      "Waiting For Players": {},

      "Awaiting Player Move": {
        always: [
          { target: "Game Over.Player Won", guard: "check win" },
          { target: "Game Over.Draw", guard: "check draw" },
        ],
        on: {
          move: {
            actions: "updateBoard",
            guard: and(["move is valid", "player is moving"]),
          },
        },
      },

      "Game Over": {
        initial: "Player Won",

        states: {
          "Player Won": {
            tags: "winner",
            entry: "setWinner",
          },
          Draw: {
            tags: "draw",
          },
        },
      },
    },
  });
