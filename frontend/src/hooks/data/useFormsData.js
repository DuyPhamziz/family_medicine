import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { formsApi, adminFormsApi } from '../../api/formsApi';
import { queryKeys } from '../../lib/queryKeys';

/**
 * Hook to fetch all forms (for doctors/users)
 */
export const useForms = () => {
  return useQuery({
    queryKey: queryKeys.forms.lists(),
    queryFn: () => formsApi.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes - forms don't change often
  });
};

/**
 * Hook to fetch single form by ID
 */
export const useForm = (id) => {
  return useQuery({
    queryKey: queryKeys.forms.detail(id),
    queryFn: () => formsApi.getById(id),
    enabled: !!id,
  });
};

/**
 * Hook to fetch public form by slug or token
 */
export const usePublicForm = (slugOrToken) => {
  return useQuery({
    queryKey: queryKeys.publicForms.detail(slugOrToken),
    queryFn: async () => {
      // Try to get by slug first, fallback to token
      try {
        return await formsApi.getBySlug?.(slugOrToken) || await formsApi.getByToken(slugOrToken);
      } catch {
        return await formsApi.getByToken(slugOrToken);
      }
    },
    enabled: !!slugOrToken,
  });
};

/**
 * Hook to create a form (admin)
 */
export const useCreateForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => adminFormsApi.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forms.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.forms() });
      toast.success('Form đã được tạo thành công');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể tạo form');
    },
  });
};

/**
 * Hook to update a form (admin)
 */
export const useUpdateForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => adminFormsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forms.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.forms.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.forms() });
      toast.success('Form đã được cập nhật');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể cập nhật form');
    },
  });
};

/**
 * Hook to delete a form (admin)
 */
export const useDeleteForm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => adminFormsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forms.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.forms() });
      toast.success('Form đã được xóa');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể xóa form');
    },
  });
};
