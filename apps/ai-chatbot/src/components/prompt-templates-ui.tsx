'use client';

import { Button } from '#/components/ui/button';
import { BACKDROP_STYLES, Z_INDEX } from '#/lib/ui-constants';
import { useDisclosure, useLocalStorage } from '@mantine/hooks';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  Briefcase,
  Code,
  Edit3,
  FileText,
  Lightbulb,
  Lock,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  Unlock,
  X,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  category: 'general' | 'coding' | 'writing' | 'analysis' | 'creative' | 'business' | 'custom';
  tags: string[];
  variables: PromptVariable[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

interface PromptVariable {
  name: string;
  description: string;
  defaultValue?: string;
  required: boolean;
}

interface PromptTemplatesUIProps {
  onUseTemplate: (template: PromptTemplate, variables: Record<string, string>) => void;
  className?: string;
}

export function PromptTemplatesUI({ onUseTemplate, className }: PromptTemplatesUIProps) {
  const [templates, setTemplates] = useLocalStorage<PromptTemplate[]>({
    key: 'prompt-templates',
    defaultValue: getDefaultTemplates(),
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [isCreating, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  const categories = [
    { id: 'general', label: 'General', icon: MessageSquare, color: 'text-gray-500' },
    { id: 'coding', label: 'Coding', icon: Code, color: 'text-blue-500' },
    { id: 'writing', label: 'Writing', icon: BookOpen, color: 'text-green-500' },
    { id: 'analysis', label: 'Analysis', icon: Briefcase, color: 'text-purple-500' },
    { id: 'creative', label: 'Creative', icon: Lightbulb, color: 'text-yellow-500' },
    { id: 'business', label: 'Business', icon: Briefcase, color: 'text-indigo-500' },
    { id: 'custom', label: 'Custom', icon: Sparkles, color: 'text-pink-500' },
  ];

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch =
      searchQuery.toLowerCase() === '' ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = !selectedCategory || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className={cx('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Prompt Templates</h3>
        </div>
        <Button size="sm" onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() =>
                  setSelectedCategory(selectedCategory === category.id ? null : category.id)
                }
                className={cx(
                  'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors',
                  selectedCategory === category.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80',
                )}
              >
                <Icon className="h-3 w-3" />
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map(template => (
          <TemplateCard
            key={template.id}
            template={template}
            onSelect={() => setSelectedTemplate(template)}
            onEdit={() => setIsEditing(template.id)}
            onDelete={() => {
              setTemplates(prev => prev.filter(t => t.id !== template.id));
            }}
          />
        ))}
      </div>

      {/* Create/Edit Template Modal */}
      <AnimatePresence>
        {(isCreating || isEditing) && (
          <TemplateEditor
            template={isEditing ? templates.find(t => t.id === isEditing) : undefined}
            onSave={template => {
              if (isEditing) {
                setTemplates(prev => prev.map(t => (t.id === template.id ? template : t)));
              } else {
                setTemplates(prev => [...prev, template]);
              }
              closeCreate();
              setIsEditing(null);
            }}
            onClose={() => {
              closeCreate();
              setIsEditing(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Use Template Modal */}
      <AnimatePresence>
        {selectedTemplate && (
          <UseTemplateModal
            template={selectedTemplate}
            onUse={variables => {
              onUseTemplate(selectedTemplate, variables);
              // Update usage count
              setTemplates(prev =>
                prev.map(t =>
                  t.id === selectedTemplate.id ? { ...t, usageCount: t.usageCount + 1 } : t,
                ),
              );
              setSelectedTemplate(null);
            }}
            onClose={() => setSelectedTemplate(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Template Card Component
function TemplateCard({
  template,
  onSelect,
  onEdit,
  onDelete,
}: {
  template: PromptTemplate;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [showActions, setShowActions] = useState(false);

  const categoryConfig = {
    general: { icon: MessageSquare, color: 'text-gray-500' },
    coding: { icon: Code, color: 'text-blue-500' },
    writing: { icon: BookOpen, color: 'text-green-500' },
    analysis: { icon: Briefcase, color: 'text-purple-500' },
    creative: { icon: Lightbulb, color: 'text-yellow-500' },
    business: { icon: Briefcase, color: 'text-indigo-500' },
    custom: { icon: Sparkles, color: 'text-pink-500' },
  };

  const config = categoryConfig[template.category];
  const Icon = config.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className="group relative cursor-pointer"
      onClick={onSelect}
    >
      <div className="rounded-lg border bg-background p-4 transition-all hover:border-primary/50">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={cx('rounded-lg bg-muted p-2', config.color)}>
              <Icon className="h-4 w-4" />
            </div>
            {template.isPrivate && <Lock className="h-3 w-3 text-muted-foreground" />}
          </div>

          {/* Actions */}
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1"
                onClick={e => e.stopPropagation()}
              >
                <Button variant="ghost" size="sm" onClick={onEdit} className="h-7 w-7 p-0">
                  <Edit3 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="h-7 w-7 p-0 text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content */}
        <h4 className="mb-1 font-medium">{template.name}</h4>
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{template.description}</p>

        {/* Tags */}
        {template.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"
              >
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
            {template.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">+{template.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{template.variables.length} variables</span>
          <span>{template.usageCount} uses</span>
        </div>
      </div>
    </motion.div>
  );
}

// Template Editor Modal
function TemplateEditor({
  template,
  onSave,
  onClose,
}: {
  template?: PromptTemplate;
  onSave: (template: PromptTemplate) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<Partial<PromptTemplate>>(
    template || {
      name: '',
      description: '',
      content: '',
      category: 'general',
      tags: [],
      variables: [],
      isPrivate: false,
    },
  );

  const [tagInput, setTagInput] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[${Z_INDEX.MODAL_BACKDROP}] flex items-center justify-center p-4 ${BACKDROP_STYLES.HEAVY}`}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border bg-background shadow-lg"
      >
        {/* Header */}
        <div className="sticky top-0 border-b bg-background p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {template ? 'Edit Template' : 'Create Template'}
            </h3>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6 p-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 w-full rounded-lg border bg-background p-2 focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Template name..."
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 w-full resize-none rounded-lg border bg-background p-2 focus:outline-none focus:ring-2 focus:ring-ring"
                rows={2}
                placeholder="Brief description..."
              />
            </div>

            <div>
              <label className="text-sm font-medium">Category</label>
              <div className="mt-1 grid grid-cols-3 gap-2">
                {['general', 'coding', 'writing', 'analysis', 'creative', 'business', 'custom'].map(
                  cat => (
                    <button
                      key={cat}
                      onClick={() => setFormData({ ...formData, category: cat as any })}
                      className={cx(
                        'rounded-lg border p-2 text-sm capitalize transition-colors',
                        formData.category === cat
                          ? 'border-primary bg-primary/10'
                          : 'hover:bg-muted/50',
                      )}
                    >
                      {cat}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Template Content */}
          <div>
            <label className="text-sm font-medium">Template Content</label>
            <textarea
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              className="mt-1 w-full resize-none rounded-lg border bg-background p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              rows={8}
              placeholder="Enter your prompt template. Use {{variable_name}} for variables..."
            />
          </div>

          {/* Variables */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium">Variables</label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setFormData({
                    ...formData,
                    variables: [
                      ...(formData.variables || []),
                      { name: '', description: '', required: true },
                    ],
                  });
                }}
                className="gap-2"
              >
                <Plus className="h-3 w-3" />
                Add Variable
              </Button>
            </div>
            <div className="space-y-2">
              {formData.variables?.map((variable, index) => (
                <div
                  key={`variable-${variable.name || 'unnamed'}-${variable.description?.substring(0, 10) || 'no-desc'}`}
                  className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3"
                >
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={variable.name}
                      onChange={e => {
                        const newVars = [...(formData.variables || [])];
                        newVars[index].name = e.target.value;
                        setFormData({ ...formData, variables: newVars });
                      }}
                      placeholder="Variable name..."
                      className="w-full rounded border bg-background p-1.5 text-sm"
                    />
                    <input
                      type="text"
                      value={variable.description}
                      onChange={e => {
                        const newVars = [...(formData.variables || [])];
                        newVars[index].description = e.target.value;
                        setFormData({ ...formData, variables: newVars });
                      }}
                      placeholder="Description..."
                      className="w-full rounded border bg-background p-1.5 text-sm"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newVars = formData.variables?.filter((_, i) => i !== index);
                      setFormData({ ...formData, variables: newVars });
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium">Tags</label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && tagInput.trim()) {
                    e.preventDefault();
                    setFormData({
                      ...formData,
                      tags: [...(formData.tags || []), tagInput.trim()],
                    });
                    setTagInput('');
                  }
                }}
                placeholder="Add tags..."
                className="flex-1 rounded-lg border bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {formData.tags.map((tag, index) => (
                  <span
                    key={`tag-${tag || 'untagged'}-${tag.length}`}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"
                  >
                    {tag}
                    <button
                      onClick={() => {
                        setFormData({
                          ...formData,
                          tags: formData.tags?.filter((_, i) => i !== index),
                        });
                      }}
                      className="hover:text-destructive"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Privacy */}
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center gap-2">
              {formData.isPrivate ? (
                <Lock className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Unlock className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">
                {formData.isPrivate ? 'Private Template' : 'Shared Template'}
              </span>
            </div>
            <button
              onClick={() => setFormData({ ...formData, isPrivate: !formData.isPrivate })}
              className="text-sm text-primary hover:underline"
            >
              Change
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t bg-background p-6">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={() => {
                const now = new Date().toISOString();
                onSave({
                  id: template?.id || `tpl-${Date.now()}`,
                  ...formData,
                  createdAt: template?.createdAt || now,
                  updatedAt: now,
                  usageCount: template?.usageCount || 0,
                } as PromptTemplate);
              }}
              className="flex-1"
            >
              {template ? 'Save Changes' : 'Create Template'}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Use Template Modal
function UseTemplateModal({
  template,
  onUse,
  onClose,
}: {
  template: PromptTemplate;
  onUse: (variables: Record<string, string>) => void;
  onClose: () => void;
}) {
  const [variables, setVariables] = useState<Record<string, string>>({});

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[${Z_INDEX.MODAL_BACKDROP}] flex items-center justify-center p-4 ${BACKDROP_STYLES.HEAVY}`}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="w-full max-w-md space-y-4 rounded-lg border bg-background p-6 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Use Template</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
            <X className="h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg bg-muted/50 p-3">
            <h4 className="mb-1 text-sm font-medium">{template.name}</h4>
            <p className="text-xs text-muted-foreground">{template.description}</p>
          </div>

          {/* Variable Inputs */}
          {template.variables.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Fill in Variables</label>
              {template.variables.map(variable => (
                <div key={variable.name}>
                  <label className="text-xs text-muted-foreground">
                    {variable.description || variable.name}
                    {variable.required && <span className="ml-1 text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={variables[variable.name] || variable.defaultValue || ''}
                    onChange={e =>
                      setVariables({
                        ...variables,
                        [variable.name]: e.target.value,
                      })
                    }
                    placeholder={`Enter ${variable.name}...`}
                    className="mt-1 w-full rounded-lg border bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Preview */}
          <div>
            <label className="text-sm font-medium">Preview</label>
            <div className="mt-1 whitespace-pre-wrap rounded-lg border bg-muted/30 p-3 text-sm">
              {renderTemplatePreview(template.content, variables)}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={() => onUse(variables)}
            disabled={!areRequiredVariablesFilled(template.variables, variables)}
            className="flex-1"
          >
            <Zap className="mr-2 h-4 w-4" />
            Use Template
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Helper functions
function renderTemplatePreview(content: string, variables: Record<string, string>): string {
  return content.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    return variables[varName] || `{{${varName}}}`;
  });
}

function areRequiredVariablesFilled(
  templateVars: PromptVariable[],
  variables: Record<string, string>,
): boolean {
  return templateVars
    .filter(v => v.required)
    .every(v => variables[v.name] && variables[v.name].trim() !== '');
}

function getDefaultTemplates(): PromptTemplate[] {
  return [
    {
      id: 'tpl-1',
      name: 'Code Review',
      description: 'Comprehensive code review with suggestions',
      content:
        'Please review the following {{language}} code:\n\n{{code}}\n\nFocus on:\n1. Code quality and best practices\n2. Performance optimizations\n3. Security considerations\n4. Potential bugs\n5. Readability improvements',
      category: 'coding',
      tags: ['review', 'quality', 'optimization'],
      variables: [
        { name: 'language', description: 'Programming language', required: true },
        { name: 'code', description: 'Code to review', required: true },
      ],
      isPrivate: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
    },
    {
      id: 'tpl-2',
      name: 'Blog Post Outline',
      description: 'Create a structured blog post outline',
      content:
        'Create a detailed outline for a blog post about {{topic}}.\n\nTarget audience: {{audience}}\nTone: {{tone}}\nWord count target: {{wordCount}} words\n\nInclude:\n- Engaging introduction\n- Main sections with key points\n- Conclusion with call-to-action',
      category: 'writing',
      tags: ['blog', 'content', 'outline'],
      variables: [
        { name: 'topic', description: 'Blog post topic', required: true },
        { name: 'audience', description: 'Target audience', required: true },
        {
          name: 'tone',
          description: 'Writing tone',
          defaultValue: 'professional',
          required: false,
        },
        {
          name: 'wordCount',
          description: 'Target word count',
          defaultValue: '1500',
          required: false,
        },
      ],
      isPrivate: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
    },
  ];
}
