import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { patientsApi } from '../../api/patientsApi';

/**
 * Hook to fetch all patients
 */
export const usePatients = () => {
  return useQuery({
    queryKey: ['patients', 'list'],
    queryFn: () => patientsApi.getAll(),
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
};

/**
 * Hook to fetch single patient by ID
 */
export const usePatient = (id) => {
  return useQuery({
    queryKey: ['patients', 'detail', id],
    queryFn: () => patientsApi.getById(id),
    enabled: !!id,
  });
};

/**
 * Hook to create a patient
 */
export const useCreatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patientData) => patientsApi.create(patientData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Bệnh nhân đã được tạo thành công');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể tạo bệnh nhân');
    },
  });
};

/**
 * Hook to update a patient
 */
export const useUpdatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => patientsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patients', 'detail', variables.id] });
      toast.success('Thông tin bệnh nhân đã được cập nhật');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể cập nhật bệnh nhân');
    },
  });
};
