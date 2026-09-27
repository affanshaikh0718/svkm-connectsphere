import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Calendar, MapPin } from 'lucide-react';

interface Experience {
  id: string;
  companyName: string;
  position: string;
  employmentType: string;
  location?: string;
  locationType?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  skills?: string[];
}

interface ExperienceCardProps {
  experiences: Experience[];
}

export function ExperienceCard({ experiences }: ExperienceCardProps) {
  if (!experiences || experiences.length === 0) return null;

  return (
    <Card className="mb-6 border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-primary" />
          Experience
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {experiences.map((exp, idx) => (
          <div key={exp.id} className="relative pl-6 border-l-2 border-border/60 last:border-l-0 pb-2">
            <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-primary" />
            <div className="space-y-1">
              <h4 className="font-semibold text-sm text-foreground">{exp.position}</h4>
              <p className="text-xs text-muted-foreground font-medium">
                {exp.companyName} • <span className="font-normal">{exp.employmentType.replace('_', ' ')}</span>
              </p>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} -{' '}
                  {exp.isCurrent ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                </span>
                {exp.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {exp.location} {exp.locationType ? `(${exp.locationType})` : ''}
                  </span>
                )}
              </div>
              {exp.description && (
                <p className="text-xs text-foreground/80 pt-2 whitespace-pre-line leading-relaxed">
                  {exp.description}
                </p>
              )}
              {exp.skills && exp.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                  {exp.skills.map((skill) => (
                    <span key={skill} className="px-2 py-0.5 rounded text-[10px] bg-secondary/60 text-secondary-foreground font-mono">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
