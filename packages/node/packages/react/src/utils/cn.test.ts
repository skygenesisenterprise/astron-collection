import { describe, expect, it } from "vite-plus/test";

import { cn } from "./cn";

describe("cn", () => {
  it.each([
    [["p-2", "p-4"], "p-4"],
    [["px-2 py-1", "px-4"], "py-1 px-4"],
    [["text-zenth-default", "text-zenth-subtle"], "text-zenth-subtle"],
    [["bg-zenth-base", "bg-zenth-elevated"], "bg-zenth-elevated"],
    [["border-zenth-line", "border-zenth-strong"], "border-zenth-strong"],
    [
      ["hover:bg-zenth-base", "hover:bg-zenth-elevated"],
      "hover:bg-zenth-elevated",
    ],
    [["sm:p-2", "sm:p-4", "md:p-6"], "sm:p-4 md:p-6"],
    [
      ["data-[state=open]:bg-zenth-base", "data-[state=open]:bg-zenth-elevated"],
      "data-[state=open]:bg-zenth-elevated",
    ],
    [["rounded-[10px]", "rounded-[12px]"], "rounded-[12px]"],
    [["!p-2", "p-4"], "!p-2 p-4"],
    [["p-2", "!p-4"], "p-2 !p-4"],
    [
      ["base", false, null, undefined, { active: true, disabled: false }],
      "base active",
    ],
    [[["flex", ["gap-2", "gap-4"]]], "flex gap-4"],
  ])(
    "merges classes without changing expected output for case %#",
    (inputs, expected) => {
      expect(cn(...inputs)).toBe(expected);
    },
  );
});
