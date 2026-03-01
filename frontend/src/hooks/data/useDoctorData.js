import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { doctorSubmissionApi } from '../../api/formsApi';
import { queryKeys } from '../../lib/queryKeys';

/**
 * Hook to fetch doctor dashboard stats
 */
export const useDoctorStats = () => {
  return useQuery({
    queryKey: queryKeys.doctor.stats(),
    queryFn: () => doctorSubmissionApi.getStats(),
    staleTime: 1000 * 60 * 2, // 2 minutes - stats should be relatively fresh
  });
};

/**
 * Hook to fetch doctor submissions with optional status filter
 */
export const useDoctorSubmissions = (status = null) => {
  return useQuery({
    queryKey: queryKeys.doctor.submissions(status),
    queryFn: () => doctorSubmissionApi.getAll(status),
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};

/**
 * Hook to fetch single doctor submission by ID
 */
export const useDoctorSubmission = (id) => {
  return useQuery({
    queryKey: queryKeys.doctor.submission(id),
    queryFn: () => doctorSubmissionApi.getById(id),
    enabled: !!id,
  });
};

/**
 * Hook to respond to a submission
 */
export const useRespondToSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, response }) => doctorSubmissionApi.respond(id, response),
    onSuccess: () => {
      // Invalidate stats and submissions lists
      queryClient.invalidateQueries({ queryKey: queryKeys.doctor.stats() });
      queryClient.invalidateQueries({ queryKey: queryKeys.doctor.submissions() });
      toast.success('Phản hồi đã được gửi thành công');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể gửi phản hồi');
    },
  });
};
