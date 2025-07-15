'use client';

import { CalendarIcon, CheckIcon, ClockIcon, UserIcon } from '#/components/icons';
import { Badge } from '#/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card';
import { cn } from '#/lib/utils';
import { motion } from 'framer-motion';

/**
 * Props for StructuredDataDisplay component
 */
interface StructuredDataDisplayProps {
  type: 'meeting-notes' | 'task-list' | 'key-info' | 'contact-info' | 'custom' | 'article';
  data: any;
  className?: string;
}

/**
 * Component for displaying structured data in various formatted layouts
 * @param type - Type of structured data to display
 * @param data - Data object to display
 * @param className - Additional CSS classes
 */
export function StructuredDataDisplay({ type, data, className }: StructuredDataDisplayProps) {
  if (!data) return null;

  const containerAnimation = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  };

  if (type === 'meeting-notes') {
    return (
      <motion.div {...containerAnimation} className={cn('space-y-4', className)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon />
              Meeting Notes
              {data.date && <Badge variant="outline">{data.date}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.title && (
              <div>
                <h3 className="text-lg font-semibold">{data.title}</h3>
              </div>
            )}

            {data.attendees && data.attendees.length > 0 && (
              <div>
                <h4 className="mb-2 flex items-center gap-1 font-medium">
                  <UserIcon />
                  Attendees
                </h4>
                <div className="flex flex-wrap gap-1">
                  {data.attendees.map((attendee: string) => (
                    <Badge key={`attendee-${attendee}`} variant="secondary">
                      {attendee}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {data.agenda && data.agenda.length > 0 && (
              <div>
                <h4 className="mb-2 font-medium">Agenda</h4>
                <ul className="space-y-1">
                  {data.agenda.map((item: string) => (
                    <li key={`agenda-${item.substring(0, 20)}`} className="flex items-start gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.keyDiscussions && data.keyDiscussions.length > 0 && (
              <div>
                <h4 className="mb-2 font-medium">Key Discussions</h4>
                <div className="space-y-2">
                  {data.keyDiscussions.map((discussion: string) => (
                    <div
                      key={`discussion-${discussion.substring(0, 20)}`}
                      className="rounded-lg bg-muted p-3"
                    >
                      {discussion}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.actionItems && data.actionItems.length > 0 && (
              <div>
                <h4 className="mb-2 font-medium">Action Items</h4>
                <div className="space-y-2">
                  {data.actionItems.map((item: any) => (
                    <div
                      key={`action-${item.task || item}-${item.assignee || 'unassigned'}`}
                      className="flex items-start gap-2 rounded border p-2"
                    >
                      <CheckIcon />
                      <div className="flex-1">
                        <p>{item.task || item}</p>
                        {item.assignee && (
                          <p className="text-sm text-muted-foreground">
                            Assigned to: {item.assignee}
                          </p>
                        )}
                        {item.deadline && (
                          <p className="text-sm text-muted-foreground">Due: {item.deadline}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (type === 'task-list') {
    return (
      <motion.div {...containerAnimation} className={cn('space-y-4', className)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckIcon />
              Task List
              {data.title && <span className="text-muted-foreground">- {data.title}</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.tasks && data.tasks.length > 0 && (
              <div className="space-y-3">
                {data.tasks.map((task: any) => (
                  <div
                    key={`task-${task.title || task.task || task}-${task.priority || 'no-priority'}`}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <div className="mt-1">
                      {task.priority === 'high' && (
                        <Badge variant="destructive" className="text-xs">
                          High
                        </Badge>
                      )}
                      {task.priority === 'medium' && (
                        <Badge variant="default" className="text-xs">
                          Medium
                        </Badge>
                      )}
                      {task.priority === 'low' && (
                        <Badge variant="secondary" className="text-xs">
                          Low
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{task.title || task.task || task}</h4>
                      {task.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                      )}
                      {task.estimatedTime && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                          <ClockIcon />
                          {task.estimatedTime}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (type === 'key-info') {
    return (
      <motion.div {...containerAnimation} className={cn('space-y-4', className)}>
        <Card>
          <CardHeader>
            <CardTitle>Key Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.summary && (
              <div>
                <h4 className="mb-2 font-medium">Summary</h4>
                <p className="text-muted-foreground">{data.summary}</p>
              </div>
            )}

            {data.keyPoints && data.keyPoints.length > 0 && (
              <div>
                <h4 className="mb-2 font-medium">Key Points</h4>
                <ul className="space-y-1">
                  {data.keyPoints.map((point: string) => (
                    <li
                      key={`keypoint-${point.substring(0, 20)}`}
                      className="flex items-start gap-2"
                    >
                      <span className="text-muted-foreground">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.sentiment && (
              <div>
                <h4 className="mb-2 font-medium">Sentiment</h4>
                <Badge
                  variant={
                    data.sentiment === 'positive'
                      ? 'default'
                      : data.sentiment === 'negative'
                        ? 'destructive'
                        : 'secondary'
                  }
                >
                  {data.sentiment}
                </Badge>
              </div>
            )}

            {data.topics && data.topics.length > 0 && (
              <div>
                <h4 className="mb-2 font-medium">Topics</h4>
                <div className="flex flex-wrap gap-1">
                  {data.topics.map((topic: string) => (
                    <Badge key={`topic-${topic}`} variant="outline">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (type === 'contact-info') {
    return (
      <motion.div {...containerAnimation} className={cn('space-y-4', className)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.contacts && data.contacts.length > 0 && (
              <div className="space-y-4">
                {data.contacts.map((contact: any) => (
                  <div
                    key={`contact-${contact.name || contact.email || 'unknown'}`}
                    className="space-y-2 rounded-lg border p-4"
                  >
                    {contact.name && <h4 className="font-semibold">{contact.name}</h4>}
                    {contact.email && (
                      <p className="text-sm">
                        <span className="font-medium">Email:</span> {contact.email}
                      </p>
                    )}
                    {contact.phone && (
                      <p className="text-sm">
                        <span className="font-medium">Phone:</span> {contact.phone}
                      </p>
                    )}
                    {contact.address && (
                      <p className="text-sm">
                        <span className="font-medium">Address:</span> {contact.address}
                      </p>
                    )}
                    {contact.company && (
                      <p className="text-sm">
                        <span className="font-medium">Company:</span> {contact.company}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (type === 'article') {
    return (
      <motion.div {...containerAnimation} className={cn('space-y-4', className)}>
        <Card>
          <CardHeader>
            <CardTitle>{data.title || 'Generated Article'}</CardTitle>
            {data.subtitle && <p className="text-muted-foreground">{data.subtitle}</p>}
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            {data.introduction && (
              <div className="mb-6">
                <h3 className="mb-2 text-lg font-semibold">Introduction</h3>
                <p>{data.introduction}</p>
              </div>
            )}

            {data.sections && data.sections.length > 0 && (
              <div className="space-y-6">
                {data.sections.map((section: any) => (
                  <div key={`section-${section.title || section.heading || 'untitled'}`}>
                    <h3 className="mb-2 text-lg font-semibold">
                      {section.title || section.heading}
                    </h3>
                    <p>{section.content}</p>
                  </div>
                ))}
              </div>
            )}

            {data.conclusion && (
              <div className="mt-6">
                <h3 className="mb-2 text-lg font-semibold">Conclusion</h3>
                <p>{data.conclusion}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Generic/custom data display
  return (
    <motion.div {...containerAnimation} className={cn('space-y-4', className)}>
      <Card>
        <CardHeader>
          <CardTitle>Structured Data</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-auto rounded-lg bg-muted p-4 text-sm">
            {JSON.stringify(data, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </motion.div>
  );
}
