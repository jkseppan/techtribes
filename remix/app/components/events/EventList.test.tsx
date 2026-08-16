import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createRoutesStub, useNavigate, useSearchParams } from "react-router";

import { EventList } from "~/components/events/EventList";
import { makeEvent } from "../../../test/fixtures";

afterEach(() => {
  cleanup();
});

const upcoming = [
  makeEvent({
    name: "Helsinki JS",
    events: "https://meetup.com/helsinki-js",
    location: "Helsinki, Finland",
    tags: ["javascript", "frontend"],
    date: "20/08/2026",
    isoDate: "2026-08-20",
  }),
  makeEvent({
    name: "Tampere Rust",
    events: "https://meetup.com/tampere-rust",
    location: "Tampere, Finland",
    tags: ["rust", "backend"],
    date: "25/08/2026",
    isoDate: "2026-08-25",
  }),
];

const past = [
  makeEvent({
    name: "Oulu Python",
    events: "https://meetup.com/oulu-python",
    location: "Oulu, Finland",
    tags: ["python", "backend"],
    date: "01/01/2026",
    isoDate: "2026-01-01",
  }),
];

/**
 * Render EventList inside a routes stub (it uses useSearchParams internally)
 * and expose a sibling that reads the same search params, so URL sync can be
 * asserted without reaching into router internals.
 */
function renderEventList(initialEntry = "/") {
  function Wrapper() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    return (
      <>
        <div data-testid="url-params">{params.toString()}</div>
        <button type="button" onClick={() => navigate("/")}>
          Navigate home
        </button>
        <EventList upcoming={upcoming} past={past} />
      </>
    );
  }
  const Stub = createRoutesStub([{ path: "/", Component: Wrapper }]);
  return render(<Stub initialEntries={[initialEntry]} />);
}

/**
 * The quick-filter tag pill and any matching CommunityCard tag button share
 * the same accessible name ("Filter by <tag>"), so scope the query to the
 * filter bar (the container that also holds the search box) to get the pill.
 */
function tagFilterButton(tag: string) {
  const input = screen.getByRole("searchbox", {
    name: "Search communities, cities or topics",
  });
  const filterBar = input.parentElement?.parentElement as HTMLElement;
  return within(filterBar).getByRole("button", { name: `Filter by ${tag}` });
}

describe("EventList", () => {
  it("renders both section headings and all cards", () => {
    renderEventList();
    expect(screen.getByRole("heading", { name: "Upcoming events" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Past events" })).toBeInTheDocument();
    expect(screen.getByText("Helsinki JS")).toBeInTheDocument();
    expect(screen.getByText("Tampere Rust")).toBeInTheDocument();
    expect(screen.getByText("Oulu Python")).toBeInTheDocument();
  });

  it("does not show a result-count line when not filtering", () => {
    renderEventList();
    expect(screen.queryByText(/Showing \d+ of \d+ communities/)).not.toBeInTheDocument();
  });

  it("filters cards by typing into the search box", () => {
    renderEventList();
    const input = screen.getByRole("searchbox", {
      name: "Search communities, cities or topics",
    });
    fireEvent.change(input, { target: { value: "rust" } });

    expect(screen.getByText("Tampere Rust")).toBeInTheDocument();
    expect(screen.queryByText("Helsinki JS")).not.toBeInTheDocument();
    expect(screen.queryByText("Oulu Python")).not.toBeInTheDocument();
  });

  it("shows the result-count line only while filtering", () => {
    renderEventList();
    const input = screen.getByRole("searchbox", {
      name: "Search communities, cities or topics",
    });
    fireEvent.change(input, { target: { value: "rust" } });
    expect(screen.getByText("Showing 1 of 3 communities")).toBeInTheDocument();
  });

  it("shows an empty state when nothing matches", () => {
    renderEventList();
    const input = screen.getByRole("searchbox", {
      name: "Search communities, cities or topics",
    });
    fireEvent.change(input, { target: { value: "nonexistent-topic-xyz" } });

    expect(screen.getByText("No communities match your filter")).toBeInTheDocument();
    expect(screen.queryByText("Helsinki JS")).not.toBeInTheDocument();
  });

  it("toggles a tag pill's aria-pressed state and filters by it", () => {
    renderEventList();
    const tagButton = tagFilterButton("javascript");
    expect(tagButton).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(tagButton);
    expect(tagButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Helsinki JS")).toBeInTheDocument();
    expect(screen.queryByText("Tampere Rust")).not.toBeInTheDocument();
    expect(screen.queryByText("Oulu Python")).not.toBeInTheDocument();

    fireEvent.click(tagButton);
    expect(tagButton).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("Tampere Rust")).toBeInTheDocument();
  });

  it("restores all cards when clearing filters", () => {
    renderEventList();
    const input = screen.getByRole("searchbox", {
      name: "Search communities, cities or topics",
    });
    fireEvent.change(input, { target: { value: "rust" } });
    expect(screen.queryByText("Helsinki JS")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(input).toHaveValue("");
    expect(screen.getByText("Helsinki JS")).toBeInTheDocument();
    expect(screen.getByText("Tampere Rust")).toBeInTheDocument();
    expect(screen.getByText("Oulu Python")).toBeInTheDocument();
    expect(screen.queryByText(/Showing \d+ of \d+ communities/)).not.toBeInTheDocument();
  });

  it("also shows a clear-filters affordance inside the empty state", () => {
    renderEventList();
    const input = screen.getByRole("searchbox", {
      name: "Search communities, cities or topics",
    });
    fireEvent.change(input, { target: { value: "nonexistent-topic-xyz" } });

    const emptyState = screen.getByText("No communities match your filter").closest("div");
    expect(emptyState).not.toBeNull();
    fireEvent.click(
      within(emptyState as HTMLElement).getByRole("button", { name: "Clear filters" }),
    );

    expect(screen.getByText("Helsinki JS")).toBeInTheDocument();
  });

  it("syncs the query into the URL's ?q= param", () => {
    renderEventList();
    const input = screen.getByRole("searchbox", {
      name: "Search communities, cities or topics",
    });
    fireEvent.change(input, { target: { value: "rust" } });
    expect(screen.getByTestId("url-params").textContent).toBe("q=rust");
  });

  it("syncs active tags into the URL's ?tags= param", () => {
    renderEventList();
    fireEvent.click(tagFilterButton("javascript"));
    expect(screen.getByTestId("url-params").textContent).toBe("tags=javascript");
  });

  it("updates the filter when same-route navigation changes the URL", () => {
    renderEventList("/?q=rust");
    const input = screen.getByRole("searchbox", {
      name: "Search communities, cities or topics",
    });
    expect(input).toHaveValue("rust");
    expect(screen.queryByText("Helsinki JS")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Navigate home" }));

    expect(screen.getByTestId("url-params").textContent).toBe("");
    expect(input).toHaveValue("");
    expect(screen.getByText("Helsinki JS")).toBeInTheDocument();
  });
});
