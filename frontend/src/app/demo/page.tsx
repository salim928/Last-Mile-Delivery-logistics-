'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  MapPin,
  Package,
  Truck,
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  Navigation,
  Fuel,
  Route,
  Zap,
  Star,
  ArrowRight,
  X,
  Rocket,
  Shield,
  HeadphonesIcon,
  Gift,
  Building2,
  Phone,
  Mail,
  User,
  Loader2
} from 'lucide-react';

// Lazy load heavy chart component (entire recharts module)
const ComparisonChart = dynamic<{ data: Array<{ metric: string; before: number; after: number }> }>(
  () => import('./ComparisonChart').then(mod => mod.default),
  { 
    ssr: false, 
    loading: () => <div className="h-64 bg-gray-100 dark:bg-gray-700 animate-pulse rounded" /> 
  }
);

// Realistic Accra Addresses Database
const ACCRA_ADDRESSES = [
  // Osu Area
  { id: 'osu-1', address: '12 Oxford Street, Osu', area: 'Osu', lat: 5.5560, lng: -0.1789, type: 'commercial' },
  { id: 'osu-2', address: 'Osu RE, Near Papaye', area: 'Osu', lat: 5.5570, lng: -0.1795, type: 'restaurant' },
  { id: 'osu-3', address: 'Labone Junction', area: 'Osu', lat: 5.5590, lng: -0.1810, type: 'residential' },
  { id: 'osu-4', address: 'Danquah Circle', area: 'Osu', lat: 5.5545, lng: -0.1775, type: 'commercial' },
  
  // East Legon
  { id: 'el-1', address: 'East Legon A&C Mall', area: 'East Legon', lat: 5.6350, lng: -0.1580, type: 'commercial' },
  { id: 'el-2', address: 'Boundary Road, East Legon', area: 'East Legon', lat: 5.6380, lng: -0.1620, type: 'residential' },
  { id: 'el-3', address: 'American House, East Legon', area: 'East Legon', lat: 5.6320, lng: -0.1550, type: 'residential' },
  { id: 'el-4', address: 'Trassaco Valley', area: 'East Legon', lat: 5.6400, lng: -0.1500, type: 'residential' },
  
  // Airport Residential
  { id: 'ar-1', address: 'Airport Residential Area', area: 'Airport', lat: 5.6050, lng: -0.1730, type: 'residential' },
  { id: 'ar-2', address: 'Liberation Road, Airport', area: 'Airport', lat: 5.5980, lng: -0.1780, type: 'commercial' },
  { id: 'ar-3', address: 'Kotoka Airport Area', area: 'Airport', lat: 5.6100, lng: -0.1680, type: 'commercial' },
  
  // Cantonments
  { id: 'ct-1', address: 'Cantonments, Near Embassy', area: 'Cantonments', lat: 5.5680, lng: -0.1720, type: 'residential' },
  { id: 'ct-2', address: 'Josif Tito Avenue', area: 'Cantonments', lat: 5.5700, lng: -0.1750, type: 'residential' },
  { id: 'ct-3', address: 'Switchback Road', area: 'Cantonments', lat: 5.5650, lng: -0.1690, type: 'residential' },
  
  // Tema
  { id: 'tema-1', address: 'Community 1, Tema', area: 'Tema', lat: 5.6698, lng: -0.0166, type: 'residential' },
  { id: 'tema-2', address: 'Tema Industrial Area', area: 'Tema', lat: 5.6650, lng: -0.0200, type: 'commercial' },
  { id: 'tema-3', address: 'Tema Harbour Road', area: 'Tema', lat: 5.6720, lng: -0.0100, type: 'commercial' },
  { id: 'tema-4', address: 'Community 11, Tema', area: 'Tema', lat: 5.6780, lng: -0.0250, type: 'residential' },
  
  // Madina
  { id: 'mad-1', address: 'Madina Zongo Junction', area: 'Madina', lat: 5.6800, lng: -0.1650, type: 'commercial' },
  { id: 'mad-2', address: 'Atomic Junction', area: 'Madina', lat: 5.6550, lng: -0.1850, type: 'commercial' },
  { id: 'mad-3', address: 'West Legon', area: 'Madina', lat: 5.6450, lng: -0.2050, type: 'residential' },
  
  // Accra Central
  { id: 'ac-1', address: 'Makola Market', area: 'Accra Central', lat: 5.5500, lng: -0.2100, type: 'commercial' },
  { id: 'ac-2', address: 'Kwame Nkrumah Circle', area: 'Accra Central', lat: 5.5520, lng: -0.2200, type: 'commercial' },
  { id: 'ac-3', address: 'Independence Square', area: 'Accra Central', lat: 5.5450, lng: -0.1950, type: 'landmark' },
  
  // Dansoman
  { id: 'dan-1', address: 'Dansoman High Street', area: 'Dansoman', lat: 5.5350, lng: -0.2600, type: 'commercial' },
  { id: 'dan-2', address: 'Dansoman Roundabout', area: 'Dansoman', lat: 5.5380, lng: -0.2550, type: 'commercial' },
  
  // Spintex
  { id: 'sp-1', address: 'Spintex Road, Batsonaa', area: 'Spintex', lat: 5.6300, lng: -0.1100, type: 'commercial' },
  { id: 'sp-2', address: 'Spintex, Palace Mall', area: 'Spintex', lat: 5.6350, lng: -0.1050, type: 'commercial' },
  { id: 'sp-3', address: 'Spintex, Manet Junction', area: 'Spintex', lat: 5.6280, lng: -0.1150, type: 'residential' },
];

// Demo Orders
const generateDemoOrders = () => {
  const statuses = ['pending', 'picked_up', 'in_transit', 'delivered'];
  const products = ['Electronics', 'Fashion Items', 'Food Package', 'Documents', 'Home Goods', 'Medicine', 'Groceries'];
  
  return ACCRA_ADDRESSES.slice(0, 25).map((addr, i) => ({
    id: `ORD-${String(i + 1).padStart(4, '0')}`,
    trackingId: `LMP${Date.now().toString(36).toUpperCase()}${i}`,
    recipient: ['Kwame Asante', 'Ama Serwaa', 'Kofi Mensah', 'Akua Boateng', 'Yaw Owusu', 'Nana Aba', 'Emmanuel Addo'][i % 7],
    phone: `+233 ${20 + (i % 10)} ${String(100 + i * 3).padStart(3, '0')} ${String(1000 + i * 7).padStart(4, '0')}`,
    address: addr.address,
    area: addr.area,
    lat: addr.lat,
    lng: addr.lng,
    product: products[i % products.length],
    status: statuses[Math.min(i % 4, 3)],
    isCOD: i % 3 === 0,
    codAmount: i % 3 === 0 ? 50 + (i * 10) : 0,
    createdAt: new Date(Date.now() - i * 3600000).toISOString()
  }));
};

// Demo Riders
const DEMO_RIDERS = [
  { id: 'r1', name: 'Kwesi Mensah', rating: 4.8, vehicle: 'motorcycle', deliveries: 156, zone: 'Osu-East Legon' },
  { id: 'r2', name: 'Ama Darko', rating: 4.9, vehicle: 'motorcycle', deliveries: 203, zone: 'Airport-Cantonments' },
  { id: 'r3', name: 'Kofi Owusu', rating: 4.7, vehicle: 'bicycle', deliveries: 98, zone: 'Madina-Atomic' },
  { id: 'r4', name: 'Yaw Asante', rating: 4.6, vehicle: 'motorcycle', deliveries: 187, zone: 'Tema' },
  { id: 'r5', name: 'Nana Adu', rating: 4.8, vehicle: 'van', deliveries: 245, zone: 'Accra Central' },
];

// Optimization Results
const OPTIMIZATION_RESULTS = {
  before: {
    totalDistance: 156.8,
    estimatedTime: 8.5,
    fuelCost: 280,
    routes: 8
  },
  after: {
    totalDistance: 118.2,
    estimatedTime: 6.2,
    fuelCost: 198,
    routes: 5
  },
  savings: {
    distance: 24.6, // percentage
    time: 27.1, // percentage
    fuel: 29.3, // percentage
    routes: 37.5 // percentage
  }
};

// Demo Steps with detailed explanations
const DEMO_STEPS = [
  {
    id: 'orders',
    title: 'Order Import',
    description: 'Import 25 orders across Greater Accra',
    icon: Package,
    explanation: 'Orders imported from CSV, API, or manual entry. Each order includes recipient details, delivery address, and COD amount if applicable.',
    highlight: 'Supports CSV upload, API integration, and manual entry'
  },
  {
    id: 'geocoding',
    title: 'Address Geocoding',
    description: 'Convert Ghana addresses to coordinates',
    icon: MapPin,
    explanation: 'Converting local Ghana addresses like "Osu Oxford Street" or "East Legon A&C Mall" into GPS coordinates for accurate routing.',
    highlight: 'Works with landmarks, street names, and local references'
  },
  {
    id: 'optimization',
    title: 'Route Optimization',
    description: 'AI-powered route planning',
    icon: Route,
    explanation: 'Our algorithm analyzes traffic patterns, distance, and delivery windows to create the most efficient routes - saving up to 30% on fuel.',
    highlight: 'Powered by Google OR-Tools optimization engine'
  },
  {
    id: 'assignment',
    title: 'Rider Assignment',
    description: 'Intelligent zone-based dispatch',
    icon: Users,
    explanation: 'Riders are assigned based on their zones, vehicle capacity, and current workload. Each rider gets optimized routes for their assigned deliveries.',
    highlight: 'Balances workload across your entire fleet'
  },
  {
    id: 'results',
    title: 'View Results',
    description: 'See optimization impact',
    icon: TrendingUp,
    explanation: 'Compare before vs after metrics: distance traveled, time saved, fuel costs, and number of routes needed.',
    highlight: 'Real savings you can measure and track'
  }
];

export default function DemoPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [showOptimization, setShowOptimization] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showPilotForm, setShowPilotForm] = useState(false);
  const [pilotFormData, setPilotFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    fleetSize: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [remainingSpots, setRemainingSpots] = useState(10);
  
  // WhatsApp number for direct contact
  const WHATSAPP_NUMBER = '233557553975';

  // Fetch pilot stats on mount
  useEffect(() => {
    fetch('/api/pilots/stats')
      .then(res => res.json())
      .then(data => {
        if (data.remaining_spots !== undefined) {
          setRemainingSpots(data.remaining_spots);
        }
      })
      .catch(() => {
        // Keep default 10 spots if fetch fails
      });
  }, []);

  // Memoize generated orders to prevent re-computation
  const demoOrders = useMemo(() => generateDemoOrders(), []);

  // Memoize comparison data for charts
  const comparisonData = useMemo(() => [
    { metric: 'Distance (km)', before: OPTIMIZATION_RESULTS.before.totalDistance, after: OPTIMIZATION_RESULTS.after.totalDistance },
    { metric: 'Time (hrs)', before: OPTIMIZATION_RESULTS.before.estimatedTime, after: OPTIMIZATION_RESULTS.after.estimatedTime },
    { metric: 'Fuel (GH₵)', before: OPTIMIZATION_RESULTS.before.fuelCost, after: OPTIMIZATION_RESULTS.after.fuelCost },
    { metric: 'Routes', before: OPTIMIZATION_RESULTS.before.routes, after: OPTIMIZATION_RESULTS.after.routes },
  ], []);

  // Memoize handlers to prevent unnecessary re-renders
  const handleNextStep = useCallback(() => {
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);

    switch (nextStep) {
      case 1: // Orders imported
        setOrders(demoOrders);
        break;
      case 2: // Geocoding done
        break;
      case 3: // Optimization
        setShowOptimization(true);
        setOptimizationProgress(0);
        break;
      case 4: // Results
        setShowResults(true);
        break;
    }
  }, [currentStep, demoOrders]);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    setOrders([]);
    setShowOptimization(false);
    setOptimizationProgress(0);
    setShowResults(false);
    setShowPilotForm(false);
    setSubmitSuccess(false);
  }, []);

  const handleStartDemo = useCallback(() => {
    handleReset();
    setIsPlaying(true);
    setOrders(demoOrders);
    setCurrentStep(1);
  }, [handleReset, demoOrders]);

  // Auto-play demo
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentStep < DEMO_STEPS.length - 1) {
        handleNextStep();
      } else {
        setIsPlaying(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, handleNextStep]);

  // Optimization animation
  useEffect(() => {
    if (showOptimization && optimizationProgress < 100) {
      const timer = setTimeout(() => {
        setOptimizationProgress(prev => Math.min(prev + 5, 100));
      }, 100);
      return () => clearTimeout(timer);
    }
    if (optimizationProgress === 100) {
      setTimeout(() => {
        setShowOptimization(false);
        setShowResults(true);
      }, 500);
    }
  }, [showOptimization, optimizationProgress]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🇬🇭</span>
            <div>
              <h1 className="font-bold text-xl bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Movva Demo
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Experience Route Optimization</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Exit Demo
            </button>
            <button
              onClick={() => router.push('/register')}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Sign Up Free
            </button>
          </div>
        </div>
      </header>

      {/* Demo Controls */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Progress Steps */}
            <div className="flex items-center gap-2">
              {DEMO_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                        isActive 
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' 
                          : isCompleted 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive && 'animate-pulse'}`} />
                      <span className="text-sm font-medium hidden md:inline">{step.title}</span>
                    </div>
                    {index < DEMO_STEPS.length - 1 && (
                      <ArrowRight className="w-4 h-4 mx-1 text-gray-300 dark:text-gray-600" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Control Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Reset Demo"
              >
                <RotateCcw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isPlaying 
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                    : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    {currentStep === 0 ? 'Start Demo' : 'Resume'}
                  </>
                )}
              </button>
              {!isPlaying && currentStep < DEMO_STEPS.length - 1 && currentStep > 0 && (
                <button
                  onClick={handleNextStep}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  <SkipForward className="w-4 h-4" />
                  Next Step
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Initial State */}
        {currentStep === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Zap className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to the Movva Demo
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Experience how our AI-powered route optimization can save your delivery business 
              up to 30% in fuel costs and delivery time across Greater Accra.
            </p>
            <button
              onClick={handleStartDemo}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <Play className="w-6 h-6" />
              Start Interactive Demo
            </button>
            
            {/* Feature Preview */}
            <div className="grid md:grid-cols-3 gap-6 mt-16">
              {[
                { icon: MapPin, title: 'Ghana Address Support', desc: 'Works with local addresses, landmarks, and GPS coordinates' },
                { icon: Route, title: 'Smart Optimization', desc: 'OR-Tools powered route planning saves 20-30% on each route' },
                { icon: Truck, title: 'Multi-rider Support', desc: 'Intelligent zone-based assignment for your entire fleet' }
              ].map((feature, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                  <feature.icon className="w-10 h-10 text-orange-500 mb-4" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Imported */}
        {currentStep >= 1 && (
          <div className="space-y-6">
            {/* Current Step Explanation Banner */}
            {currentStep < 5 && (
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white animate-fadeIn">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    {(() => {
                      const StepIcon = DEMO_STEPS[currentStep - 1]?.icon || Package;
                      return <StepIcon className="w-7 h-7" />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                        Step {currentStep} of 5
                      </span>
                      <h3 className="text-xl font-bold">
                        {DEMO_STEPS[currentStep - 1]?.title}
                      </h3>
                    </div>
                    <p className="text-orange-100 mb-3">
                      {DEMO_STEPS[currentStep - 1]?.explanation}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="font-medium">{DEMO_STEPS[currentStep - 1]?.highlight}</span>
                    </div>
                  </div>
                  {/* Step Progress Dots */}
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <div
                        key={step}
                        className={`w-3 h-3 rounded-full transition-all ${
                          step < currentStep 
                            ? 'bg-white' 
                            : step === currentStep 
                              ? 'bg-white animate-pulse' 
                              : 'bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Stats Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{orders.length}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Orders</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {new Set(orders.map(o => o.area)).size}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Areas</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{DEMO_RIDERS.length}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Riders</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <DollarSign className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      GH₵ {orders.filter(o => o.isCOD).reduce((sum, o) => sum + o.codAmount, 0)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">COD Total</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder + Orders List */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Map */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-orange-500" />
                    Delivery Map - Greater Accra
                  </h3>
                  {/* Step-specific map status */}
                  <span className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                    {currentStep === 1 && '📦 Plotting delivery points...'}
                    {currentStep === 2 && '📍 GPS coordinates confirmed'}
                    {currentStep === 3 && '🔄 Calculating optimal routes...'}
                    {currentStep === 4 && '🏍️ Assigning to riders...'}
                    {currentStep >= 5 && '✅ Routes optimized!'}
                  </span>
                </div>
                <div className="relative h-96 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-700 dark:to-gray-600">
                  {/* Simulated Map Background */}
                  <div className="absolute inset-0 opacity-30">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-400" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#mapGrid)" />
                    </svg>
                  </div>

                  {/* Zone Labels (shown during step 3+) */}
                  {currentStep >= 3 && (
                    <>
                      <div className="absolute top-4 left-4 text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded">Osu</div>
                      <div className="absolute top-4 right-4 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">East Legon</div>
                      <div className="absolute top-1/3 left-1/4 text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">Airport</div>
                      <div className="absolute bottom-1/3 right-1/4 text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">Tema</div>
                    </>
                  )}
                  
                  {/* Order Markers */}
                  {orders.slice(0, 15).map((order, i) => {
                    // Position markers across the map area
                    const x = 10 + (i % 5) * 18;
                    const y = 10 + Math.floor(i / 5) * 25;
                    
                    // Marker color based on step
                    const getMarkerColor = () => {
                      if (currentStep === 1) return 'bg-blue-500'; // Just imported
                      if (currentStep === 2) return 'bg-green-500'; // Geocoded
                      if (currentStep >= 4) {
                        // Color by zone (rider assignment)
                        const colors = ['bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'];
                        const zoneIndex = ['Osu', 'East Legon', 'Airport', 'Cantonments', 'Tema'].indexOf(order.area);
                        return colors[zoneIndex % colors.length];
                      }
                      return 'bg-orange-500';
                    };
                    
                    return (
                      <div
                        key={order.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
                        style={{ 
                          left: `${x}%`, 
                          top: `${y}%`,
                          animationDelay: `${i * 100}ms`
                        }}
                      >
                        <div className={`relative ${currentStep === 1 ? 'animate-fadeIn' : ''} ${currentStep === 2 ? 'animate-pulse' : ''}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-colors duration-300 ${getMarkerColor()}`}>
                            {currentStep === 2 ? (
                              <MapPin className="w-4 h-4 text-white" />
                            ) : (
                              <Package className="w-4 h-4 text-white" />
                            )}
                          </div>
                          {currentStep === 2 && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center animate-fadeIn">
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            </div>
                          )}
                          {showResults && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Route Lines (shown during step 3+ and after optimization) */}
                  {(currentStep >= 3 || showResults) && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <path
                        d="M 10% 10% Q 30% 20%, 50% 15% T 90% 25%"
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="3"
                        strokeDasharray="8 4"
                        className="animate-dash"
                      />
                      <path
                        d="M 15% 35% Q 40% 45%, 60% 40% T 85% 50%"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        strokeDasharray="8 4"
                        className="animate-dash"
                      />
                      <path
                        d="M 20% 60% Q 45% 70%, 65% 65% T 80% 75%"
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="3"
                        strokeDasharray="8 4"
                        className="animate-dash"
                      />
                    </svg>
                  )}

                  {/* Legend - Step Aware */}
                  <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 text-sm">
                    {currentStep <= 2 && (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${currentStep === 1 ? 'bg-blue-500' : 'bg-green-500'}`} />
                          <span className="text-gray-600 dark:text-gray-400">
                            {currentStep === 1 ? 'Imported' : 'Geocoded'}
                          </span>
                        </div>
                      </div>
                    )}
                    {currentStep >= 3 && (
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Routes:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-orange-500 rounded-full" />
                          <span className="text-gray-600 dark:text-gray-400 text-xs">Osu</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full" />
                          <span className="text-gray-600 dark:text-gray-400 text-xs">E. Legon</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full" />
                          <span className="text-gray-600 dark:text-gray-400 text-xs">Airport</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full" />
                          <span className="text-gray-600 dark:text-gray-400 text-xs">Tema</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Orders List / Step Details Panel */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {currentStep === 1 && '📦 Imported Orders'}
                    {currentStep === 2 && '📍 Geocoded Addresses'}
                    {currentStep === 3 && '🛣️ Route Planning'}
                    {currentStep === 4 && '🏍️ Rider Assignments'}
                    {currentStep >= 5 && '✅ Delivery Routes'}
                  </h3>
                </div>
                
                {/* Step 1: Orders List */}
                {currentStep === 1 && (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-96 overflow-y-auto">
                    {orders.slice(0, 8).map((order, i) => (
                      <div 
                        key={order.id} 
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors animate-fadeIn"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{order.recipient}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{order.address}</p>
                          </div>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            New
                          </span>
                        </div>
                        {order.isCOD && (
                          <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
                            💰 COD: GH₵ {order.codAmount}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Step 2: Geocoded Addresses */}
                {currentStep === 2 && (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-96 overflow-y-auto">
                    {orders.slice(0, 8).map((order, i) => (
                      <div 
                        key={order.id} 
                        className="p-4 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{order.address}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-green-600 dark:text-green-400 font-mono bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                                {order.lat.toFixed(4)}, {order.lng.toFixed(4)}
                              </span>
                            </div>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-green-500 animate-fadeIn" style={{ animationDelay: `${i * 150}ms` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Step 3 & 4: Grouped by Zone */}
                {(currentStep === 3 || currentStep === 4) && (
                  <div className="max-h-96 overflow-y-auto p-4 space-y-3">
                    {['Osu', 'East Legon', 'Airport', 'Cantonments', 'Tema'].map((zone, i) => {
                      const zoneOrders = orders.filter(o => o.area === zone);
                      if (zoneOrders.length === 0) return null;
                      return (
                        <div 
                          key={zone} 
                          className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 animate-fadeIn"
                          style={{ animationDelay: `${i * 200}ms` }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900 dark:text-white text-sm">{zone}</span>
                            <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-full">
                              {zoneOrders.length} orders
                            </span>
                          </div>
                          {currentStep === 4 && DEMO_RIDERS[i % DEMO_RIDERS.length] && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <div className="w-5 h-5 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {DEMO_RIDERS[i % DEMO_RIDERS.length].name.charAt(0)}
                              </div>
                              <span>Assigned to {DEMO_RIDERS[i % DEMO_RIDERS.length].name}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Step 5+: Final Routes */}
                {currentStep >= 5 && !showResults && (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-96 overflow-y-auto">
                    {orders.slice(0, 8).map(order => (
                      <div key={order.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{order.recipient}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{order.address}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            order.status === 'delivered' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : order.status === 'in_transit'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                          }`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>
                        {order.isCOD && (
                          <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
                            COD: GH₵ {order.codAmount}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Optimization Modal */}
            {showOptimization && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-lg w-full">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <Route className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Optimizing Routes...
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Analyzing {orders.length} orders across {new Set(orders.map(o => o.area)).size} delivery zones
                    </p>
                  </div>
                  
                  {/* What's Happening */}
                  <div className="space-y-3 mb-6">
                    {[
                      { label: 'Calculating distances between stops', done: optimizationProgress > 20 },
                      { label: 'Analyzing traffic patterns', done: optimizationProgress > 40 },
                      { label: 'Grouping deliveries by zone', done: optimizationProgress > 60 },
                      { label: 'Optimizing route sequences', done: optimizationProgress > 80 },
                      { label: 'Assigning to available riders', done: optimizationProgress >= 100 },
                    ].map((task, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                          task.done 
                            ? 'bg-green-500' 
                            : optimizationProgress > i * 20 
                              ? 'bg-orange-500 animate-pulse' 
                              : 'bg-gray-200 dark:bg-gray-600'
                        }`}>
                          {task.done ? (
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          ) : optimizationProgress > i * 20 ? (
                            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                          ) : null}
                        </div>
                        <span className={`text-sm transition-colors ${
                          task.done 
                            ? 'text-green-600 dark:text-green-400 font-medium' 
                            : optimizationProgress > i * 20
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-gray-400'
                        }`}>
                          {task.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-amber-500 h-3 rounded-full transition-all duration-100"
                      style={{ width: `${optimizationProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                    {optimizationProgress}% complete
                  </p>
                </div>
              </div>
            )}

            {/* Results Section */}
            {showResults && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">Optimization Complete!</h2>
                  </div>
                  <p className="text-green-100 mb-6">
                    We've optimized your routes and achieved significant savings across all metrics.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/20 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold">{OPTIMIZATION_RESULTS.savings.distance}%</p>
                      <p className="text-sm text-green-100">Distance Saved</p>
                    </div>
                    <div className="bg-white/20 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold">{OPTIMIZATION_RESULTS.savings.time}%</p>
                      <p className="text-sm text-green-100">Time Saved</p>
                    </div>
                    <div className="bg-white/20 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold">{OPTIMIZATION_RESULTS.savings.fuel}%</p>
                      <p className="text-sm text-green-100">Fuel Saved</p>
                    </div>
                    <div className="bg-white/20 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold">{OPTIMIZATION_RESULTS.savings.routes}%</p>
                      <p className="text-sm text-green-100">Fewer Routes</p>
                    </div>
                  </div>
                </div>

                {/* Comparison Chart */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      Before vs After Optimization
                    </h3>
                    <div className="h-64">
                      <ComparisonChart data={comparisonData} />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-500" />
                      Optimized Rider Assignments
                    </h3>
                    <div className="space-y-3">
                      {DEMO_RIDERS.map((rider, i) => (
                        <div key={rider.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold">
                            {rider.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{rider.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{rider.zone}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900 dark:text-white">{4 + i} stops</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{20 + i * 5} km</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CTA - Request Pilot Access */}
                {!showPilotForm && !submitSuccess && (
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-8 text-center text-white">
                    {/* Limited Spots Badge */}
                    {remainingSpots <= 10 && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-4">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        Only {remainingSpots} pilot spots remaining
                      </div>
                    )}
                    <h2 className="text-2xl font-bold mb-3">Ready to Optimize Your Deliveries?</h2>
                    <p className="text-orange-100 mb-6 max-w-xl mx-auto">
                      Join our exclusive pilot program — limited to 10 founding partners in Ghana.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <button
                        onClick={() => setShowPilotForm(true)}
                        className="px-8 py-3 bg-white text-orange-600 rounded-xl font-semibold hover:shadow-xl transition-all flex items-center gap-2"
                      >
                        <Rocket className="w-5 h-5" />
                        Request Pilot Access
                      </button>
                      <a
                        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi! I just watched the Movva demo and I\'m interested in the pilot program.')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-3 bg-[#25D366] text-white rounded-xl font-semibold hover:shadow-xl transition-all flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Chat on WhatsApp
                      </a>
                    </div>
                    <button
                      onClick={handleReset}
                      className="mt-4 text-sm text-orange-100 hover:text-white transition-colors"
                    >
                      ↻ Run Demo Again
                    </button>
                  </div>
                )}

                {/* Pilot Access Form */}
                {showPilotForm && !submitSuccess && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Form Header with Benefits */}
                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Rocket className="w-6 h-6" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold">Request Pilot Access</h2>
                            <p className="text-orange-100">Join Ghana's smartest logistics platform</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowPilotForm(false)}
                          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      
                      {/* Benefits Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                        {[
                          { icon: Gift, title: '3 Months Free', desc: 'Full platform access' },
                          { icon: HeadphonesIcon, title: 'Dedicated Support', desc: 'Direct founder access' },
                          { icon: Shield, title: 'Lock-in Pricing', desc: 'Pilot rates forever' },
                          { icon: Zap, title: 'Priority Features', desc: 'Shape the roadmap' },
                        ].map((benefit, i) => (
                          <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                            <benefit.icon className="w-6 h-6 mx-auto mb-2" />
                            <p className="font-semibold text-sm">{benefit.title}</p>
                            <p className="text-xs text-orange-100">{benefit.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Form Body */}
                    <div className="p-6">
                      {submitError && (
                        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                          {submitError}
                        </div>
                      )}
                      <form 
                        onSubmit={async (e) => {
                          e.preventDefault();
                          setIsSubmitting(true);
                          setSubmitError('');
                          
                          try {
                            const response = await fetch('/api/pilots/apply', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                name: pilotFormData.name,
                                email: pilotFormData.email,
                                company: pilotFormData.company,
                                phone: pilotFormData.phone,
                                fleet_size: pilotFormData.fleetSize,
                                challenges: pilotFormData.message || undefined,
                              }),
                            });
                            
                            const data = await response.json();
                            
                            if (response.ok && data.success) {
                              setSubmitSuccess(true);
                              // Update remaining spots
                              setRemainingSpots(prev => Math.max(0, prev - 1));
                            } else {
                              // Handle validation errors
                              if (data.errors) {
                                const errorMessages = Object.values(data.errors).flat().join(' ');
                                setSubmitError(errorMessages || 'Please check your information and try again.');
                              } else {
                                setSubmitError(data.message || 'Something went wrong. Please try again.');
                              }
                            }
                          } catch (error) {
                            setSubmitError('Network error. Please check your connection and try again.');
                          } finally {
                            setIsSubmitting(false);
                          }
                        }}
                        className="space-y-4"
                      >
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Your Name *
                            </label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input
                                type="text"
                                required
                                value={pilotFormData.name}
                                onChange={(e) => setPilotFormData({ ...pilotFormData, name: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                placeholder="Kwame Asante"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Business Email *
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input
                                type="email"
                                required
                                value={pilotFormData.email}
                                onChange={(e) => setPilotFormData({ ...pilotFormData, email: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                placeholder="kwame@company.com"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Company Name *
                            </label>
                            <div className="relative">
                              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input
                                type="text"
                                required
                                value={pilotFormData.company}
                                onChange={(e) => setPilotFormData({ ...pilotFormData, company: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                placeholder="Your Logistics Company"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Phone Number *
                            </label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input
                                type="tel"
                                required
                                value={pilotFormData.phone}
                                onChange={(e) => setPilotFormData({ ...pilotFormData, phone: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                placeholder="+233 20 123 4567"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Fleet Size *
                          </label>
                          <div className="relative">
                            <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                              required
                              value={pilotFormData.fleetSize}
                              onChange={(e) => setPilotFormData({ ...pilotFormData, fleetSize: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none"
                            >
                              <option value="">How many delivery riders/vehicles?</option>
                              <option value="1-5">1-5 riders</option>
                              <option value="6-15">6-15 riders</option>
                              <option value="16-50">16-50 riders</option>
                              <option value="51-100">51-100 riders</option>
                              <option value="100+">100+ riders</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            What challenges do you face? (optional)
                          </label>
                          <textarea
                            value={pilotFormData.message}
                            onChange={(e) => setPilotFormData({ ...pilotFormData, message: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                            placeholder="Tell us about your current delivery operations and challenges..."
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Rocket className="w-5 h-5" />
                              Request Pilot Access
                            </>
                          )}
                        </button>

                        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                          We'll review your application and get back to you within 24 hours.
                        </p>
                      </form>
                    </div>
                  </div>
                )}

                {/* Success State */}
                {submitSuccess && (
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-center text-white">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3">Application Received! 🎉</h2>
                    <p className="text-green-100 mb-6 max-w-xl mx-auto">
                      Thank you for your interest in Movva! We'll review your application and reach out within 24 hours.
                    </p>
                    
                    {/* WhatsApp Quick Connect */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 max-w-md mx-auto">
                      <p className="text-sm text-green-100 mb-3">Want to chat right away?</p>
                      <a
                        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi! I'm ${pilotFormData.name} from ${pilotFormData.company}. I just submitted my pilot application for Movva!`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-xl font-semibold hover:shadow-xl transition-all"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Message Salim on WhatsApp
                      </a>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <button
                        onClick={handleReset}
                        className="px-8 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-all"
                      >
                        Run Demo Again
                      </button>
                      <button
                        onClick={() => router.push('/')}
                        className="px-8 py-3 bg-white text-green-600 rounded-xl font-semibold hover:shadow-xl transition-all"
                      >
                        Back to Home
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -100;
          }
        }
        .animate-dash {
          animation: dash 3s linear infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
