import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export type PatientDocument = {
  id: string
  name: string
  path: string
  size: number | null
  createdAt: string | null
  updatedAt: string | null
  url: string | null
}

const BUCKET_NAME = 'patient-files'

const sanitizeFileName = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')

export const usePatientDocuments = (patientId?: string) => {
  return useQuery({
    queryKey: ['patient-documents', patientId],
    enabled: !!patientId,
    queryFn: async () => {
      const { data, error } = await supabase.storage.from(BUCKET_NAME).list(patientId!, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      })

      if (error) throw error

      const documents = await Promise.all(
        (data || [])
          .filter((item) => !!item.name)
          .map(async (item) => {
            const path = `${patientId}/${item.name}`
            const { data: signedUrlData } = await supabase.storage
              .from(BUCKET_NAME)
              .createSignedUrl(path, 60 * 30)

            return {
              id: path,
              name: item.name,
              path,
              size: item.metadata?.size ?? null,
              createdAt: item.created_at ?? null,
              updatedAt: item.updated_at ?? null,
              url: signedUrlData?.signedUrl ?? null
            } satisfies PatientDocument
          })
      )

      return documents
    }
  })
}

export const useUploadPatientDocument = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ patientId, file }: { patientId: string; file: File }) => {
      const fileName = `${Date.now()}-${sanitizeFileName(file.name)}`
      const filePath = `${patientId}/${fileName}`

      const { error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

      if (error) throw error
      return { patientId }
    },
    onSuccess: ({ patientId }) => {
      queryClient.invalidateQueries({ queryKey: ['patient-documents', patientId] })
    }
  })
}

export const useDeletePatientDocument = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ patientId, path }: { patientId: string; path: string }) => {
      const { error } = await supabase.storage.from(BUCKET_NAME).remove([path])
      if (error) throw error
      return { patientId }
    },
    onSuccess: ({ patientId }) => {
      queryClient.invalidateQueries({ queryKey: ['patient-documents', patientId] })
    }
  })
}
