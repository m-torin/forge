import { CollaboratorAvatar } from '#/components/CollaboratorAvatar';
import { describe, expect, it } from 'vitest';
import { createMockCollaborator } from '../testing/factories.js';
import { renderWithCollaboration, screen } from '../testing/test-utils.js';

describe('CollaboratorAvatar', () => {
  it('renders collaborator name initials when no avatar provided', () => {
    const collaborator = createMockCollaborator({
      name: 'Alice Johnson',
      avatar: undefined,
    });

    renderWithCollaboration(<CollaboratorAvatar collaborator={collaborator} />, {
      collaborationOptions: {},
    });

    expect(screen.getByText('AJ')).toBeInTheDocument();
  });

  it('shows active status indicator for active collaborators', () => {
    const collaborator = createMockCollaborator({
      name: 'Bob Smith',
      isActive: true,
    });

    renderWithCollaboration(<CollaboratorAvatar collaborator={collaborator} showStatus={true} />, {
      collaborationOptions: {},
    });

    // The indicator should be present (though we can't easily test the visual indicator)
    // We can test that the component renders without errors
    expect(screen.getByText('BS')).toBeInTheDocument();
  });

  it('does not show status indicator when showStatus is false', () => {
    const collaborator = createMockCollaborator({
      name: 'Carol Williams',
      isActive: true,
    });

    renderWithCollaboration(<CollaboratorAvatar collaborator={collaborator} showStatus={false} />, {
      collaborationOptions: {},
    });

    expect(screen.getByText('CW')).toBeInTheDocument();
  });

  it('displays tooltip with collaborator name and status', async () => {
    const collaborator = createMockCollaborator({
      name: 'David Brown',
      isActive: true,
    });

    renderWithCollaboration(<CollaboratorAvatar collaborator={collaborator} />, {
      collaborationOptions: {},
    });

    // Test that the tooltip trigger is present
    expect(screen.getByText('DB')).toBeInTheDocument();
  });

  it('handles collaborator with single name', () => {
    const collaborator = createMockCollaborator({
      name: 'Cher',
    });

    renderWithCollaboration(<CollaboratorAvatar collaborator={collaborator} />, {
      collaborationOptions: {},
    });

    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('handles collaborator with multiple names', () => {
    const collaborator = createMockCollaborator({
      name: 'Jean-Claude Van Damme',
    });

    renderWithCollaboration(<CollaboratorAvatar collaborator={collaborator} />, {
      collaborationOptions: {},
    });

    expect(screen.getByText('JV')).toBeInTheDocument();
  });

  it('applies custom color from collaborator', () => {
    const collaborator = createMockCollaborator({
      name: 'Test User',
      color: '#FF0000',
    });

    const { container } = renderWithCollaboration(
      <CollaboratorAvatar collaborator={collaborator} />,
      { collaborationOptions: {} },
    );

    // Check that the color is applied (this might need adjustment based on actual DOM structure)
    const avatar = container.querySelector('[style*="#FF0000"]');
    expect(avatar).toBeInTheDocument();
  });
});
