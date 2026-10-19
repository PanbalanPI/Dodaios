import {
  ArrowRight,
  BookOpen,
  Bot,
  BrainCircuit,
  Code2,
  FileText,
  FolderKanban,
  MessageSquare,
  Settings2,
  type LucideIcon,
  Sparkles,
} from "lucide-react";
import { useEventStore, type SectionId } from "@/store/events";

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

/**
 * A practical launch point for the assistant's existing work surfaces.
 * It deliberately reads no fabricated status or task data: every card opens
 * the real section that owns that capability.
 */
export function CommandCenterView({
  onStartConversation,
  onNavigate,
  onClose,
}: {
  onStartConversation: () => void;
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
            This hub links to the app's existing features. It does not invent task
            counts, connection health, or automation status when that information
            has not been loaded.
          </p>
        </footer>
      </div>
    </main>
  );
}
