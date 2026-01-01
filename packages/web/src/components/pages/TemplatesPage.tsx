export function TemplatesPage() {
  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-3xl font-bold text-foreground">
        Templates
      </h1>
      <p className="mt-2 text-muted-foreground">
        Browse and select from 5 agent template types.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {['Data Analyst', 'Content Creator', 'Code Assistant', 'Research Agent', 'Automation Agent'].map(
          (template) => (
            <div
              key={template}
              className="rounded-xl border border-border bg-card p-6 shadow-subtle transition-shadow hover:shadow-card"
            >
              <h3 className="font-display font-semibold text-foreground">
                {template}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Template description placeholder.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
