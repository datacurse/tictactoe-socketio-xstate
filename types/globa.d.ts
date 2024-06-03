// global.d.ts or any other .d.ts file included in your TypeScript compilation

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

// Extend the BigInt prototype with a toJSON method for proper JSON serialization
BigInt.prototype.toJSON = function () {
  // const int = Number.parseInt(this.toString());
  // return int ?? this.toString();
  return this.toString();
};

// Ensure this file is included in your tsconfig.json
export type {};
