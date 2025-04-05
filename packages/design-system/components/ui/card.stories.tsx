import { Button } from "./button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Card> = {
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "UI/Card",
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <p>Card Footer</p>
      </CardFooter>
    </Card>
  ),
};

export const SignUp: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Enter your information to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              className="w-full p-2 border rounded"
              type="text"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="w-full p-2 border rounded"
              type="email"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost">Cancel</Button>
        <Button>Sign Up</Button>
      </CardFooter>
    </Card>
  ),
};

export const Pricing: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Pro Plan</CardTitle>
        <CardDescription>$29 per month</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-2 list-disc pl-5">
          <li>Unlimited projects</li>
          <li>Advanced analytics</li>
          <li>Priority support</li>
          <li>Custom domain</li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Upgrade to Pro</Button>
      </CardFooter>
    </Card>
  ),
};
