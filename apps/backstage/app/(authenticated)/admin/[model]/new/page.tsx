import { notFound, redirect } from 'next/navigation';

import { createRecord } from '../../actions';
import { type FormFieldV2 } from '../../components/ModelFormV2';
import { ResponsiveModelForm } from '../../components/ResponsiveModelForm';
import { getModelConfig } from '../../lib/model-config';
import { fetchRelationshipOptions } from '../../lib/relationship-utils';

interface PageProps {
  params: { model: string };
}

export default async function NewModelPage({ params }: PageProps) {
  const config = getModelConfig(params.model);
  if (!config) {
    notFound();
  }

  // Convert fields to FormFieldV2 format with responsive features
  const fieldsWithOptions = await Promise.all(
    config.fields.map(async (field, index) => {
      // Base field configuration
      const enhancedField: FormFieldV2 = {
        ...field,
        type: field.type as any,
        // Set columns for grid layout on desktop
        columns: field.type === 'textarea' || field.type === 'json' ? 12 : 6,
        // Add fieldset based on field type or name
        fieldset: field.name.includes('meta')
          ? 'Metadata'
          : field.name.includes('seo')
            ? 'SEO'
            : field.name.endsWith('At')
              ? 'System Fields'
              : 'default',
      };

      // Handle relationship fields
      if (field.type === 'select' && field.name.endsWith('Id')) {
        try {
          const options = await fetchRelationshipOptions(field.name);
          return {
            ...enhancedField,
            type: 'relationship' as const,
            options,
            relationshipConfig: {
              allowCreate: false,
              displayKey: 'name',
              model: field.name.slice(0, -2),
              searchKey: 'name',
            },
          };
        } catch {
          return enhancedField;
        }
      }

      // Add validation for email fields
      if (field.name.includes('email') || field.name.includes('Email')) {
        enhancedField.type = 'email';
        enhancedField.validation = (value: string) => {
          if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return 'Invalid email address';
          }
          return null;
        };
      }

      // Handle URL fields
      if (field.name.includes('url') || field.name.includes('Url')) {
        enhancedField.validation = (value: string) => {
          if (value && !/^https?:\/\/.+/.test(value)) {
            return 'Invalid URL';
          }
          return null;
        };
      }

      return enhancedField;
    }),
  );

  async function handleSubmit(values: Record<string, any>) {
    'use server';

    // Transform the data to match Prisma schema if needed
    const data = { ...values };

    // Handle JSON fields
    config.fields.forEach((field) => {
      if (field.type === 'json' && typeof values[field.name] === 'string') {
        try {
          data[field.name] = JSON.parse(values[field.name]);
        } catch {
          data[field.name] = {};
        }
      }
      // Handle number fields
      if (field.type === 'number' && values[field.name]) {
        data[field.name] = parseFloat(values[field.name]);
      }
    });

    await createRecord(params.model, data);
    redirect(`/admin/${params.model}`);
  }

  return (
    <ResponsiveModelForm
      cancelHref={`/admin/${params.model}`}
      autoSave={false} // Don't auto-save on create
      collapsibleSections={false}
      confirmCancel={true}
      floatingActionButton={true}
      // Mobile-first settings
      layout="vertical"
      mobileLayout="steps" // Use steps for create flow
      onSubmit={handleSubmit}
      showProgress={true}
      fields={fieldsWithOptions}
      submitLabel={`Create ${config.name}`}
      title={`Create ${config.name}`}
    />
  );
}
