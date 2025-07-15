'use client';

import { Button } from '#/components/ui/button';
import { useAnimationSystem } from '#/hooks/ui/use-framer-motion';
import { BACKDROP_STYLES, RESPONSIVE, Z_INDEX } from '#/lib/ui-constants';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';

/**
 * Props for Modal component
 */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;

  // Visual options
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  backdrop?: keyof typeof BACKDROP_STYLES;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;

  // Animation options
  animation?: 'fade' | 'scale' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right';

  // Header options
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;

  // Footer options
  footer?: React.ReactNode;

  // Accessibility
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/**
 * Versatile modal component with animations and customization options
 * @param isOpen - Whether modal is open
 * @param onClose - Function to call when modal should close
 * @param children - Modal content
 * @param size - Modal size variant
 * @param animation - Animation type for modal appearance
 */
export function Modal({
  isOpen,
  onClose,
  children,
  className,
  size = 'md',
  backdrop = 'MEDIUM',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  animation = 'scale',
  title,
  subtitle,
  icon,
  footer,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: ModalProps) {
  const { variants } = useAnimationSystem();
  // Lock scroll when modal is open (using native CSS)
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Escape key handling when modal is open
  React.useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const listener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [isOpen, closeOnEscape, onClose]);

  // Memoize size classes to prevent recreation on every render
  const sizeClasses = useMemo(
    () => ({
      sm: 'max-w-sm mx-2 sm:mx-auto',
      md: 'max-w-lg mx-2 sm:mx-auto',
      lg: 'max-w-2xl mx-2 sm:mx-auto',
      xl: 'max-w-4xl mx-2 sm:mx-auto',
      full: 'max-w-[95vw] max-h-[95vh] mx-2',
    }),
    [],
  );

  // Use centralized animation variants based on animation prop
  const animationVariants = useMemo(() => {
    switch (animation) {
      case 'fade':
        return variants.fadeVariants;
      case 'scale':
        return variants.modalVariants;
      case 'slide-up':
        return variants.slideUpVariants;
      case 'slide-down':
        return variants.slideDownVariants;
      case 'slide-left':
        return variants.slideLeftVariants;
      case 'slide-right':
        return variants.slideRightVariants;
      default:
        return variants.modalVariants;
    }
  }, [animation, variants]);

  // Memoize backdrop click handler to prevent recreation on every render
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnBackdropClick && e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnBackdropClick, onClose],
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={variants.overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={cx(
            'fixed inset-0 flex items-center justify-center',
            // Mobile-optimized padding with safe areas
            'p-2 sm:p-4',
            BACKDROP_STYLES[backdrop],
            `z-[${Z_INDEX.MODAL_BACKDROP}]`,
            // Safe area handling for mobile devices
            'pt-safe-top pb-safe-bottom',
          )}
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
        >
          <motion.div
            variants={animationVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cx(
              'relative w-full overflow-hidden rounded-xl border border-border/50 bg-background/95 shadow-2xl backdrop-blur-xl',
              sizeClasses[size],
              `z-[${Z_INDEX.MODAL}]`,
              className,
            )}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            {(title || subtitle || icon || showCloseButton) && (
              <div className="flex items-start justify-between border-b border-border/50 p-6">
                <div className="flex items-start gap-3">
                  {icon && <div className="flex-shrink-0 rounded-lg bg-primary/10 p-2">{icon}</div>}
                  <div>
                    {title && (
                      <h2 id={ariaLabelledBy} className="text-xl font-semibold text-foreground">
                        {title}
                      </h2>
                    )}
                    {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
                  </div>
                </div>

                {showCloseButton && (
                  <motion.div
                    variants={variants.hoverVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      className={cx('h-8 w-8 flex-shrink-0 p-0', RESPONSIVE.TOUCH_TARGET.SMALL)}
                      aria-label="Close modal"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </div>
            )}

            {/* Content */}
            <div className="p-4 sm:p-6">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="border-t border-border/50 bg-muted/30 p-4 sm:p-6">{footer}</div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Modal header component for custom headers
 * @param children - Header content
 * @param className - Additional CSS classes
 */
export function ModalHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cx('border-b border-border/50 p-6', className)}>{children}</div>;
}

/**
 * Modal content component wrapper
 * @param children - Content to display
 * @param className - Additional CSS classes
 */
export function ModalContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cx('p-6', className)}>{children}</div>;
}

/**
 * Modal footer component wrapper
 * @param children - Footer content
 * @param className - Additional CSS classes
 */
export function ModalFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx('border-t border-border/50 bg-muted/30 p-6', className)}>{children}</div>
  );
}

/**
 * Specialized confirmation modal with confirm/cancel buttons
 * @param onConfirm - Function called when user confirms
 * @param title - Modal title
 * @param message - Confirmation message
 * @param variant - Button variant (default or destructive)
 */
export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={title}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <p className="text-muted-foreground">{message}</p>
    </Modal>
  );
}
