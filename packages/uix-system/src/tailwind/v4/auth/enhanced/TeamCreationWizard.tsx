/**
 * TeamCreationWizard - Step-by-step team creation
 * Comprehensive wizard for creating teams with member invitations and role assignments
 */

import { useState, useTransition } from 'react';
import { useFormState } from 'react-dom';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';

import {
  createTeamAction,
  inviteTeamMembersAction as inviteMembersAction,
  uploadTeamImageAction,
} from '../../../../../../auth/src/server-actions';

interface TeamMember {
  email: string;
  role: 'admin' | 'member' | 'viewer';
  name?: string;
}

interface TeamCreationWizardProps {
  onTeamCreated: (teamData: any) => void;
  onCancel?: () => void;
  allowPublicTeams?: boolean;
  requireTeamImage?: boolean;
  maxTeamMembers?: number;
  defaultRole?: 'admin' | 'member' | 'viewer';
  className?: string;
}

type WizardStep = 'details' | 'image' | 'members' | 'review' | 'success';

const initialFormState = { success: false, error: '' };

const ROLE_DESCRIPTIONS = {
  admin: 'Can manage team settings, members, and content',
  member: 'Can create and edit content, view all team data',
  viewer: 'Can view team content but cannot edit',
};

const TEAM_TEMPLATES = [
  {
    name: 'Development Team',
    description: 'Software development and engineering team',
    icon: '💻',
    defaultMembers: [
      { role: 'admin' as const, placeholder: 'team-lead@company.com' },
      { role: 'member' as const, placeholder: 'developer@company.com' },
      { role: 'member' as const, placeholder: 'designer@company.com' },
    ],
  },
  {
    name: 'Marketing Team',
    description: 'Marketing and growth team',
    icon: '📈',
    defaultMembers: [
      { role: 'admin' as const, placeholder: 'marketing-lead@company.com' },
      { role: 'member' as const, placeholder: 'content-manager@company.com' },
      { role: 'viewer' as const, placeholder: 'analyst@company.com' },
    ],
  },
  {
    name: 'Sales Team',
    description: 'Sales and customer success team',
    icon: '💼',
    defaultMembers: [
      { role: 'admin' as const, placeholder: 'sales-manager@company.com' },
      { role: 'member' as const, placeholder: 'sales-rep@company.com' },
      { role: 'member' as const, placeholder: 'success-manager@company.com' },
    ],
  },
];

export function TeamCreationWizard({
  onTeamCreated,
  onCancel,
  allowPublicTeams = true,
  requireTeamImage = false,
  maxTeamMembers = 50,
  defaultRole = 'member',
  className = '',
}: TeamCreationWizardProps) {
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState<WizardStep>('details');
  const [teamData, setTeamData] = useState({
    name: '',
    description: '',
    isPublic: false,
    imageUrl: '',
    slug: '',
  });
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [currentMemberEmail, setCurrentMemberEmail] = useState('');
  const [currentMemberRole, setCurrentMemberRole] = useState<'admin' | 'member' | 'viewer'>(
    defaultRole,
  );
  const [selectedTemplate, setSelectedTemplate] = useState<(typeof TEAM_TEMPLATES)[0] | null>(null);
  const [createdTeamId, setCreatedTeamId] = useState('');

  const [createState, createAction] = useFormState(createTeamAction, initialFormState);
  const [inviteState, inviteAction] = useFormState(inviteMembersAction, initialFormState);
  const [uploadState, uploadAction] = useFormState(uploadTeamImageAction, initialFormState);

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('teamName', teamData.name);
    formData.append('description', teamData.description);
    formData.append('isPublic', teamData.isPublic.toString());

    startTransition(async () => {
      const result = await createTeamAction(createState, formData);
      if (result?.success) {
        setCreatedTeamId(result.teamId);
        setTeamData(prev => ({ ...prev, slug: result.slug || '' }));

        if (requireTeamImage) {
          setCurrentStep('image');
        } else {
          setCurrentStep('members');
        }
      }
    });
  };

  const handleImageUpload = async (file: File) => {
    if (!file || !createdTeamId) return;

    const formData = new FormData();
    formData.append('teamId', createdTeamId);
    formData.append('image', file);

    startTransition(async () => {
      const result = await uploadTeamImageAction(uploadState, formData);
      if (result?.success) {
        setTeamData(prev => ({ ...prev, imageUrl: result.imageUrl || '' }));
        setCurrentStep('members');
      }
    });
  };

  const handleAddMember = () => {
    if (!currentMemberEmail.trim()) return;

    // Check if email already exists
    if (members.find(m => m.email.toLowerCase() === currentMemberEmail.toLowerCase())) {
      alert('This email is already added to the team');
      return;
    }

    if (members.length >= maxTeamMembers) {
      alert(`Maximum ${maxTeamMembers} members allowed`);
      return;
    }

    const newMember: TeamMember = {
      email: currentMemberEmail.trim(),
      role: currentMemberRole,
    };

    setMembers(prev => [...prev, newMember]);
    setCurrentMemberEmail('');
  };

  const handleRemoveMember = (email: string) => {
    setMembers(prev => prev.filter(m => m.email !== email));
  };

  const handleMemberRoleChange = (email: string, role: 'admin' | 'member' | 'viewer') => {
    setMembers(prev => prev.map(m => (m.email === email ? { ...m, role } : m)));
  };

  const handleTemplateSelect = (template: (typeof TEAM_TEMPLATES)[0]) => {
    setSelectedTemplate(template);
    setTeamData(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
    }));

    // Pre-populate members from template
    const templateMembers: TeamMember[] = template.defaultMembers.map(tm => ({
      email: tm.placeholder,
      role: tm.role,
    }));
    setMembers(templateMembers);
  };

  const handleInviteMembers = async () => {
    if (!createdTeamId || members.length === 0) {
      setCurrentStep('review');
      return;
    }

    const formData = new FormData();
    formData.append('teamId', createdTeamId);
    formData.append('invitations', JSON.stringify(members));

    startTransition(async () => {
      const result = await inviteMembersAction(inviteState, formData);
      if (result?.success) {
        setCurrentStep('review');
      }
    });
  };

  const handleFinishWizard = () => {
    setCurrentStep('success');
    setTimeout(() => {
      onTeamCreated({
        teamId: createdTeamId,
        ...teamData,
        members,
        memberCount: members.length,
      });
    }, 2000);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'details':
        return 'Team Details';
      case 'image':
        return 'Team Image';
      case 'members':
        return 'Invite Members';
      case 'review':
        return 'Review & Confirm';
      case 'success':
        return 'Team Created!';
      default:
        return 'Create Team';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'details':
        return 'Give your team a name and description';
      case 'image':
        return 'Upload a team image or logo';
      case 'members':
        return 'Invite team members and assign roles';
      case 'review':
        return 'Review your team settings before finishing';
      case 'success':
        return 'Your team has been created successfully';
      default:
        return '';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'member':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'viewer':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`mx-auto w-full max-w-4xl ${className}`}>
      <Card>
        <CardHeader>
          <div className="text-center">
            <div className="mb-3 text-4xl">👥</div>
            <h2 className="text-2xl font-bold text-gray-900">{getStepTitle()}</h2>
            <p className="mt-2 text-sm text-gray-600">{getStepDescription()}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error Messages */}
          {(createState.error || inviteState.error || uploadState.error) && (
            <Alert variant="destructive">
              {createState.error || inviteState.error || uploadState.error}
            </Alert>
          )}

          {/* Success Messages */}
          {(createState.success || inviteState.success || uploadState.success) &&
            currentStep !== 'success' && (
              <Alert variant="default">
                {createState.success && 'Team created successfully!'}
                {inviteState.success && `${(inviteState as any).invitationsSent || 0} invitations sent!`}
                {uploadState.success && 'Team image uploaded successfully!'}
              </Alert>
            )}

          {/* Step 1: Team Details */}
          {currentStep === 'details' && (
            <div className="space-y-6">
              {/* Team Templates */}
              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-900">
                  Choose a Template (Optional)
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {TEAM_TEMPLATES.map(template => (
                    <div
                      key={template.name}
                      onClick={() => handleTemplateSelect(template)}
                      className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                        selectedTemplate?.name === template.name
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="mb-2 text-3xl">{template.icon}</div>
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                        <p className="mt-1 text-sm text-gray-600">{template.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleDetailsSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="teamName"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Team Name *
                  </label>
                  <Input
                    id="teamName"
                    type="text"
                    required
                    value={teamData.name}
                    onChange={e => setTeamData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter team name"
                    className="w-full"
                    maxLength={50}
                  />
                  <p className="mt-1 text-xs text-gray-500">{teamData.name.length}/50 characters</p>
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={teamData.description}
                    onChange={e => setTeamData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this team does"
                    rows={3}
                    maxLength={200}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {teamData.description.length}/200 characters
                  </p>
                </div>

                {allowPublicTeams && (
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={teamData.isPublic}
                        onChange={e =>
                          setTeamData(prev => ({ ...prev, isPublic: e.target.checked }))
                        }
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="isPublic" className="text-sm text-gray-700">
                        <span className="font-medium">Make this team public</span>
                        <p className="mt-1 text-xs text-gray-500">
                          Public teams can be discovered and joined by anyone in your organization
                        </p>
                      </label>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    disabled={isPending || !teamData.name.trim()}
                    className="flex-1"
                  >
                    {isPending ? 'Creating Team...' : 'Continue'}
                  </Button>
                  {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Step 2: Team Image */}
          {currentStep === 'image' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
                  {teamData.imageUrl ? (
                    <img
                      src={teamData.imageUrl}
                      alt="Team"
                      className="h-full w-full rounded-lg object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="mb-2 text-4xl text-gray-400">📷</div>
                      <p className="text-sm text-gray-500">No image uploaded</p>
                    </div>
                  )}
                </div>

                <div>
                  <input
                    type="file"
                    id="teamImage"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="teamImage"
                    className="inline-flex cursor-pointer items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {isPending ? 'Uploading...' : 'Upload Image'}
                  </label>
                  <p className="mt-2 text-xs text-gray-500">Recommended: 150x150px, max 2MB</p>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => setCurrentStep('members')}
                  disabled={isPending}
                  className="flex-1"
                >
                  {requireTeamImage && !teamData.imageUrl ? 'Upload Image to Continue' : 'Continue'}
                </Button>
                {!requireTeamImage && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('members')}
                    disabled={isPending}
                  >
                    Skip
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Invite Members */}
          {currentStep === 'members' && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-900">Add Team Members</h3>

                <div className="mb-4 flex space-x-2">
                  <Input
                    type="email"
                    value={currentMemberEmail}
                    onChange={e => setCurrentMemberEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1"
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddMember();
                      }
                    }}
                  />
                  <select
                    value={currentMemberRole}
                    onChange={e => setCurrentMemberRole(e.target.value as any)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <Button
                    type="button"
                    onClick={handleAddMember}
                    disabled={!currentMemberEmail.trim() || members.length >= maxTeamMembers}
                    size="sm"
                  >
                    Add
                  </Button>
                </div>

                <p className="mb-4 text-xs text-gray-500">
                  {members.length}/{maxTeamMembers} members added
                </p>
              </div>

              {/* Members List */}
              {members.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Team Members ({members.length})</h4>
                  <div className="space-y-2">
                    {members.map((member, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
                            <span className="text-sm font-medium text-gray-700">
                              {member.email[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{member.email}</div>
                            <div className="text-xs text-gray-500">
                              {ROLE_DESCRIPTIONS[member.role]}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <select
                            value={member.role}
                            onChange={e =>
                              handleMemberRoleChange(member.email, e.target.value as any)
                            }
                            className={`rounded-full border px-2 py-1 text-xs ${getRoleColor(member.role)}`}
                          >
                            <option value="viewer">Viewer</option>
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                          </select>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveMember(member.email)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start">
                  <span className="mr-3 text-lg text-blue-600">ℹ️</span>
                  <div className="text-sm text-blue-800">
                    <h4 className="mb-2 font-medium">Role Permissions</h4>
                    <ul className="space-y-1">
                      <li>
                        <strong>Admin:</strong> {ROLE_DESCRIPTIONS.admin}
                      </li>
                      <li>
                        <strong>Member:</strong> {ROLE_DESCRIPTIONS.member}
                      </li>
                      <li>
                        <strong>Viewer:</strong> {ROLE_DESCRIPTIONS.viewer}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button onClick={handleInviteMembers} disabled={isPending} className="flex-1">
                  {isPending ? 'Sending Invitations...' : 'Continue'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('review')}
                  disabled={isPending}
                >
                  Skip Invitations
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 'review' && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-900">Review Team Settings</h3>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700">Team Details</h4>
                      <div className="mt-2 rounded-lg bg-gray-50 p-4">
                        <div className="mb-3 flex items-center space-x-3">
                          {teamData.imageUrl ? (
                            <img
                              src={teamData.imageUrl}
                              alt="Team"
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-300">
                              <span className="text-lg">👥</span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{teamData.name}</div>
                            <div className="text-sm text-gray-600">/{teamData.slug}</div>
                          </div>
                        </div>
                        {teamData.description && (
                          <p className="text-sm text-gray-600">{teamData.description}</p>
                        )}
                        <div className="mt-2 flex items-center space-x-2">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              teamData.isPublic
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {teamData.isPublic ? 'Public' : 'Private'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700">Team Members ({members.length})</h4>
                      <div className="mt-2 space-y-2">
                        {members.length === 0 ? (
                          <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
                            No members invited yet
                          </p>
                        ) : (
                          <div className="max-h-40 space-y-2 overflow-y-auto">
                            {members.map((member, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between rounded bg-gray-50 p-2"
                              >
                                <span className="text-sm text-gray-900">{member.email}</span>
                                <span
                                  className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getRoleColor(member.role)}`}
                                >
                                  {member.role}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-start">
                  <span className="mr-3 text-lg text-green-600">✅</span>
                  <div className="text-sm text-green-800">
                    <h4 className="mb-2 font-medium">Ready to Create Team</h4>
                    <p>
                      Your team "{teamData.name}" is ready to be created with {members.length}{' '}
                      member{members.length !== 1 ? 's' : ''}.
                      {members.length > 0 && ' Invitation emails will be sent to all members.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button onClick={handleFinishWizard} disabled={isPending} className="flex-1">
                  Create Team
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('members')}
                  disabled={isPending}
                >
                  Back
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {currentStep === 'success' && (
            <div className="space-y-6 text-center">
              <div className="mb-4 text-6xl">🎉</div>
              <div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  Team Created Successfully!
                </h3>
                <p className="text-sm text-gray-600">
                  "{teamData.name}" has been created and is ready to use.
                </p>
              </div>

              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="text-sm text-green-800">
                  <h4 className="mb-2 font-medium">What happens next:</h4>
                  <ul className="list-inside list-disc space-y-1 text-left">
                    <li>Your team dashboard is now available</li>
                    {members.length > 0 && (
                      <li>
                        Invitation emails have been sent to {members.length} member
                        {members.length !== 1 ? 's' : ''}
                      </li>
                    )}
                    <li>You can start adding content and managing team settings</li>
                    <li>Invite more members anytime from team settings</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-center py-4">
                <div className="flex items-center space-x-3">
                  <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600" />
                  <span className="text-sm text-gray-600">Redirecting to your team...</span>
                </div>
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              {['details', 'image', 'members', 'review', 'success'].map((step, index) => {
                const stepNames = ['Details', 'Image', 'Members', 'Review', 'Success'];
                const isActive = currentStep === step;
                const isCompleted =
                  ['details', 'image', 'members', 'review', 'success'].indexOf(currentStep) > index;

                return (
                  <div key={step} className="flex items-center">
                    <div className="flex items-center space-x-1">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          isActive ? 'bg-blue-500' : isCompleted ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      />
                      <span
                        className={isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : ''}
                      >
                        {stepNames[index]}
                      </span>
                    </div>
                    {index < stepNames.length - 1 && <div className="mx-2 h-px w-8 bg-gray-300" />}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">🔒 Team data is encrypted and secure</p>
      </div>
    </div>
  );
}
