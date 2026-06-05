import { describe, it, expect } from "vitest";
import { validateReview, validateSignup, validateLogin } from "../utils/validate";

/* ── validateReview ─────────────────────────────────────────────────────── */
describe("validateReview", () => {
  it("passes with a valid rating and text", () => {
    const result = validateReview({ rating: 4, text: "Great building overall!" });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("fails when rating is 0", () => {
    const result = validateReview({ rating: 0, text: "Decent place to live." });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Rating must be between 1 and 5.");
  });

  it("fails when rating exceeds 5", () => {
    const result = validateReview({ rating: 6, text: "Amazing apartment!" });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Rating must be between 1 and 5.");
  });

  it("fails when text is too short", () => {
    const result = validateReview({ rating: 3, text: "Ok" });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Review must be at least 10 characters.");
  });

  it("fails when text is missing", () => {
    const result = validateReview({ rating: 5, text: "" });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Review text is required.");
  });

  it("fails when text exceeds 2000 characters", () => {
    const longText = "a".repeat(2001);
    const result = validateReview({ rating: 3, text: longText });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Review must be at most 2000 characters.");
  });

  it("accumulates multiple errors", () => {
    const result = validateReview({ rating: 0, text: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });
});

/* ── validateSignup ─────────────────────────────────────────────────────── */
describe("validateSignup", () => {
  it("passes with valid credentials", () => {
    const result = validateSignup({
      name: "Alex Mitchell",
      email: "alex@dal.ca",
      password: "securePass1",
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("fails with a too-short name", () => {
    const result = validateSignup({ name: "A", email: "a@b.com", password: "password1" });
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  it("fails with an invalid email", () => {
    const result = validateSignup({ name: "Alex", email: "not-an-email", password: "password1" });
    expect(result.valid).toBe(false);
    expect(result.errors.email).toBeDefined();
  });

  it("fails with a short password", () => {
    const result = validateSignup({ name: "Alex", email: "a@b.com", password: "abc" });
    expect(result.valid).toBe(false);
    expect(result.errors.password).toBeDefined();
  });
});

/* ── validateLogin ──────────────────────────────────────────────────────── */
describe("validateLogin", () => {
  it("passes with email and password", () => {
    const result = validateLogin({ email: "alex@dal.ca", password: "mypassword" });
    expect(result.valid).toBe(true);
  });

  it("fails when email is empty", () => {
    const result = validateLogin({ email: "", password: "mypassword" });
    expect(result.valid).toBe(false);
    expect(result.errors.email).toBeDefined();
  });

  it("fails when password is empty", () => {
    const result = validateLogin({ email: "alex@dal.ca", password: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.password).toBeDefined();
  });
});