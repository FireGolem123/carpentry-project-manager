import { BuildStatus } from "@/lib/types";

const config: Record<BuildStatus, { label: string; className: string }> = {
  in_progress: {
    label: "In Progress",
    className: "bg-muted text-foreground border border-border",
  },
  completed: {
    label: "Completed",
    className: "bg-accent text-accent-foreground",
  },
  sold: {
    label: "Sold",
    className: "bg-primary text-primary-foreground",
  },
};

export function StatusBadge({ status }: { status: BuildStatus }) {
  const { label, className } = config[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${className}`}
    >
      {label}
    </span>
  );
}
