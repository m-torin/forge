'use client';

import type { UserType } from '#/app/(auth)/auth';
import {
  CalendarIcon,
  CheckIcon,
  CodeIcon,
  FileIcon,
  ImageIcon,
  LinkIcon,
  SearchIcon,
  SparklesIcon,
  UserIcon,
} from '#/components/icons';
import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip';
import { cn } from '#/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain, Database } from 'lucide-react';
import { useState } from 'react';

interface AIFeaturesPanelProps {
  userType: UserType;
  onFeatureSelect: (prompt: string) => void;
  className?: string;
}

const FEATURE_CATEGORIES = {
  'Knowledge Base': {
    icon: Brain,
    color: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800',
    features: [
      {
        name: 'Ask Knowledge Base',
        icon: Brain,
        prompt:
          'Search my knowledge base and answer questions using stored documents and information.',
        userTypes: ['regular'],
        description: 'Get answers from your personal knowledge base',
      },
      {
        name: 'Add to Knowledge',
        icon: Database,
        prompt: 'Add this information to my knowledge base for future reference.',
        userTypes: ['regular'],
        description: 'Store documents and information for later use',
      },
      {
        name: 'Knowledge Summary',
        icon: FileIcon,
        prompt: 'Summarize what information is currently in my knowledge base.',
        userTypes: ['regular'],
        description: 'Overview of stored knowledge and documents',
      },
    ],
  },
  'Structured Data': {
    icon: CheckIcon,
    color: 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800',
    features: [
      {
        name: 'Meeting Notes',
        icon: CalendarIcon,
        prompt:
          'Please structure my meeting notes into organized sections with attendees, agenda, key discussions, and action items.',
        userTypes: ['regular'],
        description: 'Convert messy notes into clean meeting summaries',
      },
      {
        name: 'Task List',
        icon: CheckIcon,
        prompt:
          'Generate a prioritized task list with estimated times from my project description.',
        userTypes: ['guest', 'regular'],
        description: 'Create organized to-do lists with priorities',
      },
      {
        name: 'Extract Key Info',
        icon: SparklesIcon,
        prompt: 'Extract the key information, main points, and sentiment from this text.',
        userTypes: ['guest', 'regular'],
        description: 'Summarize important details from any content',
      },
      {
        name: 'Contact Info',
        icon: UserIcon,
        prompt:
          'Extract all contact information (names, emails, phones, addresses) from this text.',
        userTypes: ['regular'],
        description: 'Pull contact details from documents',
      },
    ],
  },
  'Image Generation': {
    icon: ImageIcon,
    color: 'bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800',
    features: [
      {
        name: 'Generate Image',
        icon: ImageIcon,
        prompt: 'Generate a high-quality image based on my description.',
        userTypes: ['guest', 'regular'],
        description: 'Create images from text descriptions',
      },
      {
        name: 'Technical Diagram',
        icon: CodeIcon,
        prompt: 'Create a technical diagram or flowchart to visualize this concept.',
        userTypes: ['regular'],
        description: 'Build flowcharts and technical visuals',
      },
      {
        name: 'Illustration',
        icon: SparklesIcon,
        prompt: 'Create an artistic illustration for my content with a specific style and mood.',
        userTypes: ['regular'],
        description: 'Generate custom artistic illustrations',
      },
    ],
  },
  'Research & Analysis': {
    icon: SearchIcon,
    color: 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800',
    features: [
      {
        name: 'Web Search',
        icon: SearchIcon,
        prompt: 'Search the web for current information about this topic.',
        userTypes: ['regular'],
        description: 'Get real-time information from the internet',
      },
      {
        name: 'Code Analysis',
        icon: CodeIcon,
        prompt: 'Analyze this code and provide insights, suggestions, or explanations.',
        userTypes: ['regular'],
        description: 'Get detailed code reviews and explanations',
      },
      {
        name: 'Document Processing',
        icon: FileIcon,
        prompt: 'Process and analyze this document for key insights.',
        userTypes: ['regular'],
        description: 'Extract insights from uploaded files',
      },
    ],
  },
};

export function AIFeaturesPanel({ userType, onFeatureSelect, className }: AIFeaturesPanelProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const getAvailableFeatures = (features: any[]) => {
    return features.filter(feature => feature.userTypes.includes(userType));
  };

  const isPremiumFeature = (feature: any) => {
    return feature.userTypes.includes('regular') && !feature.userTypes.includes('guest');
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="mb-4 flex items-center gap-2">
        <SparklesIcon size={16} />
        <h3 className="text-sm font-medium">AI Features</h3>
        <Badge variant="outline" className="text-xs">
          {userType === 'regular' ? 'Regular' : 'Guest'}
        </Badge>
      </div>

      {Object.entries(FEATURE_CATEGORIES).map(([categoryName, category]) => {
        const availableFeatures = getAvailableFeatures(category.features);
        if (availableFeatures.length === 0) return null;

        const isExpanded = expandedCategory === categoryName;
        const CategoryIcon = category.icon;

        return (
          <Card key={categoryName} className={cn('overflow-hidden', category.color)}>
            <CardHeader
              className={cn(
                'cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5',
                isExpanded ? 'pb-2' : 'pb-6',
              )}
              onClick={() => toggleCategory(categoryName)}
            >
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CategoryIcon size={14} />
                  {categoryName}
                  <Badge variant="secondary" className="text-xs">
                    {availableFeatures.length}
                  </Badge>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  ▼
                </motion.div>
              </CardTitle>
            </CardHeader>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CardContent className="space-y-2 pt-0">
                    {availableFeatures.map((feature, index) => {
                      const FeatureIcon = feature.icon;
                      const isDisabled = isPremiumFeature(feature) && userType !== 'regular';
                      const isLast = index === availableFeatures.length - 1;

                      return (
                        <Tooltip key={feature.id}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                'h-auto w-full justify-start p-3 text-left',
                                isDisabled && 'cursor-not-allowed opacity-50',
                                isLast && 'pb-1',
                              )}
                              disabled={isDisabled}
                              onClick={() => {
                                if (!isDisabled) {
                                  onFeatureSelect(feature.prompt);
                                }
                              }}
                            >
                              <div className="flex w-full items-start gap-3">
                                <div className="mt-0.5 flex-shrink-0">
                                  <FeatureIcon size={16} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div
                                    className={cn('mb-1 flex items-center gap-2', isLast && 'mb-0')}
                                  >
                                    <span className="text-xs font-medium">{feature.name}</span>
                                    {isPremiumFeature(feature) && (
                                      <Badge variant="outline" className="text-xs">
                                        Regular+
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="line-clamp-2 text-xs text-muted-foreground">
                                    {feature.description}
                                  </p>
                                </div>
                              </div>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-xs">
                            <p>{feature.description}</p>
                            {isDisabled && (
                              <p className="mt-1 text-yellow-400">
                                Register an account to access this feature
                              </p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        );
      })}

      {/* Quick Access Section */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 dark:border-blue-800 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <LinkIcon size={14} />
            Quick Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs"
            onClick={() =>
              onFeatureSelect(
                'What can you help me with today? Show me some examples of what you can do.',
              )
            }
          >
            <div className="mr-2">
              <SparklesIcon size={14} />
            </div>
            Explore AI Capabilities
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs"
            onClick={() => onFeatureSelect('Help me get started with using AI tools effectively.')}
          >
            <div className="mr-2">
              <CheckIcon size={14} />
            </div>
            Getting Started Guide
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
