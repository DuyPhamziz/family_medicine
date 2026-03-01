/**
 * Query key factory for React Query
 * Centralized key management to avoid collisions and enable easy invalidation
 */

export const queryKeys = {
  // Forms
  forms: {
    all: ['forms'],
    lists: () => [...queryKeys.forms.all, 'list'],
    list: (filters) => [...queryKeys.forms.lists(), filters],
    details: () => [...queryKeys.forms.all, 'detail'],
    detail: (id) => [...queryKeys.forms.details(), id],
  },

  // Submissions
  submissions: {
    all: ['submissions'],
    lists: () => [...queryKeys.submissions.all, 'list'],
    list: (filters) => [...queryKeys.submissions.lists(), filters],
    details: () => [...queryKeys.submissions.all, 'detail'],
    detail: (id) => [...queryKeys.submissions.details(), id],
    stats: () => [...queryKeys.submissions.all, 'stats'],
  },

  // Doctor
  doctor: {
    all: ['doctor'],
    stats: () => [...queryKeys.doctor.all, 'stats'],
    submissions: (status) => [...queryKeys.doctor.all, 'submissions', status],
    submission: (id) => [...queryKeys.doctor.all, 'submission', id],
  },

  // Public Forms
  publicForms: {
    all: ['publicForms'],
    lists: () => [...queryKeys.publicForms.all, 'list'],
    detail: (slugOrToken) => [...queryKeys.publicForms.all, 'detail', slugOrToken],
  },

  scoring: {
    all: ['scoring'],
    compute: (formula) => [...queryKeys.scoring.all, 'compute', formula],
  },

  // Admin
  admin: {
    all: ['admin'],
    forms: () => [...queryKeys.admin.all, 'forms'],
    questions: (formId) => [...queryKeys.admin.all, 'questions', formId],
  },
};
