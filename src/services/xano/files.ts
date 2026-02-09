// File upload methods for Xano API

import { XanoClient, getXanoBaseUrl } from './client'

export function addFileMethods<T extends XanoClient>(client: T) {
  return {
    async uploadFile(file: File) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        // Access protected members via any cast (needed for file upload)
        const clientAny = client as any
        const authToken = typeof window !== 'undefined'
          ? localStorage.getItem('xano_auth_token')
          : null

        const response = await fetch(`${clientAny.apiUrl}/upload/image`, {
          method: 'POST',
          headers: {
            Authorization: authToken ? `Bearer ${authToken}` : '',
          },
          body: formData,
        })

        const data = await response.json()

        if (!response.ok) {
          return { data: null, error: data.message || 'Upload failed' }
        }

        // Convert relative path to full URL
        if (data.file?.path) {
          const baseUrl = getXanoBaseUrl()
          data.file.url = `${baseUrl}${data.file.path}`
        }

        return { data }
      } catch (error) {
        return { data: null, error: 'Upload error' }
      }
    },
  }
}
