import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  Bot,
  BrainCircuit,
  Code2,
  FileText,
  FolderKanban,
  MessageSquare,
  Rocket,
  Settings2,
  type LucideIcon,
  Sparkles,
} from "lucide-react";
import { useEventStore, type SectionId } from "@/store/events";
import { createMemoryPage, MEMORY_KEYS } from "@/lib/memoryApi";

type Destination = {
  id: SectionId;
  title: string;
  description: string;
  icon: LucideIcon;
};

const destinations: Destination[] = [
  {
    id: "chats",
    title: "Talk to Dodaios",
    description: "Think through an idea, ask a question, or work through a problem.",
    icon: MessageSquare,
  },
  {
    id: "agentic-ide",
    title: "Build a project",
    description: "Open a coding workspace and turn a plan into working software.",
    icon: Code2,
  },
  {
    id: "agents",
    title: "Delegate to agents",
    description: "Explore your agent team and the work they can help with.",
    icon: Bot,
  },
  {
    id: "board",
    title: "Plan and track",
    description: "Open your board to organize work and keep the next steps visible.",
    icon: FolderKanban,
  },
  {
    id: "memory",
    title: "Knowledge and memory",
    description: "Review the notes and knowledge available to your assistant.",
    icon: BrainCircuit,
  },
  {
    id: "docs",
    title: "Documents",
    description: "Find and work with your saved documents and references.",
    icon: FileText,
  },
];

const secondaryDestinations: Destination[] = [
  {
    id: "agent-instructions",
    title: "Personalize your assistant",
    description: "Review the instructions that shape how your assistant works.",
    icon: Sparkles,
  },
  {
    id: "settings",
    title: "Connections and settings",
    description: "Configure available providers, tools, and app preferences.",
    icon: Settings2,
  },
];

export type ProjectBrief = {
  idea: string;
  outcome: string;
  platform: string;
  constraints: string;
};

export function buildProjectPrompt(brief: ProjectBrief): string {
  const lines = [
    "Help me turn this idea into a working project.",
    "",
    "## Idea",
    brief.idea.trim(),
    "",
    "## Desired outcome",
    brief.outcome.trim() || "Help me define a clear, testable outcome.",
    "",
    "## Target platform",
    brief.platform.trim() || "Recommend a suitable platform and explain the trade-offs.",
    "",
    "## Constraints and preferences",
    brief.constraints.trim() || "Keep the first version simple, low-cost, and maintainable.",
    "",
    "## How to work",
    "- First clarify critical unknowns; do not invent requirements.",
    "- Propose a small, testable MVP and acceptance criteria.",
    "- Break the work into milestones and identify dependencies.",
    "- Recommend the stack based on the requirements and my existing environment.",
    "- Before modifying files, explain the plan and identify any risky or irreversible steps.",
    "- Prefer free/local options; do not trigger paid services or API usage without my approval.",
    "- After I approve the plan, help implement incrementally and verify each milestone.",
  ];
  return lines.join("\n");
}

function DestinationCard({
  destination,
  featured = false,
  onStartConversation,
  onNavigate,
}: {
  destination: Destination;
  featured?: boolean;
  onStartConversation: () => void;
  onNavigate: () => void;
}) {
  const setActiveSection = useEventStore((state) => state.setActiveSection);
  const Icon = destination.icon;

  return (
    <button
      type="button"
      onClick={() => {
        if (destination.id === "chats") {
          onStartConversation();
          return;
        }
        onNavigate();
        setActiveSection(destination.id);
      }}
      className={[
        "group flex min-h-36 w-full flex-col items-start rounded-2xl border p-5 text-left transition-colors",
        "border-border bg-card/70 hover:border-primary/50 hover:bg-accent/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        featured ? "min-h-44 sm:p-6" : "",
      ].join(" ")}
      data-testid={`command-center-${destination.id}`}
    >
      <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <span className="flex w-full items-center justify-between gap-3 font-medium text-foreground">
        {destination.title}
        <ArrowRight
          size={16}
          className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
          aria-hidden="true"
        />
      </span>
      <span className="mt-2 text-sm leading-6 text-muted-foreground">
        {destination.description}
      </span>
    </button>
  );
}

function ProjectIntake({ onStartProject }: { onStartProject: (prompt: string) => void }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [brief, setBrief] = useState<ProjectBrief>({
    idea: "",
    outcome: "",
    platform: "",
    constraints: "",
  });

  const update = (field: keyof ProjectBrief, value: string) => {
    setBrief((current) => ({ ...current, [field]: value }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!brief.idea.trim()) return;
    onStartProject(buildProjectPrompt(brief));
  };

  const saveBrief = async () => {
    if (!brief.idea.trim() || saving) return;
    setSaving(true);
    setSaveStatus(null);
    const title = brief.idea.trim().replace(/\\s+/g, " ").slice(0, 80);
    try {
      await createMemoryPage("project", title, buildProjectPrompt(brief));
      await queryClient.invalidateQueries({ queryKey: MEMORY_KEYS.all });
      setSaveStatus({ kind: "success", message: "Project brief saved to Memory." });
    } catch (error) {
      setSaveStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Could not save the project brief.",
      });
    } finally {
      setSaving(false);
    }
  };

  const fieldClass =
    "mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <section className="mb-10 rounded-2xl border border-primary/20 bg-card/50 p-5 sm:p-6" aria-labelledby="project-intake-heading">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Rocket size={19} aria-hidden="true" />
        </span>
        <div>
          <h2 id="project-intake-heading" className="text-lg font-semibold text-foreground">
            Turn an idea into a project
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            Describe what you want to make. JARVIS will prepare a structured brief in chat for you to review before anything runs.
          </p>
        </div>
      </div>
      <form onSubmit={submit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-foreground md:col-span-2">
          Your idea <span className="text-primary" aria-hidden="true">*</span>
          <textarea
            required
            rows={3}
            value={brief.idea}
            onChange={(event) => update("idea", event.target.value)}
            placeholder="What do you want to build or solve?"
            className={fieldClass}
            data-testid="project-idea"
          />
        </label>
        <label className="text-sm font-medium text-foreground">
          What should success look like?
          <textarea
            rows={2}
            value={brief.outcome}
            onChange={(event) => update("outcome", event.target.value)}
            placeholder="The result or problem it should solve"
            className={fieldClass}
            data-testid="project-outcome"
          />
        </label>
        <label className="text-sm font-medium text-foreground">
          Target platform or stack
          <input
            value={brief.platform}
            onChange={(event) => update("platform", event.target.value)}
            placeholder="Web app, Windows, Arduino, mobile…"
            className={fieldClass}
            data-testid="project-platform"
          />
        </label>
        <label className="text-sm font-medium text-foreground md:col-span-2">
          Constraints, budget, or tools
          <textarea
            rows={2}
            value={brief.constraints}
            onChange={(event) => update("constraints", event.target.value)}
            placeholder="Existing hardware, deadlines, free-first, required integrations…"
            className={fieldClass}
            data-testid="project-constraints"
          />
        </label>
        <div className="flex flex-col gap-3 md:col-span-2">
          <p className="text-xs leading-5 text-muted-foreground">
            Preparing a brief never sends it to an AI provider. Saving writes a project page to your local Memory vault.
          </p>
          {saveStatus && (
            <p role={saveStatus.kind === "error" ? "alert" : "status"} className={saveStatus.kind === "error" ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>
              {saveStatus.message}
            </p>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={() => void saveBrief()}
              disabled={!brief.idea.trim() || saving}
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              data-testid="project-intake-save"
            >
              {saving ? "Saving…" : "Save brief to Memory"}
            </button>
            <button
              type="submit"
              disabled={!brief.idea.trim()}
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              data-testid="project-intake-submit"
            >
              Prepare project brief
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

/**
 * A practical launch point for existing work surfaces plus an idea-to-project
 * intake that seeds a reviewable prompt into the existing chat composer.
 */
export function CommandCenterView({
  onStartConversation,
  onStartProject,
  onNavigate,
  onClose,
}: {
  onStartConversation: () => void;
  onStartProject: (prompt: string) => void;
  onNavigate: () => void;
  onClose: () => void;
}) {
  return (
    <main
      className="h-full min-h-0 overflow-y-auto bg-background"
      data-testid="command-center-view"
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <div className="mb-9 flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles size={13} aria-hidden="true" />
              PERSONAL COMMAND CENTER
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Make room for your next idea.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              One place to think, build, organize knowledge, and coordinate work
              with your assistant.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Back to chat
            </button>
            <button
              type="button"
              onClick={onStartConversation}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <MessageSquare size={17} aria-hidden="true" />
              Start a conversation
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        <ProjectIntake onStartProject={onStartProject} />

        <section aria-labelledby="workspaces-heading">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 id="workspaces-heading" className="text-lg font-semibold text-foreground">
                Your workspace
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Jump straight into the work you want to do.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {destinations.map((destination, index) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                featured={index === 0}
                onStartConversation={onStartConversation}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </section>

        <section className="mt-10" aria-labelledby="setup-heading">
          <div className="mb-4">
            <h2 id="setup-heading" className="text-lg font-semibold text-foreground">
              Make it yours
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tune the assistant and its environment as your workflow grows.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {secondaryDestinations.map((destination) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                onStartConversation={onStartConversation}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </section>

        <footer className="mt-10 flex items-start gap-3 rounded-xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
          <BookOpen size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
          <p className="leading-6">
            This hub links to the app's existing features and prepares a project brief for review.
            It does not invent task counts, connection health, or automation status.
          </p>
        </footer>
      </div>
    </main>
  );
}
