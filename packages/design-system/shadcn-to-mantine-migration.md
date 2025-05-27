# shadcn/ui to Mantine Component Migration Guide

## Component Mapping Reference

| shadcn/ui Component | Mantine Equivalent      | Notes                               |
| ------------------- | ----------------------- | ----------------------------------- |
| accordion           | Accordion               | Direct equivalent                   |
| alert               | Alert                   | Direct equivalent                   |
| alert-dialog        | Modal                   | Use Modal with confirmation pattern |
| aspect-ratio        | AspectRatio             | Direct equivalent                   |
| avatar              | Avatar                  | Direct equivalent                   |
| badge               | Badge                   | Direct equivalent                   |
| breadcrumb          | Breadcrumbs             | Direct equivalent                   |
| button              | Button                  | Direct equivalent                   |
| calendar            | DatePicker/Calendar     | Use DatePicker for most cases       |
| card                | Card                    | Direct equivalent                   |
| carousel            | Carousel                | Direct equivalent                   |
| chart               | No direct equivalent    | Use recharts or custom solution     |
| checkbox            | Checkbox                | Direct equivalent                   |
| collapsible         | Collapse                | Direct equivalent                   |
| command             | Spotlight/Combobox      | Use Spotlight for command palette   |
| context-menu        | Menu                    | Use Menu with context trigger       |
| dialog              | Modal                   | Direct equivalent                   |
| drawer              | Drawer                  | Direct equivalent                   |
| dropdown-menu       | Menu                    | Direct equivalent                   |
| form                | No direct equivalent    | Use @mantine/form                   |
| hover-card          | HoverCard               | Direct equivalent                   |
| input               | TextInput               | Direct equivalent                   |
| input-otp           | PinInput                | Similar functionality               |
| label               | Text/InputLabel         | Use Text component or input labels  |
| menubar             | No direct equivalent    | Use AppShell with navigation        |
| navigation-menu     | NavLink/Tabs            | Depends on use case                 |
| pagination          | Pagination              | Direct equivalent                   |
| popover             | Popover                 | Direct equivalent                   |
| progress            | Progress                | Direct equivalent                   |
| radio-group         | Radio.Group             | Direct equivalent                   |
| resizable           | No direct equivalent    | Custom implementation needed        |
| scroll-area         | ScrollArea              | Direct equivalent                   |
| select              | Select/NativeSelect     | Direct equivalent                   |
| separator           | Divider                 | Direct equivalent                   |
| sheet               | Drawer                  | Use Drawer with different position  |
| sidebar             | AppShell.Navbar         | Use AppShell navigation             |
| skeleton            | Skeleton                | Direct equivalent                   |
| slider              | Slider                  | Direct equivalent                   |
| sonner              | Notifications           | Use Mantine notifications           |
| switch              | Switch                  | Direct equivalent                   |
| table               | Table                   | Direct equivalent                   |
| tabs                | Tabs                    | Direct equivalent                   |
| textarea            | Textarea                | Direct equivalent                   |
| toast               | Notifications           | Use Mantine notifications           |
| toggle              | SegmentedControl/Button | Use SegmentedControl for groups     |
| toggle-group        | SegmentedControl        | Direct equivalent                   |
| tooltip             | Tooltip                 | Direct equivalent                   |

## Conversion Examples

### 1. Button

**shadcn/ui:**

```tsx
import { Button } from '@/components/ui/button';

<Button variant="outline" size="sm">
  Click me
</Button>;
```

**Mantine:**

```tsx
import { Button } from '@mantine/core';

<Button variant="outline" size="sm">
  Click me
</Button>;
```

### 2. Dialog → Modal

**shadcn/ui:**

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>This action cannot be undone.</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>;
```

**Mantine:**

```tsx
import { Modal, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

function MyComponent() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button onClick={open}>Open Modal</Button>
      <Modal opened={opened} onClose={close} title="Are you sure?">
        <Text size="sm" c="dimmed">
          This action cannot be undone.
        </Text>
      </Modal>
    </>
  );
}
```

### 3. Select

**shadcn/ui:**

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select a fruit" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="banana">Banana</SelectItem>
  </SelectContent>
</Select>;
```

**Mantine:**

```tsx
import { Select } from '@mantine/core';

<Select
  placeholder="Select a fruit"
  data={[
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
  ]}
/>;
```

### 4. Dropdown Menu → Menu

**shadcn/ui:**

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Options</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>;
```

**Mantine:**

```tsx
import { Menu, Button } from '@mantine/core';

<Menu>
  <Menu.Target>
    <Button variant="outline">Options</Button>
  </Menu.Target>
  <Menu.Dropdown>
    <Menu.Item>Profile</Menu.Item>
    <Menu.Item>Settings</Menu.Item>
  </Menu.Dropdown>
</Menu>;
```

### 5. Alert Dialog → Modal with Confirmation

**shadcn/ui:**

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>This will permanently delete your account.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>;
```

**Mantine:**

```tsx
import { Modal, Button, Group, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

function DeleteButton() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button color="red" onClick={open}>
        Delete
      </Button>
      <Modal opened={opened} onClose={close} title="Are you absolutely sure?" centered>
        <Text size="sm" c="dimmed" mb="lg">
          This will permanently delete your account.
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={close}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={() => {
              // Handle delete
              close();
            }}
          >
            Continue
          </Button>
        </Group>
      </Modal>
    </>
  );
}
```

### 6. Toast → Notifications

**shadcn/ui:**

```tsx
import { toast } from '@/components/ui/use-toast';

toast({
  title: 'Success',
  description: 'Your changes have been saved.',
});
```

**Mantine:**

```tsx
import { notifications } from '@mantine/notifications';

notifications.show({
  title: 'Success',
  message: 'Your changes have been saved.',
  color: 'green',
});
```

### 7. Form with Validation

**shadcn/ui (with react-hook-form):**

```tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  username: z.string().min(2).max(50),
});

function ProfileForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="johndoe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

**Mantine:**

```tsx
import { useForm } from '@mantine/form';
import { TextInput, Button } from '@mantine/core';
import { zodResolver } from 'mantine-form-zod-resolver';
import * as z from 'zod';

const schema = z.object({
  username: z.string().min(2).max(50),
});

function ProfileForm() {
  const form = useForm({
    initialValues: {
      username: '',
    },
    validate: zodResolver(schema),
  });

  return (
    <form onSubmit={form.onSubmit((values) => console.log(values))}>
      <TextInput label="Username" placeholder="johndoe" {...form.getInputProps('username')} />
      <Button type="submit" mt="md">
        Submit
      </Button>
    </form>
  );
}
```

### 8. Tabs

**shadcn/ui:**

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">Account content</TabsContent>
  <TabsContent value="password">Password content</TabsContent>
</Tabs>;
```

**Mantine:**

```tsx
import { Tabs } from '@mantine/core';

<Tabs defaultValue="account">
  <Tabs.List>
    <Tabs.Tab value="account">Account</Tabs.Tab>
    <Tabs.Tab value="password">Password</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="account">Account content</Tabs.Panel>
  <Tabs.Panel value="password">Password content</Tabs.Panel>
</Tabs>;
```

### 9. Card

**shadcn/ui:**

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>;
```

**Mantine:**

```tsx
import { Card, Text, Button, Group } from '@mantine/core';

<Card shadow="sm" padding="lg" radius="md" withBorder>
  <Card.Section inheritPadding py="xs">
    <Text fw={500}>Card Title</Text>
    <Text size="sm" c="dimmed">
      Card description
    </Text>
  </Card.Section>

  <Text mt="md">Card content</Text>

  <Group justify="flex-end" mt="md">
    <Button>Action</Button>
  </Group>
</Card>;
```

### 10. Tooltip

**shadcn/ui:**

```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline">Hover me</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Tooltip content</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>;
```

**Mantine:**

```tsx
import { Tooltip, Button } from '@mantine/core';

<Tooltip label="Tooltip content">
  <Button variant="outline">Hover me</Button>
</Tooltip>;
```

## Components Requiring Custom Implementation

1. **Command Palette**: Use Mantine's Spotlight component
2. **Resizable Panels**: Implement with react-resizable-panels or custom solution
3. **Chart Components**: Use recharts, victory, or other charting libraries
4. **Menubar**: Create custom component using AppShell and navigation components
5. **Sonner Toast**: Replace with Mantine's notification system

## Migration Tips

1. **Styling**: Mantine uses its own theme system. Map shadcn's CSS variables to Mantine theme
   tokens.
2. **Animations**: Mantine has built-in transitions. Use `transition` prop instead of custom
   animations.
3. **Dark Mode**: Mantine has built-in dark mode support through MantineProvider.
4. **Form Handling**: Use @mantine/form instead of react-hook-form for better integration.
5. **Icons**: Mantine works well with Tabler Icons (@tabler/icons-react).

## Common Gotchas

1. **State Management**: Mantine components often manage their own state. Use `useDisclosure` hook
   for modals/drawers.
2. **Styling Props**: Mantine uses style props (p, m, mt, etc.) instead of className for spacing.
3. **Size Scales**: Mantine uses different size scales (xs, sm, md, lg, xl) - map accordingly.
4. **Color System**: Mantine has a more extensive color system with shade variations (color.0 to
   color.9).
