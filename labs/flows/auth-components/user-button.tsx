// user-button.tsx
import { Avatar, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { auth } from '#/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { SignIn, SignOut } from './auth-components';
import { Suspense } from 'react';

// Server Component
async function UserButtonContent() {
  const session = await auth();

  if (!session?.user) return <SignIn />;

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-sm sm:inline-flex">
        {session.user.email}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={
                  session.user.image ??
                  `https://api.dicebear.com/9.x/thumbs/svg?seed=${Math.floor(Math.random() * 100000) + 1}&randomizeIds=true`
                }
                alt={session.user.name ?? ''}
              />
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {session.user.name}
              </p>
              <p className="text-muted-foreground text-xs leading-none">
                {session.user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuItem>
            <SignOut />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Client Component Wrapper
export default function UserButton() {
  return (
    <Suspense
      fallback={<div className="h-8 w-8 rounded-full bg-muted animate-pulse" />}
    >
      {/* @ts-ignore Async Server Component */}
      <UserButtonContent />
    </Suspense>
  );
}
