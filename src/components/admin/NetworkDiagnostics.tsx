
import { NetworkDiagnosticPanel } from "@/components/NetworkDiagnosticPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const NetworkDiagnostics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Network Diagnostics</h1>
        <p className="text-gray-600 mt-2">
          Diagnose network connectivity and Supabase integration issues.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>System Connectivity Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <NetworkDiagnosticPanel />
        </CardContent>
      </Card>
    </div>
  );
};
