import { AuthProvider } from '@repo/auth-new/provider';

import { TooltipProvider } from './components/ui/tooltip';
import { MantineProvider } from './providers/mantine-provider';
import { ThemeProvider } from './providers/theme';

import type { ThemeProviderProps } from 'next-themes';

type DesignSystemProviderProperties = ThemeProviderProps & {
  _privacyUrl?: string;
  _termsUrl?: string;
  _helpUrl?: string;
};

export const DesignSystemProvider = ({
  _helpUrl,
  _privacyUrl,
  _termsUrl,
  children,
  ...properties
}: DesignSystemProviderProperties) => (
  <ThemeProvider {...properties}>
    <MantineProvider>
      <AuthProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </AuthProvider>
    </MantineProvider>
  </ThemeProvider>
);

// Export auth components
export { SignIn } from './components/auth/sign-in';
export { SignUp } from './components/auth/sign-up';
export { UserButton } from './components/auth/user-button';
export { OrganizationSwitcher } from './components/auth/organization-switcher';
export { OrganizationDetail } from './components/auth/organization-detail';
export { AcceptInvitation } from './components/auth/accept-invitation';
export { InvitationPreview } from './components/auth/invitation-preview';
export { ApiKeyList } from './components/auth/api-key-list';
export { CreateApiKeyDialog } from './components/auth/create-api-key-dialog';
export { UpdateApiKeyDialog } from './components/auth/update-api-key-dialog';
export { AuthLayout } from './components/auth/auth-layout';
export { UnifiedSignIn } from './components/auth/unified-sign-in';
export { UnifiedSignUp } from './components/auth/unified-sign-up';
export { ForgotPasswordForm } from './components/auth/forgot-password-form';
export { ResetPasswordForm } from './components/auth/reset-password-form';
export { AuthForm } from './components/auth/auth-form';
export {
  TwoFactorManage,
  TwoFactorSetup,
  TwoFactorStatus,
} from './components/auth/two-factor-setup';
export {
  PasskeyList,
  PasskeyManager,
  PasskeySetup,
  PasskeySignInButton,
} from './components/auth/passkey-setup';
export {
  EmailVerificationBanner,
  EmailVerificationPage,
  EmailVerificationPrompt,
} from './components/auth/email-verification';
export { SessionManagement, UserProfile } from './components/auth/user-profile';

// Export admin components
export { CreateUserDialog } from './components/admin/create-user-dialog';
export { UserDetails } from './components/admin/user-details';
export { UserList } from './components/admin/user-list';

// Export Mantine components and utilities
export * from '@mantine/core';
export * from '@mantine/hooks';
export * from '@mantine/dates';
export * from '@mantine/form';
export * from '@mantine/notifications';
export * from '@mantine/modals';
export * from '@mantine/dropzone';
export * from '@mantine/charts';
export * from '@mantine/carousel';
export * from '@mantine/spotlight';
export * from '@mantine/nprogress';
export * from '@mantine/code-highlight';

// Export UI components (use specific exports to avoid conflicts)
export {
  Accordion,
  AccordionContent,
  AccordionTrigger,
  AccordionItem as UIAccordionItem,
} from './components/ui/accordion';

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './components/ui/alert-dialog';

export { Alert, AlertDescription, AlertTitle } from './components/ui/alert';

export { AspectRatio } from './components/ui/aspect-ratio';

export { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';

export { Badge } from './components/ui/badge';

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './components/ui/breadcrumb';

export { Button as UIButton } from './components/ui/button';

export { Calendar as UICalendar } from './components/ui/calendar';

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './components/ui/card';

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './components/ui/carousel';

export {
  ChartContainer,
  ChartTooltipContent,
  ChartTooltip as UIChartTooltip,
} from './components/ui/chart';
export type { ChartConfig } from './components/ui/chart';

export { Checkbox as UICheckbox } from './components/ui/checkbox';

export { Collapsible, CollapsibleContent, CollapsibleTrigger } from './components/ui/collapsible';

export {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './components/ui/command';

export {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from './components/ui/context-menu';

export {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Dialog as UIDialog,
} from './components/ui/dialog';

export {
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerTrigger,
  Drawer as UIDrawer,
  DrawerContent as UIDrawerContent,
  DrawerHeader as UIDrawerHeader,
  DrawerTitle as UIDrawerTitle,
} from './components/ui/drawer';

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';

export {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form as UIForm,
} from './components/ui/form';

export { HoverCard, HoverCardContent, HoverCardTrigger } from './components/ui/hover-card';

export { Input as UIInput } from './components/ui/input';

export {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from './components/ui/input-otp';

export { Label } from './components/ui/label';

export {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from './components/ui/menubar';

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuViewport,
} from './components/ui/navigation-menu';

export {
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
  Pagination as UIPagination,
  PaginationNext as UIPaginationNext,
  PaginationPrevious as UIPaginationPrevious,
} from './components/ui/pagination';

export { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';

export { Progress } from './components/ui/progress';

export { RadioGroupItem, RadioGroup as UIRadioGroup } from './components/ui/radio-group';

export { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './components/ui/resizable';

export { ScrollArea } from './components/ui/scroll-area';

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './components/ui/select';

export { Separator } from './components/ui/separator';

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './components/ui/sheet';

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from './components/ui/sidebar';

export { Skeleton } from './components/ui/skeleton';

export { Slider } from './components/ui/slider';

export { Switch } from './components/ui/switch';

export {
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  Table as UITable,
  TableCaption as UITableCaption,
} from './components/ui/table';

export { Tabs, TabsContent, TabsTrigger, TabsList as UITabsList } from './components/ui/tabs';

export { Textarea } from './components/ui/textarea';

export { Toggle } from './components/ui/toggle';

export { ToggleGroup, ToggleGroupItem } from './components/ui/toggle-group';

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './components/ui/tooltip';

// Export UI components
export { BackButton } from './components/ui/back-button';

// Export hooks
export { useAsyncAuth, usePageTracking, useRequireAuth } from './hooks/auth';

// Export our theme
export { mantineTheme, theme } from './lib/mantine-theme';
export { MantineProvider } from './providers/mantine-provider';
