'use client';

import { 
  Package, 
  TrendingUp, 
  Clock, 
  Fuel, 
  CheckCircle, 
  AlertTriangle,
  Route as RouteIcon,
  Users,
  Wallet
} from 'lucide-react';
import { 
  Button, 
  IconButton, 
  Input, 
  Select, 
  Card, 
  KPICard, 
  Badge, 
  Toast,
  EmptyState,
  Spinner
} from '@/components/ui/enterprise';

export default function DesignSystemShowcase() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-navy-900">Design System Showcase</h1>
        <p className="text-lg text-slate-600">
          Enterprise Dashboard UI Components - Minimal, High Contrast, 8px Grid
        </p>
      </div>

      {/* Color Palette */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-navy-900">Color Palette</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="h-24 bg-navy-950 rounded-xl"></div>
            <p className="text-sm font-semibold">Navy 950</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 bg-navy-800 rounded-xl"></div>
            <p className="text-sm font-semibold">Navy 800</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 bg-slate-900 rounded-xl"></div>
            <p className="text-sm font-semibold">Slate 900</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 bg-white border-2 border-slate-200 rounded-xl"></div>
            <p className="text-sm font-semibold">White</p>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-navy-900 mt-6">Accent Colors</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="h-16 bg-accent-blue rounded-xl"></div>
            <p className="text-sm font-semibold">Blue (Info)</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 bg-accent-green rounded-xl"></div>
            <p className="text-sm font-semibold">Green (Success)</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 bg-accent-amber rounded-xl"></div>
            <p className="text-sm font-semibold">Amber (Warning)</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 bg-accent-red rounded-xl"></div>
            <p className="text-sm font-semibold">Red (Error)</p>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-navy-900">Typography</h2>
        <div className="space-y-3">
          <h1 className="text-5xl font-bold text-navy-900">Display Heading</h1>
          <h2 className="text-3xl font-bold text-navy-900">H2 Heading</h2>
          <h3 className="text-2xl font-semibold text-navy-900">H3 Heading</h3>
          <h4 className="text-xl font-semibold text-navy-900">H4 Heading</h4>
          <p className="text-base text-slate-600">Body text - The quick brown fox jumps over the lazy dog</p>
          <p className="text-sm text-slate-600">Small text - The quick brown fox jumps over the lazy dog</p>
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Label Text</p>
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-navy-900">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="danger">Danger Button</Button>
          <Button variant="success">Success Button</Button>
        </div>
        
        <h3 className="text-lg font-semibold text-navy-900 mt-6">Button Sizes</h3>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="md">Medium</Button>
          <Button variant="primary" size="lg">Large</Button>
        </div>
        
        <h3 className="text-lg font-semibold text-navy-900 mt-6">Button States</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" loading>Loading...</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>

        <h3 className="text-lg font-semibold text-navy-900 mt-6">Icon Buttons</h3>
        <div className="flex gap-4">
          <IconButton variant="default">
            <Package className="w-5 h-5" />
          </IconButton>
          <IconButton variant="primary">
            <TrendingUp className="w-5 h-5" />
          </IconButton>
          <IconButton variant="danger">
            <AlertTriangle className="w-5 h-5" />
          </IconButton>
        </div>
      </section>

      {/* Form Inputs */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-navy-900">Form Inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          <Input 
            label="Order ID" 
            placeholder="Enter order ID"
            helperText="Unique identifier for the order"
          />
          <Input 
            label="Customer Name" 
            placeholder="John Doe"
            error="This field is required"
          />
          <Select
            label="Order Status"
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'delivered', label: 'Delivered' },
              { value: 'failed', label: 'Failed' }
            ]}
            helperText="Current status of the order"
          />
          <Input 
            label="Delivery Date" 
            type="date"
          />
        </div>
      </section>

      {/* KPI Cards */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-navy-900">KPI Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="On-Time Delivery"
            value="94.2%"
            change="+2.3%"
            trend="up"
            icon={<CheckCircle className="w-6 h-6 text-green-600" />}
            iconColor="bg-green-100"
          />
          <KPICard
            title="Cost per Delivery"
            value="GHS 12.50"
            change="-8%"
            trend="down"
            icon={<Fuel className="w-6 h-6 text-blue-600" />}
            iconColor="bg-blue-100"
          />
          <KPICard
            title="Average ETA"
            value="32 min"
            icon={<Clock className="w-6 h-6 text-purple-600" />}
            iconColor="bg-purple-100"
          />
          <KPICard
            title="Total Routes"
            value="847"
            change="+12%"
            trend="up"
            icon={<RouteIcon className="w-6 h-6 text-amber-600" />}
            iconColor="bg-amber-100"
          />
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-navy-900">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          <Card>
            <h3 className="text-lg font-semibold text-navy-900 mb-2">Standard Card</h3>
            <p className="text-sm text-slate-600 mb-4">
              This is a standard card component with white background, soft shadow, and rounded corners.
            </p>
            <Button variant="primary" size="sm">View Details</Button>
          </Card>
          <Card hover>
            <h3 className="text-lg font-semibold text-navy-900 mb-2">Hoverable Card</h3>
            <p className="text-sm text-slate-600 mb-4">
              This card has hover effects and can be used for clickable items.
            </p>
            <Badge variant="success">Active</Badge>
          </Card>
        </div>
      </section>

      {/* Badges */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-navy-900">Badges</h2>
        <div className="flex flex-wrap gap-3">
          <Badge variant="success">Delivered</Badge>
          <Badge variant="warning">Pending</Badge>
          <Badge variant="error">Failed</Badge>
          <Badge variant="info">In Transit</Badge>
          <Badge variant="neutral">Draft</Badge>
        </div>
      </section>

      {/* Toast Notifications */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-navy-900">Toast Notifications</h2>
        <div className="space-y-4 max-w-md">
          <Toast type="success" message="Order created successfully" />
          <Toast type="error" message="Failed to update route" />
          <Toast type="info" message="New rider assigned to route" />
        </div>
      </section>

      {/* Empty State */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-navy-900">Empty State</h2>
        <Card>
          <EmptyState
            icon={<Package className="w-8 h-8" />}
            title="No orders yet"
            description="Start by creating your first order or importing from CSV"
            action={<Button variant="primary">Create Order</Button>}
          />
        </Card>
      </section>

      {/* Loading Spinner */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-navy-900">Loading States</h2>
        <Card>
          <Spinner />
        </Card>
      </section>

      {/* Spacing System */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-navy-900">8px Grid System</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-2 h-16 bg-navy-800"></div>
            <span className="text-sm">8px (0.5rem)</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-4 h-16 bg-navy-800"></div>
            <span className="text-sm">16px (1rem)</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-6 h-16 bg-navy-800"></div>
            <span className="text-sm">24px (1.5rem)</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-16 bg-navy-800"></div>
            <span className="text-sm">32px (2rem)</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-16 bg-navy-800"></div>
            <span className="text-sm">48px (3rem)</span>
          </div>
        </div>
      </section>
    </div>
  );
}
