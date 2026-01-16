import { Loader2 } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-navy-600 mx-auto mb-3" />
        <p className="text-slate-500">Loading dashboard...</p>
      </div>
    </div>
  );
}
