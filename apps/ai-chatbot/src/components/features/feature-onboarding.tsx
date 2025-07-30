'use client';

import { Button } from '#/components/ui/button';
import { useAnimationSystem } from '#/hooks/ui/use-framer-motion';
import { isPrototypeMode } from '#/lib/prototype-mode';
import { BACKDROP_STYLES, Z_INDEX } from '#/lib/ui-constants';
import { useLocalStorage } from '@mantine/hooks';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Code2,
  Copy,
  Download,
  Edit3,
  Eye,
  FileText,
  Image,
  MapPin,
  MessageSquare,
  Mic,
  Palette,
  RefreshCw,
  Search,
  Sparkles,
  ThumbsUp,
  Upload,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Feature Callout Component
const FeatureCallout = ({
  children,
  label,
  position = 'top',
}: {
  children: React.ReactNode;
  label: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}) => {
  const { variants } = useAnimationSystem();

  return (
    <div className="group relative">
      {children}
      <motion.div
        variants={variants.bounceScaleVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.5 }}
        className={cx(
          'absolute z-10 flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground',
          'pointer-events-none',
          position === 'top' && '-top-2 left-1/2 -translate-x-1/2 -translate-y-full',
          position === 'bottom' && '-bottom-2 left-1/2 -translate-x-1/2 translate-y-full',
          position === 'left' && '-left-2 top-1/2 -translate-x-full -translate-y-1/2',
          position === 'right' && '-right-2 top-1/2 -translate-y-1/2 translate-x-full',
        )}
      >
        <MapPin className="h-3 w-3" />
        {label}
      </motion.div>
    </div>
  );
};

// Demo Components for each feature
const MessageActionsDemo = () => (
  <div className="space-y-3 rounded-lg border border-blue-200/50 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:border-blue-800/50 dark:from-blue-950/30 dark:to-indigo-950/30">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
      className="rounded-lg border bg-background p-3 shadow-sm"
    >
      <p className="mb-2 text-sm text-muted-foreground">Here&apos;s a React component example:</p>
      <div className="overflow-hidden rounded bg-slate-900 p-3 font-mono text-xs text-slate-100">
        <div className="mb-2 flex items-center gap-2 border-b border-slate-700 pb-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <div className="h-3 w-3 rounded-full bg-green-500" />
          <span className="ml-2 text-xs text-slate-400">component.tsx</span>
        </div>
        <span className="text-blue-400">function</span>{' '}
        <span className="text-yellow-300">Button</span>() {'{'}
        <br />
        &nbsp;&nbsp;<span className="text-purple-300">return</span>{' '}
        <span className="text-green-300">&lt;button&gt;Click me&lt;/button&gt;</span>;
        <br />
        {'}'}
      </div>
    </motion.div>
    <FeatureCallout label="Hover any AI message" position="top">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-center gap-2 rounded-lg border bg-background/80 p-2 backdrop-blur-sm"
      >
        <Button
          size="sm"
          variant="ghost"
          className="h-8 gap-1 hover:bg-blue-100 dark:hover:bg-blue-900/50"
        >
          <Copy className="h-3 w-3" />
          Copy
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 gap-1 hover:bg-green-100 dark:hover:bg-green-900/50"
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 gap-1 hover:bg-purple-100 dark:hover:bg-purple-900/50"
        >
          <ThumbsUp className="h-3 w-3" />
          Good
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 gap-1 hover:bg-orange-100 dark:hover:bg-orange-900/50"
        >
          <Download className="h-3 w-3" />
          Download
        </Button>
      </motion.div>
    </FeatureCallout>
  </div>
);

const SmartInputDemo = () => (
  <div className="space-y-3 rounded-lg bg-muted/50 p-4">
    <FeatureCallout label="Input toolbar" position="left">
      <div className="mb-3 flex items-center gap-2">
        <Button size="sm" variant="outline" className="h-7 gap-1">
          <Mic className="h-3 w-3" />
          Voice
        </Button>
        <Button size="sm" variant="outline" className="h-7 gap-1">
          <Palette className="h-3 w-3" />
          Creative
        </Button>
        <Button size="sm" variant="outline" className="h-7 gap-1">
          <Sparkles className="h-3 w-3" />
          Enhanced
        </Button>
      </div>
    </FeatureCallout>
    <FeatureCallout label="Bottom of chat" position="bottom">
      <div className="relative">
        <textarea
          className="w-full resize-none rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-3 text-sm dark:border-purple-700 dark:from-purple-950/20 dark:to-pink-950/20"
          placeholder="✨ Express your creativity..."
          rows={2}
          readOnly
        />
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">0/2000</div>
      </div>
    </FeatureCallout>
  </div>
);

const FileUploadDemo = () => (
  <div className="rounded-lg bg-muted/50 p-4">
    <FeatureCallout label="Drag & drop or click to upload" position="top">
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: FileText, name: 'document.pdf', size: '2.1 MB', status: 'complete' },
          { icon: Image, name: 'image.png', size: '856 KB', status: 'uploading' },
          { icon: Code2, name: 'script.js', size: '12.3 KB', status: 'complete' },
        ].map((file, _i) => {
          const Icon = file.icon;
          return (
            <div
              key={`file-${file.name}`}
              className="relative rounded-lg border bg-background p-3 text-center"
            >
              <Icon className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
              <p className="truncate text-xs font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">{file.size}</p>
              {file.status === 'uploading' && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80">
                  <div className="text-xs text-blue-600">75%</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </FeatureCallout>
  </div>
);

const LiveEditingDemo = () => (
  <div className="space-y-3 rounded-lg bg-muted/50 p-4">
    <FeatureCallout label="Right panel when editing" position="right">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">React Component</span>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          <span className="text-xs text-green-600">Saved</span>
        </div>
      </div>
    </FeatureCallout>
    <div className="rounded border bg-background p-2 font-mono text-xs">
      <div className="text-slate-500">// Live editing in action</div>
      <div>
        <span className="text-blue-500">export</span>{' '}
        <span className="text-purple-500">function</span> MyComponent() {'{'}
      </div>
      <div className="pl-4">
        <span className="text-purple-500">return</span>{' '}
        <span className="text-green-500">&lt;div&gt;Hello World&lt;/div&gt;</span>;
      </div>
      <div>{'}'}</div>
    </div>
    <div className="text-xs text-muted-foreground">Version 3 of 3 • Auto-saved 2 seconds ago</div>
  </div>
);

const NavigationDemo = () => (
  <div className="space-y-3 rounded-lg bg-muted/50 p-4">
    <FeatureCallout label="Left sidebar" position="left">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full rounded-md border bg-background py-2 pl-8 pr-3 text-xs"
            placeholder="Search conversations..."
            readOnly
          />
        </div>
        <Button size="sm" variant="outline" className="h-8 gap-1">
          Today
        </Button>
      </div>
    </FeatureCallout>
    <div className="space-y-1">
      {['How to use React hooks?', 'JavaScript best practices', 'Building a todo app'].map(
        (title, _i) => (
          <div
            key={`nav-${title}`}
            className="rounded border bg-background p-2 text-xs transition-colors hover:bg-muted/50"
          >
            {title}
          </div>
        ),
      )}
    </div>
  </div>
);

const OverviewDemo = () => {
  const { variants } = useAnimationSystem();

  return (
    <div className="space-y-4 rounded-lg border border-purple-200/50 bg-gradient-to-br from-purple-50 to-pink-50 p-4 dark:border-purple-800/50 dark:from-purple-950/30 dark:to-pink-950/30">
      <motion.div
        className="grid grid-cols-2 gap-3"
        variants={variants.staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {[
          { icon: MessageSquare, label: 'Rich Messages', color: 'text-blue-500' },
          { icon: Mic, label: 'Voice Input', color: 'text-green-500' },
          { icon: Upload, label: 'File Uploads', color: 'text-orange-500' },
          { icon: Edit3, label: 'Live Editing', color: 'text-purple-500' },
        ].map((item, _i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              variants={variants.slideUpVariants}
              whileHover={{ scale: 1.05, y: -2 }}
              className="rounded-lg border bg-background/80 p-3 text-center shadow-sm backdrop-blur-sm transition-all hover:shadow-md"
            >
              <Icon className={cx('mx-auto mb-2 h-8 w-8', item.color)} />
              <p className="text-xs font-medium">{item.label}</p>
            </motion.div>
          );
        })}
      </motion.div>
      <div className="text-center">
        <motion.div
          variants={variants.pulseVariants}
          animate="pulse"
          className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 to-purple-500/10 px-4 py-2 text-sm text-primary"
        >
          <Sparkles className="h-4 w-4" />
          Enhanced AI Chatbot Experience
        </motion.div>
      </div>
    </div>
  );
};

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  feature: string;
  tips: string[];
  demoComponent?: React.ReactNode;
}

export function FeatureOnboarding() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useLocalStorage({
    key: 'feature-onboarding-completed',
    defaultValue: false,
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { variants } = useAnimationSystem();
  const prototypeMode = isPrototypeMode();

  useEffect(() => {
    if (!hasSeenOnboarding) {
      // Show onboarding after a short delay
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenOnboarding]);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Your Enhanced AI Chatbot!',
      description:
        'Experience a modern, feature-rich AI chat interface with beautiful interactions.',
      icon: Sparkles,
      feature: 'overview',
      tips: [
        'Rich message rendering with markdown and code highlighting',
        'Interactive message actions and smart suggestions',
        'Advanced input with voice simulation and themes',
        'Professional animations and smooth transitions',
      ],
      demoComponent: <OverviewDemo />,
    },
    {
      id: 'rich-messages',
      title: 'Rich Message Interactions',
      description: 'Every message is interactive with copy, retry, vote, and more actions.',
      icon: MessageSquare,
      feature: 'messages',
      tips: [
        'Copy AI responses with one click',
        'Retry generation for better answers',
        'Vote on response quality to help improve',
        'Share interesting conversations',
        'Syntax highlighting for code blocks',
        'Download or preview code examples',
      ],
      demoComponent: <MessageActionsDemo />,
    },
    {
      id: 'smart-input',
      title: 'Advanced Input System',
      description: 'Type, speak, or switch themes - your input, your way.',
      icon: Mic,
      feature: 'input',
      tips: [
        'Voice input simulation with visual feedback',
        'Switch between creative, professional, and default themes',
        'Smart typing detection and character counting',
        'Enhanced input mode with auto-suggestions',
        'Contextual suggested actions with categories',
        'Real-time input validation and hints',
      ],
      demoComponent: <SmartInputDemo />,
    },
    {
      id: 'file-uploads',
      title: 'Smart File Handling',
      description: 'Upload files with beautiful progress tracking and interactive previews.',
      icon: Upload,
      feature: 'files',
      tips: [
        'Drag and drop files directly into chat',
        'Real-time upload progress with status indicators',
        'File type detection with appropriate icons',
        'Preview, download, or remove uploaded files',
        'Support for images, documents, and code files',
        'Hover actions for quick file management',
      ],
      demoComponent: <FileUploadDemo />,
    },
    {
      id: 'live-editing',
      title: 'Live Document Editing',
      description: 'Edit AI-generated documents in real-time with version control.',
      icon: Edit3,
      feature: 'artifacts',
      tips: [
        'Edit code, text, and documents directly in chat',
        'Real-time save status with visual feedback',
        'Version history with easy navigation',
        'Diff view to see changes between versions',
        'Collaborative editing experience',
        'Auto-save with progress indicators',
      ],
      demoComponent: <LiveEditingDemo />,
    },
    {
      id: 'smart-navigation',
      title: 'Intelligent Chat Management',
      description: 'Find any conversation instantly with powerful search and filtering.',
      icon: Search,
      feature: 'navigation',
      tips: [
        'Search through all your conversations instantly',
        'Filter chats by date, category, or content',
        'Sort by newest, oldest, or alphabetically',
        'Smart grouping by time periods',
        'Quick access to recent and important chats',
        'Smooth animations for every interaction',
      ],
      demoComponent: <NavigationDemo />,
    },
  ];

  const handleComplete = () => {
    setHasSeenOnboarding(true);
    setIsVisible(false);
  };

  const handleSkip = () => {
    setHasSeenOnboarding(true);
    setIsVisible(false);
  };

  const goToNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const goToPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <AnimatePresence>
      <motion.div
        variants={variants.overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`fixed inset-0 z-[${Z_INDEX.MODAL_BACKDROP}] flex items-center justify-center p-4 ${BACKDROP_STYLES.HEAVY}`}
      >
        <motion.div
          variants={variants.modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={`w-full max-w-lg overflow-hidden rounded-xl border border-border/50 bg-background/95 shadow-2xl backdrop-blur-xl z-[${Z_INDEX.MODAL}]`}
        >
          {/* Header */}
          <div className="border-b p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cx(
                    'flex h-12 w-12 items-center justify-center rounded-lg',
                    'bg-primary/10',
                  )}
                >
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{currentStepData.title}</h2>
                  <div className="mt-0.5 flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      Step {currentStep + 1} of {steps.length}
                    </p>
                    {prototypeMode && (
                      <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        <Sparkles className="h-3 w-3" />
                        Prototype Mode
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <motion.div
                variants={variants.hoverVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
              >
                <Button variant="ghost" size="sm" onClick={handleSkip} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="mb-6 text-muted-foreground">{currentStepData.description}</p>

            {/* Demo Component */}
            {currentStepData.demoComponent && (
              <motion.div
                variants={variants.slideUpVariants}
                initial="hidden"
                animate="visible"
                className="mb-6"
              >
                <div className="mb-3 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {prototypeMode ? 'Try it yourself (Mock Mode):' : 'Try it yourself:'}
                  </span>
                  {prototypeMode && (
                    <div className="ml-auto rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-700">
                      Demo Mode
                    </div>
                  )}
                </div>
                {currentStepData.demoComponent}
              </motion.div>
            )}

            {/* Tips */}
            <motion.div
              className="mb-6 space-y-3"
              variants={variants.staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {currentStepData.tips.map((tip, _index) => (
                <motion.div
                  key={`${currentStepData.id}-tip-${tip.substring(0, 20)}`}
                  variants={variants.slideRightVariants}
                  className="flex items-start gap-3"
                >
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <p className="text-sm">{tip}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Progress */}
            <div className="mb-6 flex gap-1">
              {steps.map((step, index) => (
                <div
                  key={`progress-${step.id}`}
                  className={cx(
                    'h-1 flex-1 rounded-full transition-colors',
                    index <= currentStep ? 'bg-primary' : 'bg-muted',
                  )}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-6">
            {prototypeMode && (
              <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/20">
                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-medium">Prototype Mode Active:</span>
                  <span>Features shown with mock data for demonstration purposes.</span>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <motion.div
                variants={variants.hoverVariants}
                initial="rest"
                whileHover={currentStep === 0 ? 'rest' : 'hover'}
                whileTap={currentStep === 0 ? 'rest' : 'tap'}
              >
                <Button
                  variant="ghost"
                  onClick={goToPrevious}
                  disabled={currentStep === 0}
                  className={cx('gap-2', currentStep === 0 && 'invisible')}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
              </motion.div>

              <div className="flex gap-2">
                <motion.div
                  variants={variants.hoverVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button variant="outline" onClick={handleSkip}>
                    Skip Tour
                  </Button>
                </motion.div>
                <motion.div
                  variants={variants.hoverVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button onClick={goToNext} className="gap-2">
                    {currentStep === steps.length - 1 ? (
                      <>
                        Get Started
                        <Check className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
