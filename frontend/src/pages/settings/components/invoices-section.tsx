
export function InvoicesSection() {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Calls & SMS</h3>
      <p className="text-muted-foreground">Manage your calls and SMS settings here.</p>

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p className="font-medium text-foreground">SMS Credits</p>
            <p className="text-sm text-muted-foreground">500 credits remaining</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Add Credits
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p className="font-medium text-foreground">Call Minutes</p>
            <p className="text-sm text-muted-foreground">1000 minutes remaining</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Add Minutes
          </button>
        </div>
      </div>
    </div>
  )
}
