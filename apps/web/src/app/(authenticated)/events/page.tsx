'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, ArrowRight, Clock } from 'lucide-react';

const EVENTS = [
  {
    id: '1',
    title: 'SVKM Annual Tech Symposium & Hackathon 2026',
    date: 'Oct 14 - 15, 2026',
    time: '09:00 AM - 06:00 PM IST',
    location: 'Bhaidas Hall & MPSTME Campus, Vile Parle, Mumbai',
    attendees: '1,200+ registered',
    tag: 'Flagship Event',
    description: '36-hour inter-college hackathon with sponsor challenges from Google, Microsoft, and leading fintech startups.',
  },
  {
    id: '2',
    title: 'FinTech Leadership & Quantitative Finance Conclave',
    date: 'Oct 22, 2026',
    time: '02:00 PM - 05:30 PM IST',
    location: 'NMIMS Auditorium / Hybrid Virtual Stream',
    attendees: '450 registered',
    tag: 'Speaker Session',
    description: 'Panel discussions with SVKM alumni working in Goldman Sachs, Morgan Stanley, and Quant hedge funds.',
  },
  {
    id: '3',
    title: 'Alumni-Student Mock Interview & Resume Clinic',
    date: 'Nov 02, 2026',
    time: '10:00 AM - 04:00 PM IST',
    location: 'Virtual 1-on-1 Sessions',
    attendees: '280 slots available',
    tag: 'Career Mentorship',
    description: 'Get your resume critiqued and practice coding/system design rounds with senior software engineers from alumni network.',
  },
];

export default function EventsPage() {
  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 space-y-6">
      <div className="bg-card border border-border/60 p-6 rounded-xl shadow-xs">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Campus Events & Seminars
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Explore upcoming SVKM conferences, engineering hackathons, and alumni networking meetups.
        </p>
      </div>

      <div className="space-y-4">
        {EVENTS.map((event) => (
          <Card key={event.id} className="border-border/60 shadow-xs">
            <CardContent className="pt-5 pb-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {event.tag}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {event.date} • {event.time}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-foreground">
                    {event.title}
                  </h3>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      {event.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      {event.attendees}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <Button size="sm" className="text-xs">
                    Register Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center py-6">
        <Link href="/home">
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
            Back to Home Feed <ArrowRight className="ml-1.5 h-3 w-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
