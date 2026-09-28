'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight, Bell, Sparkles } from 'lucide-react';

const NEWSLETTERS = [
  {
    id: '1',
    title: 'SVKM Placement & Career Insider',
    author: 'SVKM Central Placement Cell',
    subscribers: '12,400',
    frequency: 'Weekly on Thursdays',
    description: 'Exclusive placement drives, interview patterns from top tech recruiters, and CTC statistics across SVKM institutes.',
  },
  {
    id: '2',
    title: 'Campus Tech & Innovation Pulse',
    author: 'MPSTME ACM & IEEE Student Chapter',
    subscribers: '8,150',
    frequency: 'Bi-weekly on Tuesdays',
    description: 'Deep dives into engineering student projects, upcoming hackathons, AI research papers, and open-source opportunities.',
  },
  {
    id: '3',
    title: 'NMIMS Alumni Leadership Dispatch',
    author: 'SVKM Alumni Association',
    subscribers: '19,800',
    frequency: 'Monthly',
    description: 'Career journeys, venture capital stories, and executive mentorship columns written by accomplished SVKM alumni globally.',
  },
];

export default function NewslettersPage() {
  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 space-y-6">
      <div className="bg-card border border-border/60 p-6 rounded-xl shadow-xs">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          SVKM Newsletters
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Stay informed with curated campus publications, placement reviews, and technical journals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {NEWSLETTERS.map((newsletter) => (
          <Card key={newsletter.id} className="border-border/60 shadow-xs flex flex-col justify-between">
            <CardContent className="pt-5 space-y-3">
              <div>
                <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {newsletter.frequency}
                </span>
                <h3 className="font-bold text-sm mt-2 text-foreground">
                  {newsletter.title}
                </h3>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  Published by {newsletter.author}
                </p>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {newsletter.description}
              </p>

              <div className="pt-2 flex items-center justify-between border-t border-border/40">
                <span className="text-[11px] text-muted-foreground">
                  {newsletter.subscribers} subscribers
                </span>
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  <Bell className="h-3 w-3 mr-1" />
                  Subscribe
                </Button>
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
