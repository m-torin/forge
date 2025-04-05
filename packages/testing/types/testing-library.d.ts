declare module "@testing-library/user-event" {
  interface UserEvent {
    setup(): any;
  }

  const userEvent: UserEvent & {
    default: UserEvent;
  };

  export default userEvent;
}
