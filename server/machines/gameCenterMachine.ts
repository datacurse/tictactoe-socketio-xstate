import {
  type ActorRefFrom,
  assertEvent,
  assign,
  setup,
  stopChild,
} from "xstate";
import { ticTacToeMachine } from "./ticTacToeMachine";

export const gameCenterMachine = setup({
  types: {
    context: {} as {
      gameRefs: Array<ActorRefFrom<typeof ticTacToeMachine>>;
    },
    events: {} as
      | {
          type: "game.spawn";
          gameId: string;
        }
      | { type: "game.kill"; gameId: string },
  },
  actions: {
    "Assign game configuration into context": assign({
      gameRefs: ({ context, event, spawn }) => {
        console.log(event.gameId);
        assertEvent(event, "game.spawn");

        return [
          spawn("ticTacToeMachine", {
            systemId: event.gameId,
            id: event.gameId,
            input: {
              gameId: event.gameId,
            },
          }),
          ...context.gameRefs,
        ];
      },
    }),
    "Stop closed game": stopChild(({ context, event }) => {
      assertEvent(event, "game.kill");

      return context.gameRefs.find((ref) => ref.id === event.gameId)!;
    }),
    "Remove closed game from context": assign({
      gameRefs: ({ context, event }) => {
        assertEvent(event, "game.kill");

        return context.gameRefs.filter((ref) => ref.id !== event.gameId);
      },
    }),
  },
  actors: {
    ticTacToeMachine,
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QHECGBbMACAwmAdgC5gBOAxFBmAHSwAOqA7vgNoAMAuoqHQPawBLQgN75uIAB6IAtAGYALAA5qAdnkBOTSoCsigEwA2AIyHtAGhABPRCaPVFm9dr3yDslS7Z6Avt4tpMXAJickpMagBrAQAbaPYuJBA+QWFRcSkEeRV7bTY2RXkNbQMHPVkLawQjI2y9NSd5NhNZPXUVFV8-EHxeCDhxAOw8IlJxZKERMUSM6QN1ag11RR1W2VkjZ3KrRHbqR01ZOdk2QvkfTqA */
  id: "Game Center",
  systemId: "Game Center",
  context: {
    gameRefs: [],
  },
  on: {
    "game.spawn": {
      actions: "Assign game configuration into context",
    },
    "game.kill": {
      actions: ["Stop closed game", "Remove closed game from context"],
    },
  },
});
