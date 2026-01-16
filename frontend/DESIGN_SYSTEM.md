# Enterprise Dashboard Design System

## Overview
Professional, modern enterprise dashboard UI for Last-Mile Logistics Optimizer with minimal, high-contrast design.

## Design Principles
- **8px Grid System**: All spacing follows 8px increments (8, 16, 24, 32, 40, 48...)
- **High Contrast**: Deep navy (#102a43) and slate gray (#0f172a) on white backgrounds
- **Polished Typography**: Inter font family with clear hierarchy
- **Responsive**: Desktop (1440px), Tablet (1024px), Mobile (375px)

## Color Palette

### Primary Colors
```
Navy:
- 950: #0a1929 (Darkest - backgrounds)
- 900: #102a43 (Dark - primary text)
- 800: #243b53 (Primary buttons)
- 700: #334e68 (Hover states)
- 600: #486581
- 50-100: Light accents

Slate:
- 900: #0f172a (Secondary dark)
- 800: #1e293b
- 700: #334155
- 600: #475569
- 500: #64748b (Body text)
- 300: #cbd5e1 (Borders)
- 100: #f1f5f9 (Light backgrounds)
- 50: #f8fafc (Lightest)
```

### Accent Colors
```
Blue: #3b82f6 (Info, Links)
Green: #10b981 (Success, On-time)
Amber: #f59e0b (Warning, Pending)
Red: #ef4444 (Error, Failed)
Purple: #8b5cf6 (Analytics)
```

## Typography

### Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Type Scale
```
Display: 60px/72px - font-bold
H1: 48px/56px - font-bold
H2: 36px/44px - font-bold
H3: 24px/32px - font-semibold
H4: 20px/28px - font-semibold
Body Large: 16px/24px - font-normal
Body: 14px/20px - font-normal
Small: 12px/16px - font-medium
XSmall: 10px/12px - font-semibold (UPPERCASE)
```

## Spacing System (8px Grid)

```
0.5rem = 8px   (gap-2)
1rem = 16px    (gap-4)
1.5rem = 24px  (gap-6)
2rem = 32px    (gap-8)
3rem = 48px    (gap-12)
4rem = 64px    (gap-16)
```

## Component Library

### Buttons

#### Primary Button
```tsx
<Button variant="primary" size="md">
  Save Changes
</Button>
```
**Style**: Navy-800 background, white text, shadow-soft, rounded-xl

#### Ghost Button
```tsx
<Button variant="ghost" size="md">
  Cancel
</Button>
```
**Style**: Transparent background, slate-700 text, hover slate-100

#### Secondary Button
```tsx
<Button variant="secondary" size="md">
  Export
</Button>
```
**Style**: Slate-100 background, navy-900 text

#### Icon Button
```tsx
<IconButton variant="default">
  <Settings className="w-5 h-5" />
</IconButton>
```
**Style**: 40x40px, transparent, hover slate-100

### Input Fields

```tsx
<Input 
  label="Order ID"
  placeholder="Enter order ID"
  helperText="Unique identifier"
/>
```
**Style**: 
- Border: slate-300
- Focus: ring-2 ring-navy-600
- Padding: 16px (px-4 py-2.5)
- Border radius: 8px (rounded-lg)

### Dropdown/Select

```tsx
<Select
  label="Status"
  options={[
    { value: 'pending', label: 'Pending' },
    { value: 'delivered', label: 'Delivered' }
  ]}
/>
```

### Cards

#### Standard Card
```tsx
<Card>
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>
```
**Style**: 
- Background: white
- Border: slate-200/60 1px
- Shadow: soft (0 2px 8px rgba(15, 23, 42, 0.04))
- Border radius: 16px (rounded-2xl)
- Padding: 24px (p-6)

#### KPI Card
```tsx
<KPICard
  title="On-Time Delivery"
  value="94.2%"
  change="+2.3%"
  trend="up"
  icon={<TrendingUp />}
  iconColor="bg-green-100"
/>
```

### Badges

```tsx
<Badge variant="success">Delivered</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Failed</Badge>
<Badge variant="info">In Transit</Badge>
```

**Styles**:
- Success: green-100 background, green-800 text
- Warning: amber-100 background, amber-800 text
- Error: red-100 background, red-800 text
- Info: blue-100 background, blue-800 text

### Toast Notifications

```tsx
<Toast 
  type="success" 
  message="Order created successfully"
  onClose={() => {}}
/>
```

## Layout Structure

### Sidebar (Collapsible)
- **Collapsed**: 80px width (icons only)
- **Expanded**: 256px width (icons + labels)
- **Background**: White
- **Border**: Right border slate-200 1px

### Top Navigation
- **Height**: 64px (h-16)
- **Background**: white/80 with backdrop-blur
- **Border**: Bottom border slate-200 1px
- **Components**: Menu toggle, Search bar, Actions (Notifications, Settings)

### Main Content
- **Background**: slate-50
- **Padding**: 32px on desktop (p-8), 24px on mobile (p-6)
- **Max-width**: 1600px centered

## Responsive Breakpoints

```
Mobile: < 640px (375px design reference)
Tablet: 640px - 1024px (768px design reference)
Desktop: > 1024px (1440px design reference)
```

### Mobile Adaptations
- Sidebar becomes slide-over drawer
- Top bar shows menu icon
- Cards stack vertically
- KPI cards grid: 1 column
- Reduced padding: p-4 instead of p-8

### Tablet Adaptations
- Sidebar remains visible (can collapse)
- KPI cards grid: 2 columns
- Map panel takes full width

## Shadow System

```css
soft: 0 2px 8px rgba(15, 23, 42, 0.04)
medium: 0 4px 16px rgba(15, 23, 42, 0.08)
strong: 0 8px 32px rgba(15, 23, 42, 0.12)
```

## Animation Guidelines

### Transitions
- **Duration**: 150ms for micro-interactions, 300ms for layout changes
- **Easing**: ease-in-out
- **Scale on Click**: active:scale-[0.98]

### Loading States
- Spinner: Navy-800 color, 2px border
- Skeleton: Slate-200 background with subtle pulse animation

## Usage Examples

### Dashboard KPI Row
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <KPICard title="On-Time %" value="94.2%" icon={<Clock />} />
  <KPICard title="Cost per Delivery" value="GHS 12.50" icon={<Fuel />} />
  <KPICard title="Average ETA" value="32 min" icon={<TrendingDown />} />
  <KPICard title="Total Routes" value="847" icon={<Route />} />
</div>
```

### Quick Filter Bar
```tsx
<div className="flex flex-wrap items-center gap-3">
  <Select options={statusOptions} placeholder="Status" />
  <Input type="date" placeholder="Date" />
  <Button variant="primary">Apply Filters</Button>
  <Button variant="ghost">Reset</Button>
</div>
```

### Empty State
```tsx
<EmptyState
  icon={<Package className="w-8 h-8" />}
  title="No orders yet"
  description="Start by creating your first order or importing from CSV"
  action={<Button variant="primary">Create Order</Button>}
/>
```

## Implementation Notes

1. **Import Components**: All UI components available in `/components/ui/enterprise.tsx`
2. **Tailwind Classes**: Use utility classes from updated `tailwind.config.js`
3. **Global Styles**: Base styles in `globals.css` with 8px grid helpers
4. **Responsive**: Mobile-first approach with lg: and md: breakpoints

## Files Modified

✅ `tailwind.config.js` - Color palette and design tokens
✅ `globals.css` - Component classes and utilities
✅ `components/ui/enterprise.tsx` - Full component library
✅ `app/dashboard/layout.tsx` - Professional dashboard shell
✅ `app/page.tsx` - Landing page with hero section
