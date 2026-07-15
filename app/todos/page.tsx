import TodoList from "@/components/TodoList";
import PageHeader from "@/components/PageHeader";

export const metadata = {
  title: "To-Do — Polymath Hub",
};

export default function TodosPage() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="The Backlog"
        title="To-Do"
        description={
          <>
            A plain running list of tasks, separate from the curriculum. Add whatever you need to
            get done here, then head to the <strong>Plan</strong> page to put specific tasks on
            specific days of the week.
          </>
        }
      />
      <TodoList />
    </div>
  );
}
