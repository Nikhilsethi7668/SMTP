export function InvoicesSection() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Calls & SMS</h3>
      <p className="text-muted-foreground">Manage your calls and SMS settings here.</p>

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between rounded-lg bg-muted p-4">
          <div>
            <p className="font-medium text-foreground">SMS Credits</p>
            <p className="text-sm text-muted-foreground">500 credits remaining</p>
          </div>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
            Add Credits
          </button>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-muted p-4">
          <div>
            <p className="font-medium text-foreground">Call Minutes</p>
            <p className="text-sm text-muted-foreground">1000 minutes remaining</p>
          </div>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
            Add Minutes
          </button>
        </div>
      </div>
    </div>
  );
}
