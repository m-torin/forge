import { UseFormReturnType, UseFormInput } from '@mantine/form';
import { NodeProps } from '@xyflow/react';
import { ZodType } from 'zod';
import { FbNode, FbNodeProps, MetaType } from '../../types';

/** Compute function type */
export type ComputeFunction<T extends Record<string, any>> = (
  input: Record<string, any>,
  data: T,
) => Promise<Record<string, any>>;

/**
 * Combined context type encapsulating node state, form handling, metadata, and modal tabs.
 * @template T - Represents the shape of form values used across form-related contexts.
 *
 * @property node {object} Node-related data and methods.
 * @property node.initialNodeData {FbNode=} Initial data for the node, if available.
 * @property node.nodeProps {FbNodeProps<FbNode>} Properties for the node.
 * @property node.nodeMeta {MetaType} Metadata for the node.
 * @property node.modalOpened {boolean} Indicates if the modal is open.
 * @property node.openModal {() => void} Opens the modal.
 * @property node.closeModal {() => void} Closes the modal.
 * @property node.flowId {string=} Optional ID of the flow containing this node.
 * @property node.nodeId {string=} Optional ID of the node.
 *
 * @property form {object} Form handling data and methods.
 * @property form.formSchema {ZodType<T>} Zod schema for form validation.
 * @property form.updateNode {(newData: Partial<FbNode>) => void} Updates the node data.
 * @property form.initialize {(values: T) => void} Initializes form values.
 * @property form.handleSubmit {(values: T) => void=} Custom handleSubmit method.
 * @property form.submitForm {(e?: React.FormEvent<HTMLFormElement>) => void} Programmatically submits the form.
 *
 * @property modalTabs {ModalTabs} Modal tab configuration components.
 */
export interface CombinedContextType<T extends Record<string, any>> {
  node: {
    initialNodeData?: FbNode;
    nodeProps: FbNodeProps;
    nodeMeta: MetaType;
    modalOpened: boolean;
    openModal: () => void;
    closeModal: () => void;
    flowId?: string;
    nodeId?: string;
  };
  form: Omit<UseFormReturnType<T>, 'initialize'> & {
    formSchema: ZodType<T>;
    initialize: (values: T) => void;
    handleSubmit?: (values: T) => void;
    submitForm: (e?: React.FormEvent<HTMLFormElement>) => void;
  };
  modalTabs: ModalTabs;
  updateNode: (newData: Partial<FbNode>) => void;
  compute?: ComputeFunction<T>;
}

/**
 * Props for the useFbNode hook containing node, form, and modal tab settings.
 * @template T - Form values structure.
 *
 * @property node {object} Node-related initial data and metadata.
 * @property node.initialNodeData {FbNode=} Initial data for the node, if available.
 * @property node.nodeProps {FbNodeProps<FbNode>} Properties for the node.
 * @property node.nodeMeta {MetaType} Metadata for the node.
 *
 * @property form {object} Form setup including schema and submit handling.
 * @property form.formSchema {ZodType<T>} Zod schema for form validation.
 * @property form.handleSubmit {(values: T, event?: React.FormEvent<HTMLFormElement>) => void} Form submit handler.
 *
 * @property modalTabs {ModalTabs} Modal tab configuration components.
 */
export interface UseFbNodeProps<T extends Record<string, any>> {
  node: {
    initialNodeData?: FbNode;
    nodeProps: FbNodeProps;
    nodeMeta: MetaType;
  };
  form: UseFormInput<T> & {
    formSchema: ZodType<T>;
    handleSubmit: (values: T, event?: React.FormEvent<HTMLFormElement>) => void;
  };
  modalTabs: ModalTabs;
  compute?: ComputeFunction<T>;
}

/**
 * Properties for the NodeBase component extending React Flow's NodeProps.
 * @template T - Defines node data structure.
 *
 * @property children {React.ReactNode} The content rendered inside the node.
 */
export interface NodeBaseProps<_T extends Record<string, any>>
  extends NodeProps {
  children: React.ReactNode;
}

/** Form values type for Zod schema validation. */
export type FormValues = Record<string, any>;

/** Node data extending FbNode with form values. */
export type NodeData<_T extends FormValues> = FbNode;

/** Update function to modify node data. */
export type UpdateNodeFunction<T extends FormValues> = (
  newData: Partial<NodeData<T>>,
) => void;

/** Form submit function. */
export type SubmitFunction<T extends FormValues> = (values: T) => void;

/** Modal tab configuration. */
export interface ModalTabs {
  configuration: React.ComponentType;
  nodeOptions: React.ComponentType;
}

/** Type for combined form and node context. */
export type CombinedFormNodeContext<T extends FormValues> = {
  form: UseFormReturnType<T> & {
    updateNode: UpdateNodeFunction<T>;
    submitForm: (
      e?:
        | React.FormEvent<HTMLFormElement>
        | React.MouseEvent<HTMLButtonElement>,
    ) => void;
  };
  node: CombinedContextType<T>['node'];
  modalTabs: ModalTabs;
};
