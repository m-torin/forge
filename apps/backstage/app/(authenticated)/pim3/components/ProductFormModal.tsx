"use client";

import {
  Button,
  Group,
  JsonInput,
  LoadingOverlay,
  Modal,
  NumberInput,
  Select,
  Stack,
  Switch,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useState } from "react";

import { createProduct, updateProduct } from "../actions";

import type { Product } from "@repo/database/prisma";

interface ProductFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
  opened: boolean;
  product?: Product | null;
}

export function ProductFormModal({
  onClose,
  onSuccess,
  opened,
  product,
}: ProductFormModalProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!product;

  const form = useForm({
    validate: {
      name: (value) => (!value ? "Name is required" : null),
      attributes: (value) => {
        try {
          JSON.parse(value);
          return null;
        } catch {
          return "Attributes must be valid JSON";
        }
      },
      category: (value) => (!value ? "Category is required" : null),
      price: (value) => {
        if (value && isNaN(Number(value))) {
          return "Price must be a valid number";
        }
        return null;
      },
      sku: (value) => (!value ? "SKU is required" : null),
    },
    initialValues: {
      aiConfidence: product?.aiConfidence || "",
      name: product?.name || "",
      aiGenerated: product?.aiGenerated || false,
      attributes: product?.attributes
        ? JSON.stringify(product.attributes, null, 2)
        : "{}",
      brand: product?.brand || "",
      category: product?.category || "",
      currency: product?.currency || "USD",
      description: product?.description || "",
      price: product?.price || "",
      sku: product?.sku || "",
      status: product?.status || "DRAFT",
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          formData.append(key, value.toString());
        }
      });

      const result =
        isEditing && product
          ? await updateProduct(product.id, formData)
          : await createProduct(formData);

      if (result.success) {
        notifications.show({
          color: "green",
          message: `Product ${isEditing ? "updated" : "created"} successfully`,
          title: "Success",
        });
        onSuccess();
        form.reset();
      } else {
        notifications.show({
          color: "red",
          message:
            result.error ||
            `Failed to ${isEditing ? "update" : "create"} product`,
          title: "Error",
        });
      }
    } catch (error) {
      notifications.show({
        color: "red",
        message: `Failed to ${isEditing ? "update" : "create"} product`,
        title: "Error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      onClose={onClose}
      opened={opened}
      size="lg"
      title={isEditing ? "Edit Product" : "Create Product"}
    >
      <LoadingOverlay visible={loading} />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Group grow>
            <TextInput
              placeholder="Enter product name"
              label="Product Name"
              required
              {...form.getInputProps("name")}
            />
            <TextInput
              placeholder="Enter SKU"
              label="SKU"
              required
              {...form.getInputProps("sku")}
            />
          </Group>

          <Textarea
            minRows={3}
            placeholder="Enter product description"
            label="Description"
            {...form.getInputProps("description")}
          />

          <Group grow>
            <TextInput
              placeholder="Enter category"
              label="Category"
              required
              {...form.getInputProps("category")}
            />
            <Select
              data={[
                { label: "Draft", value: "DRAFT" },
                { label: "Active", value: "ACTIVE" },
                { label: "Archived", value: "ARCHIVED" },
                { label: "Discontinued", value: "DISCONTINUED" },
              ]}
              label="Status"
              required
              {...form.getInputProps("status")}
            />
          </Group>

          <Group grow>
            <TextInput
              placeholder="Enter brand"
              label="Brand"
              {...form.getInputProps("brand")}
            />
            <Group grow>
              <NumberInput
                allowNegative={false}
                placeholder="0.00"
                decimalScale={2}
                fixedDecimalScale
                label="Price"
                {...form.getInputProps("price")}
              />
              <Select
                data={[
                  { label: "USD", value: "USD" },
                  { label: "EUR", value: "EUR" },
                  { label: "GBP", value: "GBP" },
                  { label: "CAD", value: "CAD" },
                ]}
                label="Currency"
                {...form.getInputProps("currency")}
              />
            </Group>
          </Group>

          <JsonInput
            validationError="Invalid JSON"
            autosize
            formatOnBlur
            maxRows={10}
            minRows={4}
            placeholder="Enter product attributes as JSON"
            label="Attributes"
            {...form.getInputProps("attributes")}
          />

          <Group>
            <Switch
              description="Mark this product as AI generated"
              label="AI Generated"
              {...form.getInputProps("aiGenerated", { type: "checkbox" })}
            />
            {form.values.aiGenerated && (
              <NumberInput
                placeholder="0.0 - 1.0"
                decimalScale={2}
                label="AI Confidence"
                max={1}
                min={0}
                step={0.1}
                {...form.getInputProps("aiConfidence")}
              />
            )}
          </Group>

          <Group justify="flex-end" mt="md">
            <Button onClick={onClose} variant="light">
              Cancel
            </Button>
            <Button loading={loading} type="submit">
              {isEditing ? "Update Product" : "Create Product"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
