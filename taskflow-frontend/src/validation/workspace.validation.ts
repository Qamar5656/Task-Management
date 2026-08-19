import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(2, 'Workspace name must be at least 2 characters long').max(100, 'Workspace name must be less than 100 characters'),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

export const renameWorkspaceSchema = createWorkspaceSchema;
export type RenameWorkspaceInput = CreateWorkspaceInput;

export const inviteMemberSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Invalid email address'),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER'], { required_error: 'Role is required' }),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

export const createProjectSchema = z.object({
  name: z.string().trim().min(2, 'Project name must be at least 2 characters long').max(100, 'Project name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const renameProjectSchema = z.object({
  name: z.string().trim().min(2, 'Project name must be at least 2 characters long').max(100, 'Project name must be less than 100 characters'),
});

export type RenameProjectInput = z.infer<typeof renameProjectSchema>;

export const createLabelSchema = z.object({
  name: z.string().trim().min(1, 'Label name is required').max(30, 'Label name must be less than 30 characters'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color code'),
});

export type CreateLabelInput = z.infer<typeof createLabelSchema>;
