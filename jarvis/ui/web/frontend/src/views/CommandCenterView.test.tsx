import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CommandCenterView } from "@/views/CommandCenterView";

const events = vi.hoisted(() => ({ setActiveSection: vi.fn() }));
vi.mock("@/store/events", () => ({
  useEventStore: (select: (state: typeof events) => unknown) => select(events),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("CommandCenterView", () => {
  it("renders real workspace destinations without invented status metrics", () => {
    render(
      <CommandCenterView
        onStartConversation={vi.fn()}
        onNavigate={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByTestId("command-center-view")).toBeTruthy();
    expect(screen.getByTestId("command-center-agentic-ide").textContent).toContain("Build a project");
    expect(screen.getByTestId("command-center-memory").textContent).toContain("Knowledge and memory");
    expect(screen.queryByText(/\d+ tasks? completed/i)).toBeNull();
    expect(screen.queryByText(/all systems operational/i)).toBeNull();
  });

  it("starts a new conversation from the chat destination", () => {
    const onStartConversation = vi.fn();
    const onNavigate = vi.fn();

    render(
      <CommandCenterView
        onStartConversation={onStartConversation}
        onNavigate={onNavigate}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByTestId("command-center-chats"));

    expect(onStartConversation).toHaveBeenCalledOnce();
    expect(onNavigate).not.toHaveBeenCalled();
    expect(events.setActiveSection).not.toHaveBeenCalled();
  });

  it("navigates to an existing section and closes the command center first", () => {
    const onNavigate = vi.fn();

    render(
      <CommandCenterView
        onStartConversation={vi.fn()}
        onNavigate={onNavigate}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByTestId("command-center-agentic-ide"));

    expect(onNavigate).toHaveBeenCalledOnce();
    expect(events.setActiveSection).toHaveBeenCalledWith("agentic-ide");
  });

  it("returns to chat when the close action is selected", () => {
    const onClose = vi.fn();

    render(
      <CommandCenterView
        onStartConversation={vi.fn()}
        onNavigate={vi.fn()}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Back to chat" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
