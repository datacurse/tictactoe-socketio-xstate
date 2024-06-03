export function ProjectDescription() {
  return (
    <div className="p-6">
      <h1 className="scroll-m-20 font-extrabold text-4xl tracking-tight lg:text-5xl">
        Tic Tac Toe Online
      </h1>
      <div className="leading-7 [&:not(:first-child)]:mt-6">
        This project was started as an attempt to understand how to befriend{" "}
        <a
          href="https://xstate.js.org/"
          className="font-medium text-primary underline underline-offset-4"
        >
          XState
        </a>{" "}
        and{" "}
        <a
          href="https://socket.io/"
          className="font-medium text-primary underline underline-offset-4"
        >
          Socket.io:
        </a>{" "}
        <blockquote className="mt-4 border-l-2 pl-6 italic">
          "XState provides a powerful and flexible way to manage application and
          workflow state by allowing developers to model logic as actors and
          state machines."
        </blockquote>
        <blockquote className="mt-4 border-l-2 pl-6 italic">
          "Socket.IO is a library that enables low-latency, bidirectional and
          event-based communication between a client and a server."
        </blockquote>
      </div>
      <div className="leading-7 [&:not(:first-child)]:mt-4">
        The implementation is most likely to be flawed, and I would very much
        appreciate any suggestions on how to improve it. You can contact me
        directly via discord:{" "}
        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono font-semibold text-sm">
          compulsive_freedom{" "}
        </code>
      </div>
      <div className="leading-7 [&:not(:first-child)]:mt-4">
        For In order for game to be able to handle multiple sessions between
        different users we need to somehow spawn xstate machines. Luckly, I've
        stumbled upon{" "}
        <a
          href="https://xstatebyexample.com/notification-center/"
          className="font-medium text-primary underline underline-offset-4"
        >
          Notification Center
        </a>{" "}
        example by{" "}
        <a
          href="https://github.com/Devessier"
          className="font-medium text-primary underline underline-offset-4"
        >
          Devessier
        </a>
        , that showed precisely how this could work: Notification center machine
        that spawns Notifications machines. This approach is used to spawn and
        close Game machines with Games center machine.
      </div>
      <h3 className="mt-8 scroll-m-20 font-semibold text-2xl tracking-tight">
        Building blocks
      </h3>
      <div className="leading-7 [&:not(:first-child)]:mt-4">
        This project utilises a number of libraries and other useful things:
      </div>
      <ul className="ml-6 list-disc [&>li]:mt-2">
        <li>
          <a
            href="https://stately.ai/docs/inspector"
            className="font-medium text-primary underline underline-offset-4"
          >
            Stately Inspector
          </a>{" "}
          Stately Inspector is a tool that allows you to inspect your
          application’s state visually. It primarily works with frontend
          applications using XState but can also work with backend code and code
          that uses any state management solution.
        </li>
        <li>
          <a
            href="https://tailwindcss.com/"
            className="font-medium text-primary underline underline-offset-4"
          >
            cbor-x:
          </a>{" "}
          Encode and parse data in the Concise Binary Object Representation
          (CBOR) data format. [It was initially used in this project for
          enabling passing around bigint with socket.io events. I'm unaware of
          drawbacks using this with a custom parser, but it basically allows you
          to pass any kind of objects with events without caring if they are
          JSON serializable or not. Wonder why it's not a default option.]
        </li>
        <li>
          <a
            href="https://pnpm.io/"
            className="font-medium text-primary underline underline-offset-4"
          >
            pnpm:
          </a>{" "}
          Fast, disk space efficient package manager
        </li>
        <li>
          <a
            href="https://create.t3.gg/"
            className="font-medium text-primary underline underline-offset-4"
          >
            create t3:
          </a>{" "}
          The best way to start a full-stack, typesafe Next.js app
        </li>
        <li>
          <a
            href="https://socket.io/"
            className="font-medium text-primary underline underline-offset-4"
          >
            Biome.js:
          </a>{" "}
          Format, lint, and more in a fraction of a second.
        </li>
        <li>
          <a
            href="https://ui.shadcn.com/"
            className="font-medium text-primary underline underline-offset-4"
          >
            shadcn-ui:
          </a>{" "}
          NOT a component library. It's a collectoin of re-usable components
          that you can copy and paste into your apps.
        </li>
      </ul>
    </div>
  );
}
