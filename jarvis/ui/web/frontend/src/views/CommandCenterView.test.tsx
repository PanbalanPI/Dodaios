import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { buildProjectPrompt, CommandCenterView } from "@/views/CommandCenterView";

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
        onStartProject={vi.fn()}
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
        onStartProject={vi.fn()}
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
        onStartProject={vi.fn()}
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
        onStartProject={vi.fn()}
        onNavigate={vi.fn()}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Back to chat" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});

it("builds a structured, free-first project prompt without sending it automatically", () => {
  const prompt = buildProjectPrompt({
    idea: "Create a study planner",
    outcome: "Track assignments and deadlines",
    platform: "Web app",
    constraints: "Free-first; no paid APIs",
  });

  expect(prompt).toContain("Create a study planner");
  expect(prompt).toContain("Track assignments and deadlines");
  expect(prompt).toContain("Web app");
  expect(prompt).toContain("Free-first; no paid APIs");
  expect(prompt).toContain("do not trigger paid services or API usage without my approval");
});

it("hands the completed project brief to the chat for review", () => {
  const onStartProject = vi.fn();
  render(
    <CommandCenterView
      onStartConversation={vi.fn()}
      onStartProject={onStartProject}
      onNavigate={vi.fn()}
      onClose={vi.fn()}
    />,
  );

  fireEvent.change(screen.getByTestId("project-idea"), {
    target: { value: "Create an NCC attendance tracker" },
  });
  fireEvent.change(screen.getByTestId("project-platform"), {
    target: { value: "Web app" },
  });
  fireEvent.click(screen.getByTestId("project-intake-submit"));

  expect(onStartProject).toHaveBeenCalledOnce();
  expect(onStartProject.mock.calls[0][0]).toContain("Create an NCC attendance tracker");
  expect(onStartProject.mock.calls[0][0]).toContain("Web app");
});
