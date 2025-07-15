import { useAnimationSystem } from '#/hooks/ui/use-framer-motion';
import { motion } from 'framer-motion';
import Form from 'next/form';

import { Input } from '#/components/ui/input';
import { Label } from '#/components/ui/label';

/**
 * Authentication form component with animations
 * @param action - Form action handler
 * @param children - Form content elements
 * @param defaultEmail - Default email value
 */
export function AuthForm({
  action,
  children,
  defaultEmail = '',
}: {
  action: NonNullable<string | ((formData: FormData) => void | Promise<void>) | undefined>;
  children: React.ReactNode;
  defaultEmail?: string;
}) {
  const { variants, performance } = useAnimationSystem();

  return (
    <Form action={action} className="flex flex-col gap-4 px-4 sm:px-16">
      <motion.div
        variants={variants.staggerContainerFast}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-4"
      >
        {/* Enhanced email field with stagger animation */}
        <motion.div
          className="flex flex-col gap-2"
          variants={variants.slideUpVariants}
          transition={{ delay: performance.optimizedDuration(0.1) }}
          style={{ willChange: 'transform, opacity' }}
        >
          <motion.div variants={variants.fadeVariants}>
            <Label htmlFor="email" className="font-normal text-zinc-600 dark:text-zinc-400">
              Email Address
            </Label>
          </motion.div>

          <motion.div
            variants={variants.slideUpVariants}
            whileFocus={{
              scale: 1.02,
              transition: { duration: performance.optimizedDuration(0.2) },
            }}
            style={{ willChange: 'transform' }}
          >
            <Input
              id="email"
              name="email"
              className="text-md bg-muted md:text-sm"
              type="email"
              placeholder="user@acme.com"
              autoComplete="email"
              required
              defaultValue={defaultEmail}
            />
          </motion.div>
        </motion.div>

        {/* Enhanced password field with stagger animation */}
        <motion.div
          className="flex flex-col gap-2"
          variants={variants.slideUpVariants}
          transition={{ delay: performance.optimizedDuration(0.15) }}
          style={{ willChange: 'transform, opacity' }}
        >
          <motion.div variants={variants.fadeVariants}>
            <Label htmlFor="password" className="font-normal text-zinc-600 dark:text-zinc-400">
              Password
            </Label>
          </motion.div>

          <motion.div
            variants={variants.slideUpVariants}
            whileFocus={{
              scale: 1.02,
              transition: { duration: performance.optimizedDuration(0.2) },
            }}
            style={{ willChange: 'transform' }}
          >
            <Input
              id="password"
              name="password"
              className="text-md bg-muted md:text-sm"
              type="password"
              required
            />
          </motion.div>
        </motion.div>

        {/* Enhanced children with stagger animation */}
        <motion.div
          variants={variants.slideUpVariants}
          transition={{ delay: performance.optimizedDuration(0.2) }}
          style={{ willChange: 'transform, opacity' }}
        >
          {children}
        </motion.div>
      </motion.div>
    </Form>
  );
}
