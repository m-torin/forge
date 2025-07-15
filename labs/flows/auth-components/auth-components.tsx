import { signIn, signOut } from '#/auth';
import { Button } from './ui/button';

export function SignIn({
  provider,
  ...props
}: { provider?: string } & React.ComponentPropsWithRef<typeof Button>) {
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await signIn(provider);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Button type="submit" {...props}>
        Sign In
      </Button>
    </form>
  );
}

export function SignOut(props: React.ComponentPropsWithRef<typeof Button>) {
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await signOut();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <Button type="submit" variant="ghost" className="w-full p-0" {...props}>
        Sign Out
      </Button>
    </form>
  );
}
