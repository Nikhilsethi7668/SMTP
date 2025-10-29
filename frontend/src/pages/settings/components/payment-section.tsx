
export function PaymentSection() {
  return (
    <div className="space-y-8">
      {/* Payment Methods */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Payment Methods</h3>
          <button className="text-blue-600 hover:text-blue-700 font-medium">Manage</button>
        </div>

        <div className="bg-muted rounded-lg p-4 flex items-center justify-between">
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
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Invoices</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">DATE</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">PLAN</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">COST</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">INVOICE</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border hover:bg-muted transition-colors">
                <td className="py-4 px-4 text-foreground">2025-10-24T18:54:31.000Z</td>
                <td className="py-4 px-4 text-foreground">1 × Growth Plan (at $37.00/month)</td>
                <td className="py-4 px-4 text-foreground font-medium">$37</td>
                <td className="py-4 px-4">
                  <button className="text-blue-600 hover:text-blue-700 flex items-center gap-2">
                    <span>⬇</span> Download
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
