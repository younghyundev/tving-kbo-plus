import { describe, it, expect } from "vitest";
import { getCurrentTime } from "../get";

describe("getCurrentTime", () => {
  it("YYYYMMDDHHmm 형식의 문자열을 반환한다", () => {
    const result = getCurrentTime();
    expect(result).toMatch(/^\d{12}$/);
  });
});
