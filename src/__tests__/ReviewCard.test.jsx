import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ReviewCard from "../components/ReviewCard";

const SAMPLE_REVIEW = {
  id: "r1",
  author: "James Chen",
  avatar: "JC",
  date: "Apr 1, 2026",
  rating: 4,
  text: "Good building overall. Management is responsive.",
  comments: [],
};

function renderCard(props = {}) {
  return render(
    <MemoryRouter>
      <ReviewCard review={SAMPLE_REVIEW} {...props} />
    </MemoryRouter>
  );
}

describe("ReviewCard", () => {
  it("renders the author name", () => {
    renderCard();
    expect(screen.getByText("James Chen")).toBeInTheDocument();
  });

  it("renders the review date", () => {
    renderCard();
    expect(screen.getByText("Apr 1, 2026")).toBeInTheDocument();
  });

  it("renders the review text", () => {
    renderCard();
    expect(
      screen.getByText("Good building overall. Management is responsive.")
    ).toBeInTheDocument();
  });

  it("shows (you) label for the current user's review", () => {
    renderCard({ currentUser: "James Chen" });
    expect(screen.getByText(/james chen \(you\)/i)).toBeInTheDocument();
  });

  it("shows the reply input when currentUser is provided", () => {
    renderCard({ currentUser: "Alex Mitchell" });
    expect(screen.getByPlaceholderText("Write a comment...")).toBeInTheDocument();
  });

  it("does NOT show reply input when no currentUser", () => {
    renderCard({ currentUser: null });
    expect(screen.queryByPlaceholderText("Write a comment...")).not.toBeInTheDocument();
  });

  it("renders existing comments", () => {
    const reviewWithComments = {
      ...SAMPLE_REVIEW,
      comments: [
        { author: "Alex Mitchell", date: "Apr 4, 2026", text: "How long was the parking waitlist?" },
      ],
    };
    render(
      <MemoryRouter>
        <ReviewCard review={reviewWithComments} />
      </MemoryRouter>
    );
    expect(screen.getByText("How long was the parking waitlist?")).toBeInTheDocument();
  });

  it("calls onComment with the review id and text when Reply is clicked", () => {
    const onComment = vi.fn();
    renderCard({ currentUser: "Alex Mitchell", onComment });

    const input = screen.getByPlaceholderText("Write a comment...");
    fireEvent.change(input, { target: { value: "Great point!" } });
    fireEvent.click(screen.getByRole("button", { name: /reply/i }));

    expect(onComment).toHaveBeenCalledWith("r1", "Great point!");
  });

  it("does not call onComment when comment input is empty", () => {
    const onComment = vi.fn();
    renderCard({ currentUser: "Alex Mitchell", onComment });

    fireEvent.click(screen.getByRole("button", { name: /reply/i }));
    expect(onComment).not.toHaveBeenCalled();
  });
});