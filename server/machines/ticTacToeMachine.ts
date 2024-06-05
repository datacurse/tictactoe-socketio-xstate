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
  wins: number;
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
  lastMoveTime: Date | undefined;
}

function randomlyAssignSides(players: Player[]): Player[] {
  const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
  shuffledPlayers[0].playerSide = "x";
  shuffledPlayers[1].playerSide = "o";
  return shuffledPlayers;
}

export const ticTacToeMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QBUCWBjZBDTB7MABALI4AWqAdmAMQCusYATgHTq4VXoAuA2gAwBdRKAAOuWKi6p2wkAA9EAWgAsANgDszdQFY+e5QE4AzKoBMfbQA4ANCACeS08s06+lt6oNqAjJdMGAXwDbNEwcZHxiMkoaeiZmCFRYNg4wbn4hJBAxCSkZLIUERVN1b2YLK28jbXUDHXV1WwcipxddWoNvGst1Q20gkIxsPEISdHIqOgYWROT2Tl5vTNFxSWkKWULFIwNTZlVtTx0jHUtd5WUmpWU9ko0zo2VdDT51AZBQ4YjR6KpmAHUsGsKFACAAxXCMAgABQANlg7ExYNQAEZpXAAWzAzBE8MRjAyshya3yoC2TyMzFMuj4akMqncbm0VwQTkpej4VXUqlUFI0b2CHyG4UiYwm2MBwNBEKhcIRSNR6KxOLxTB4SyJqzyGwK10sqiphjO-mUfCMJ28LOqmgMtq82lM3lUtP870+Ip+4xiAKBUhB4MhMNVjGRhKyxO1myUvj4VJpB0eGk82iMLKdBnKTgMPWcOjqxjdwpGUS9fwAggB3X2UUFy-HEXAANxoGKbYDDK1y6yjRTUzBuzgZ2YMTIMqhZpj8zBp3j4BysJiMplUhbCxbF3sr1f9daYDeb1A72S13d1rJ20903idvP1Y4saYa-bt19qnO8Y-6gvd69+2K3UpBvKUJEG2h4auGJ6kvIiCOhmXScmafD+GahiXPYsGqGUZy2ihBiHEYqGrl8op-swADiWBYgQADyzaMNQuIIswWBQECFBHhGp5kog17KFolhOo8k7mLO44YUUlKGLalhqGcFjqHwtpBIKFC4BAcCyD+3wluKmpdtBWwpvxWbGl4ZoWiyijeP407crUOgaNSJjER6unepKfrSoGu4hvpJI6jxvbePxlhGCFDpnB+pqWhJN7MCc0kmOYzpdMorm-qW-5VoBvn7mA-mRmetk8q0hwNKYRg9N4jRxTyCW9LayVzpy2jpd+RY6RufyUdRdFMIV3EwQgdKZjSFzKCF6hOMyEl1P20l1NaJwNJYGVdWRvWEP1LB5f80FcYZiDaDZWiNeoOw2aUZxprJWg0hUtSHMoRjraRWUUVR230cwAAijBYBWg1HQgJ17Mh40XFNThWrSzC7LoY5OiabgqQEQA */
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
      addUser: assign({
        onlineUsers: ({ context, event }) => {
          assertEvent(event, "user.connect");
          return [...context.onlineUsers, event.userName];
        },
      }),
      removeUser: assign({
        onlineUsers: ({ context, event }) => {
          assertEvent(event, "user.disconnect");
          return context.onlineUsers.filter(
            (userName) => userName !== event.userName,
          );
        },
      }),
      notifyParentToKill: sendParent(({ context }) => ({
        type: "game.kill",
        gameId: context.gameId!,
      })),
      joinGame: assign({
        players: ({ context, event }) => {
          assertEvent(event, "become.player");
          const updatedPlayers = [...context.players];
          const undefinedPlayers = updatedPlayers.filter(
            (player) => player.playerName === undefined,
          );
          if (undefinedPlayers.length === 2) {
            const randomIndex = Math.floor(Math.random() * 2);
            updatedPlayers[randomIndex]!.playerName = event.playerName;
          } else if (undefinedPlayers.length === 1) {
            undefinedPlayers[0]!.playerName = event.playerName;
          }
          return updatedPlayers;
        },
      }),
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
        lastMoveTime: ({ context }) => new Date(),
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
      resetGame: assign({
        board: Array(9).fill(null),
        moves: 0,
        movingPlayer: "x",
        winner: undefined,
        lastMoveTime: undefined,
        players: ({ context }) =>
          randomlyAssignSides(
            context.players.map((player) => ({
              ...player,
              secondsLeft: 300,
            })),
          ),
      }),
      setWinner: assign({
        winner: ({ context }) => (context.movingPlayer === "x" ? "o" : "x"),
        players: ({ context }) => {
          const winnerPlayer = context.players.find(
            (player) =>
              player.playerSide === (context.movingPlayer === "x" ? "o" : "x"),
          );
          if (winnerPlayer) {
            winnerPlayer.wins += 1;
          }
          return context.players;
        },
      }),
    },

    guards: {
      "all players joined": ({ context }) => {
        const { players } = context;
        return players.every((player) => player.playerName !== undefined);
      },
      "user isn't player": ({ context, event }) => {
        assertEvent(event, "become.player");
        const { players } = context;
        return !players.some(
          (player) => player.playerName === event.playerName,
        );
      },
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
      "no users connected": ({ context }) => {
        return context.onlineUsers.length === 0;
      },
      "last user is leaving": ({ context }) => {
        return context.onlineUsers.length === 1;
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
          wins: 0,
        },
        {
          playerSide: "o",
          playerName: undefined,
          secondsLeft: 300,
          wins: 0,
        },
      ],
      onlineUsers: [],
      gameStartTime: undefined,
      lastMoveTime: undefined,
    }),

    on: {
      "user.connect": {
        actions: "addUser",
      },
      "user.disconnect": [
        {
          actions: {
            type: "notifyParentToKill",
          },
          guard: {
            type: "no users connected",
          },
        },
        {
          actions: {
            type: "removeUser",
          },
        },
      ],
    },

    states: {
      "Waiting For Players": {
        on: {
          "become.player": [
            {
              actions: {
                type: "joinGame",
              },
              guard: {
                type: "user isn't player",
              },
            },
            {},
          ],
        },
        always: {
          target: "Awaiting Player Move",
          guard: {
            type: "all players joined",
          },
        },
      },

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
        on: {
          "play.again": {
            target: "Awaiting Player Move",
            actions: "resetGame",
          },
        },
      },
    },
  });
