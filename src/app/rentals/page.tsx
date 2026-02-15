'use client';

import { useState, useEffect } from 'react';
import { useRole } from '@/lib/role-context';
import { getRentals, addRental, updateRental, getCustomRentalPricing, setCustomRentalPricing } from '@/lib/store';
import {
  RENTAL_CATEGORIES, RENTAL_PRICING, PICKUP_LOCATIONS,
  RentalBooking, RentalDuration, PickupLocation, RentalStatus, RentalPricing,
} from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Package, Guitar, Wind, Drum, Piano, Mic2, Settings2, Save } from 'lucide-react';

function genCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

const DURATION_LABELS: Record<RentalDuration, string> = {
  daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', semester: 'Semester (4 months)',
};

const STATUS_COLORS: Record<RentalStatus, string> = {
  pending: 'bg-yellow-600/20 text-yellow-400',
  picked_up: 'bg-blue-600/20 text-blue-400',
  returned: 'bg-green-600/20 text-green-400',
  cancelled: 'bg-red-600/20 text-red-400',
};

export default function RentalsPage() {
  const { role } = useRole();
  const [rentals, setRentals] = useState<RentalBooking[]>([]);
  const [tab, setTab] = useState<'catalog' | 'book' | 'pricing' | 'admin' | 'history'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedInstrument, setSelectedInstrument] = useState<string>('');
  const [duration, setDuration] = useState<RentalDuration>('monthly');
  const [startDate, setStartDate] = useState('');
  const [renterName, setRenterName] = useState('');
  const [renterEmail, setRenterEmail] = useState('');
  const [renterPhone, setRenterPhone] = useState('');
  const [isStudent, setIsStudent] = useState(false);
  const [pickupLocation, setPickupLocation] = useState<PickupLocation>('centennial');
  const [successBooking, setSuccessBooking] = useState<RentalBooking | null>(null);
  const [customPricing, setCustomPricingState] = useState<Record<string, RentalPricing>>({});
  const [pricingSaved, setPricingSaved] = useState(false);

  useEffect(() => {
    setRentals(getRentals());
    const custom = getCustomRentalPricing();
    setCustomPricingState(custom || { ...RENTAL_PRICING });
  }, []);

  const refresh = () => setRentals(getRentals());

  const categoryInstruments = RENTAL_CATEGORIES.find(c => c.name === selectedCategory)?.instruments || [];
  const activePricing = { ...RENTAL_PRICING, ...customPricing };
  const pricing = selectedInstrument ? activePricing[selectedInstrument] : null;
  const currentPrice = pricing ? pricing[duration] : 0;

  function handlePricingChange(instrument: string, field: RentalDuration, value: number) {
    setCustomPricingState(prev => ({
      ...prev,
      [instrument]: { ...(prev[instrument] || RENTAL_PRICING[instrument]), [field]: value },
    }));
  }

  function savePricing() {
    setCustomRentalPricing(customPricing);
    setPricingSaved(true);
    setTimeout(() => setPricingSaved(false), 2000);
  }

  function handleBook() {
    if (!selectedInstrument || !startDate || !renterName || !renterEmail || !renterPhone) return;
    const booking: RentalBooking = {
      id: crypto.randomUUID(),
      confirmationCode: `EMC-${genCode()}`,
      instrument: selectedInstrument,
      category: selectedCategory,
      duration,
      startDate,
      renterName, renterEmail, renterPhone,
      isStudent,
      pickupLocation,
      price: currentPrice,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    addRental(booking);
    setSuccessBooking(booking);
    refresh();
    // Reset form
    setSelectedInstrument('');
    setRenterName(''); setRenterEmail(''); setRenterPhone('');
    setStartDate(''); setIsStudent(false);
  }

  function handleStatusChange(id: string, status: RentalStatus) {
    const r = rentals.find(x => x.id === id);
    if (r) { updateRental({ ...r, status }); refresh(); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Instrument Rentals</h1>
        <p className="text-muted-foreground mt-1">Rent band, orchestra, percussion instruments and more</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['catalog', 'book', ...(role === 'admin' ? ['pricing', 'admin'] : []), 'history'] as const).map(t => (
          <Button key={t} variant={tab === t ? 'default' : 'outline'} size="sm" onClick={() => setTab(t as any)}>
            {t === 'catalog' ? 'Catalog' : t === 'book' ? 'Book a Rental' : t === 'pricing' ? '⚙️ Pricing' : t === 'admin' ? 'Admin' : 'My History'}
          </Button>
        ))}
      </div>

      {/* Catalog */}
      {tab === 'catalog' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {RENTAL_CATEGORIES.map(cat => (
            <Card key={cat.name}>
              <CardHeader className="pb-3">
                <CardTitle className="text-primary text-lg">{cat.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {cat.instruments.map(inst => {
                    const p = activePricing[inst];
                    return (
                      <div key={inst} className="flex justify-between items-center text-sm">
                        <span>{inst}</span>
                        <span className="text-muted-foreground">${p?.daily}/day · ${p?.monthly}/mo</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pricing (Admin only) */}
      {tab === 'pricing' && role === 'admin' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Adjust rental rates per instrument. Changes apply to the catalog and booking form.</p>
            <div className="flex items-center gap-2">
              {pricingSaved && <span className="text-sm text-green-400">✓ Saved!</span>}
              <Button onClick={savePricing} size="sm"><Save className="h-4 w-4 mr-1" /> Save Pricing</Button>
            </div>
          </div>
          {RENTAL_CATEGORIES.map(cat => (
            <Card key={cat.name}>
              <CardHeader className="pb-2"><CardTitle className="text-primary text-base">{cat.name}</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-5 gap-2 text-xs text-muted-foreground font-medium">
                    <span>Instrument</span><span>Daily ($)</span><span>Weekly ($)</span><span>Monthly ($)</span><span>Semester ($)</span>
                  </div>
                  {cat.instruments.map(inst => {
                    const p = customPricing[inst] || RENTAL_PRICING[inst] || { daily: 0, weekly: 0, monthly: 0, semester: 0 };
                    return (
                      <div key={inst} className="grid grid-cols-5 gap-2 items-center">
                        <span className="text-sm">{inst}</span>
                        {(['daily', 'weekly', 'monthly', 'semester'] as RentalDuration[]).map(dur => (
                          <Input
                            key={dur}
                            type="number"
                            min={0}
                            value={p[dur]}
                            onChange={e => handlePricingChange(inst, dur, Number(e.target.value))}
                            className="h-8 text-sm"
                          />
                        ))}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Book */}
      {tab === 'book' && (
        <Card className="max-w-2xl">
          <CardHeader><CardTitle>Book a Rental</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <select
                  className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={selectedCategory}
                  onChange={e => { setSelectedCategory(e.target.value); setSelectedInstrument(''); }}
                >
                  <option value="">Select category...</option>
                  {RENTAL_CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <Label>Instrument</Label>
                <select
                  className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={selectedInstrument}
                  onChange={e => setSelectedInstrument(e.target.value)}
                  disabled={!selectedCategory}
                >
                  <option value="">Select instrument...</option>
                  {categoryInstruments.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Rental Duration</Label>
                <select
                  className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={duration}
                  onChange={e => setDuration(e.target.value as RentalDuration)}
                >
                  {(Object.keys(DURATION_LABELS) as RentalDuration[]).map(d => (
                    <option key={d} value={d}>{DURATION_LABELS[d]}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1" />
              </div>
            </div>

            {pricing && (
              <div className="rounded-lg bg-primary/10 border border-primary/30 p-3 text-center">
                <span className="text-lg font-bold text-primary">${currentPrice}</span>
                <span className="text-muted-foreground ml-1">/ {duration}</span>
                {isStudent && <span className="block text-xs text-primary mt-1">🎓 EMC student discount may apply at checkout</span>}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div><Label>Full Name</Label><Input value={renterName} onChange={e => setRenterName(e.target.value)} className="mt-1" /></div>
              <div><Label>Email</Label><Input type="email" value={renterEmail} onChange={e => setRenterEmail(e.target.value)} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Phone</Label><Input type="tel" value={renterPhone} onChange={e => setRenterPhone(e.target.value)} className="mt-1" /></div>
              <div className="flex items-end gap-2 pb-1">
                <input type="checkbox" id="student-check" checked={isStudent} onChange={e => setIsStudent(e.target.checked)} className="rounded" />
                <Label htmlFor="student-check">I am a current EMC student</Label>
              </div>
            </div>

            <div>
              <Label>Pickup Location</Label>
              <div className="mt-2 space-y-2">
                {(['centennial', 'golden'] as PickupLocation[]).map(loc => (
                  <label key={loc} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="location" checked={pickupLocation === loc} onChange={() => setPickupLocation(loc)} />
                    <span className="text-sm"><strong className="capitalize">{loc}</strong> — {PICKUP_LOCATIONS[loc]}</span>
                  </label>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">No payment required online. Pay in person at pickup.</p>

            <Button
              onClick={handleBook}
              disabled={!selectedInstrument || !startDate || !renterName || !renterEmail || !renterPhone}
              className="w-full"
            >
              Book Rental
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Admin */}
      {tab === 'admin' && role === 'admin' && (
        <div className="space-y-3">
          {rentals.length === 0 && <p className="text-muted-foreground">No rental bookings yet.</p>}
          {rentals.map(r => (
            <Card key={r.id}>
              <CardContent className="py-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{r.instrument} <Badge className={STATUS_COLORS[r.status]}>{r.status.replace('_', ' ')}</Badge></p>
                  <p className="text-sm text-muted-foreground">{r.renterName} · {r.confirmationCode} · ${r.price}/{r.duration}</p>
                  <p className="text-xs text-muted-foreground">Pickup: {PICKUP_LOCATIONS[r.pickupLocation]} · Starts: {r.startDate}</p>
                </div>
                <div className="flex gap-2">
                  {r.status === 'pending' && <Button size="sm" onClick={() => handleStatusChange(r.id, 'picked_up')}>Mark Picked Up</Button>}
                  {r.status === 'picked_up' && <Button size="sm" onClick={() => handleStatusChange(r.id, 'returned')}>Mark Returned</Button>}
                  {r.status !== 'cancelled' && r.status !== 'returned' && (
                    <Button size="sm" variant="outline" onClick={() => handleStatusChange(r.id, 'cancelled')}>Cancel</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* History */}
      {tab === 'history' && (
        <div className="space-y-3">
          {rentals.length === 0 && <p className="text-muted-foreground">No rental history.</p>}
          {rentals.map(r => (
            <Card key={r.id}>
              <CardContent className="py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{r.instrument} <Badge className={STATUS_COLORS[r.status]}>{r.status.replace('_', ' ')}</Badge></p>
                    <p className="text-sm text-muted-foreground">Code: {r.confirmationCode} · ${r.price}/{r.duration} · {r.startDate}</p>
                    <p className="text-xs text-muted-foreground">{r.renterName} · {PICKUP_LOCATIONS[r.pickupLocation]}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Success Dialog */}
      <Dialog open={!!successBooking} onOpenChange={() => setSuccessBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🎉 Congratulations on your booking!</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 pt-2">
                <p>Here&apos;s your unique ID:</p>
                <p className="text-2xl font-bold text-primary text-center">{successBooking?.confirmationCode}</p>
                <p>Bring it to the store and we&apos;ll have your rental ready for you. Please provide payment in person.</p>
                <div className="rounded-lg bg-primary/10 p-3 text-sm">
                  <p className="font-semibold">Pickup Location:</p>
                  <p>{successBooking?.pickupLocation && PICKUP_LOCATIONS[successBooking.pickupLocation]}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>{successBooking?.instrument} · {successBooking?.duration && DURATION_LABELS[successBooking.duration]} · ${successBooking?.price}</p>
                  <p>Start: {successBooking?.startDate}</p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </div>
  );
}
