import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 500));

    expect(result.current).toBe("initial");
  });

  it("should not update value before delay elapses", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: "initial" } }
    );

    rerender({ value: "updated" });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe("initial");
  });

  it("should update value after delay elapses", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: "initial" } }
    );

    rerender({ value: "updated" });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe("updated");
  });

  it("should reset timer when value changes before delay", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: "initial" } }
    );

    rerender({ value: "first update" });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    rerender({ value: "second update" });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe("second update");
  });

  it("should use default delay of 500ms when not specified", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: "initial" } }
    );

    rerender({ value: "updated" });

    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("updated");
  });

  it("should work with numeric values", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 1 } }
    );

    rerender({ value: 42 });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(42);
  });
});
