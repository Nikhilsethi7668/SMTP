export function PaymentSection() {
  return (
    <div className="space-y-8">
      {/* Payment Methods */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Payment Methods</h3>
          <button className="font-medium text-blue-600 hover:text-blue-700">Manage</button>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-muted p-4">
          <div className="flex items-center gap-4">
            <div className="text-2xl">💳</div>
            <div>
              <p className="text-sm text-muted-foreground">Card information</p>
              <p className="font-medium text-foreground">Visa ending in 0416</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Name on card</p>
            <p className="font-medium text-foreground">Dhiraj Chatpar</p>
          </div>
          <div className="text-sm text-muted-foreground">Default for workspace</div>
        </div>
      </div>

      {/* Invoices */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-6 text-lg font-semibold text-foreground">Invoices</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                  DATE
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                  PLAN
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                  COST
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                  INVOICE
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border transition-colors hover:bg-muted">
                <td className="px-4 py-4 text-foreground">2025-10-24T18:54:31.000Z</td>
                <td className="px-4 py-4 text-foreground">1 × Growth Plan (at $37.00/month)</td>
                <td className="px-4 py-4 font-medium text-foreground">$37</td>
                <td className="px-4 py-4">
                  <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                    <span>⬇</span> Download
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
