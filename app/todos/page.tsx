import TodoList from "@/components/TodoList";
import Ornament from "@/components/Ornament";

export const metadata = {
  title: "To-Do — Polymath Hub",
};

export default function TodosPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          The Backlog
        </p>
        <h1 className="font-display mt-2 text-3xl italic text-foreground">
          To-Do
        </h1>
        <p className="mt-2 text-sm text-muted">
          A plain running list of tasks, separate from the curriculum. Add whatever you need to
          get done here, then head to the <strong>Plan</strong> page to put specific tasks on
          specific days of the week.
        </p>
      </div>
      <Ornament />
      <TodoList />
    </div>
  );
}
