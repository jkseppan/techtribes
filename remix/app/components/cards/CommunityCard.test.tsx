import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CommunityCard } from "~/components/cards/CommunityCard";
import { makeEvent } from "../../../test/fixtures";

afterEach(() => {
  cleanup();
});

describe("CommunityCard", () => {
  it("links the name to the community's site when present", () => {
    const event = makeEvent({
      name: "Helsinki JS",
      site: "https://helsinkijs.org",
      events: "https://meetup.com/helsinki-js",
    });
    render(<CommunityCard event={event} />);
    const links = screen.getAllByRole("link", { name: "Helsinki JS" });
    expect(links.some((link) => link.getAttribute("href") === "https://helsinkijs.org")).toBe(true);
  });

  it("falls back to the events URL when no site is given", () => {
    const event = makeEvent({
      name: "Helsinki JS",
      site: undefined,
      events: "https://meetup.com/helsinki-js",
    });
    render(<CommunityCard event={event} />);
    const links = screen.getAllByRole("link", { name: "Helsinki JS" });
    expect(links.some((link) => link.getAttribute("href") === "https://meetup.com/helsinki-js")).toBe(true);
  });

  it("renders the logo as decorative, since the community name is already visible", () => {
    const event = makeEvent({ name: "Helsinki JS", logo: "helsinki-js.png" });
    const { container } = render(<CommunityCard event={event} />);
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("alt", "");
    expect(img).toHaveAttribute("src", "/assets/logos/helsinki-js.png");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("passes through an absolute logo URL unchanged", () => {
    const event = makeEvent({
      name: "Helsinki JS",
      logo: "https://example.com/logo.png",
    });
    const { container } = render(<CommunityCard event={event} />);
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("alt", "");
    expect(img).toHaveAttribute("src", "https://example.com/logo.png");
  });

  it("renders the date in a <time> element with a dateTime attribute, linked to the event", () => {
    const event = makeEvent({
      date: "15/08/2026",
      isoDate: "2026-08-15",
      event: "https://meetup.com/helsinki-js/events/1",
    });
    render(<CommunityCard event={event} />);
    const time = screen.getByText("15/08/2026").closest("time");
    expect(time).toHaveAttribute("dateTime", "2026-08-15");
    const eventLink = screen.getByRole("link", { name: "15/08/2026" });
    expect(eventLink).toHaveAttribute("href", "https://meetup.com/helsinki-js/events/1");
  });

  it("renders the date as plain text (no link) when there's no event URL", () => {
    const event = makeEvent({ date: "15/08/2026", isoDate: "2026-08-15", event: "" });
    render(<CommunityCard event={event} />);
    expect(screen.queryByRole("link", { name: "15/08/2026" })).not.toBeInTheDocument();
    expect(screen.getByText("15/08/2026")).toBeInTheDocument();
  });

  it("prefers eventLocation over location when both are present", () => {
    const event = makeEvent({
      location: "Helsinki, Finland",
      eventLocation: "Maria 01, Helsinki",
    });
    render(<CommunityCard event={event} />);
    expect(screen.getByText("Maria 01, Helsinki")).toBeInTheDocument();
    expect(screen.queryByText("Helsinki, Finland")).not.toBeInTheDocument();
  });

  it("falls back to location when eventLocation is absent", () => {
    const event = makeEvent({ location: "Helsinki, Finland", eventLocation: undefined });
    render(<CommunityCard event={event} />);
    expect(screen.getByText("Helsinki, Finland")).toBeInTheDocument();
  });

  it("shows the member count only when present", () => {
    const withMembers = makeEvent({ members: 1200 });
    const { rerender } = render(<CommunityCard event={withMembers} />);
    expect(screen.getByText("1200")).toBeInTheDocument();

    const withoutMembers = makeEvent({ members: undefined });
    rerender(<CommunityCard event={withoutMembers} />);
    expect(screen.queryByText("1200")).not.toBeInTheDocument();
  });

  it("renders tags as plain (non-interactive) spans when onTagClick is not given", () => {
    const event = makeEvent({ tags: ["javascript", "frontend"] });
    render(<CommunityCard event={event} />);
    const tag = screen.getByText("javascript");
    expect(tag.tagName).toBe("SPAN");
    expect(screen.queryByRole("button", { name: /javascript/i })).not.toBeInTheDocument();
  });

  it("renders tags as toggle buttons with aria-pressed when onTagClick is given", () => {
    const event = makeEvent({ tags: ["javascript", "frontend"] });
    const onTagClick = vi.fn();
    render(<CommunityCard event={event} onTagClick={onTagClick} activeTags={["javascript"]} />);

    const active = screen.getByRole("button", { name: "Filter by javascript" });
    expect(active).toHaveAttribute("aria-pressed", "true");

    const inactive = screen.getByRole("button", { name: "Filter by frontend" });
    expect(inactive).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(inactive);
    expect(onTagClick).toHaveBeenCalledWith("frontend");
  });

  it("matches activeTags case-insensitively", () => {
    const event = makeEvent({ tags: ["JavaScript"] });
    render(<CommunityCard event={event} onTagClick={vi.fn()} activeTags={["javascript"]} />);
    expect(screen.getByRole("button", { name: "Filter by JavaScript" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
