'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface FileUploadProps {
  requestId: string
  onUploadComplete?: (files: UploadedFile[]) => void
  maxFiles?: number
  maxFileSize?: number // in MB
  allowedTypes?: string[]
}

interface UploadedFile {
  id: string
  filename: string
  originalName: string
  size: number
  url: string
  uploadedAt: string
}

interface FileWithProgress {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
  result?: UploadedFile
}

export default function FileUpload({
  requestId,
  onUploadComplete,
  maxFiles = 5,
  maxFileSize = 5, // 5MB default
  allowedTypes = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithProgress[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || ''
  }

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`
    }

    // Check file type
    const extension = getFileExtension(file.name)
    if (!allowedTypes.includes(extension)) {
      return `File type .${extension} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
    }

    return null
  }

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const newFiles: FileWithProgress[] = []
    const currentFileCount = files.length

    for (let i = 0; i < selectedFiles.length && currentFileCount + newFiles.length < maxFiles; i++) {
      const file = selectedFiles[i]
      const error = validateFile(file)

      newFiles.push({
        file,
        progress: 0,
        status: error ? 'error' : 'pending',
        error: error || undefined
      })
    }

    setFiles(prev => [...prev, ...newFiles])

    // Start uploading valid files
    newFiles.forEach((fileWithProgress, index) => {
      if (fileWithProgress.status === 'pending') {
        uploadFile(files.length + index, fileWithProgress.file)
      }
    })
  }

  const uploadFile = async (index: number, file: File) => {
    setFiles(prev => prev.map((f, i) => 
      i === index ? { ...f, status: 'uploading' as const } : f
    ))

    try {
      const formData = new FormData()
      formData.append('documents', file)

      const xhr = new XMLHttpRequest()

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          setFiles(prev => prev.map((f, i) => 
            i === index ? { ...f, progress } : f
          ))
        }
      })

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          if (response.success && response.data.length > 0) {
            setFiles(prev => prev.map((f, i) => 
              i === index ? { 
                ...f, 
                status: 'completed' as const, 
                progress: 100,
                result: response.data[0]
              } : f
            ))

            // Call completion callback
            if (onUploadComplete) {
              onUploadComplete(response.data)
            }
          } else {
            throw new Error(response.message || 'Upload failed')
          }
        } else {
          throw new Error(`Upload failed with status ${xhr.status}`)
        }
      })

      // Handle errors
      xhr.addEventListener('error', () => {
        setFiles(prev => prev.map((f, i) => 
          i === index ? { 
            ...f, 
            status: 'error' as const, 
            error: 'Upload failed'
          } : f
        ))
      })

      // Start upload
      xhr.open('POST', `${process.env.NEXT_PUBLIC_API_URL}/api/v1/documents/requests/${requestId}/upload`)
      xhr.send(formData)

    } catch (error) {
      setFiles(prev => prev.map((f, i) => 
        i === index ? { 
          ...f, 
          status: 'error' as const, 
          error: error instanceof Error ? error.message : 'Upload failed'
        } : f
      ))
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'uploading':
        return 'bg-blue-100 text-blue-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅'
      case 'uploading':
        return '⏳'
      case 'error':
        return '❌'
      default:
        return '📄'
    }
  }

  return (
    <Card className="government-card">
      <CardHeader>
        <CardTitle>Upload Supporting Documents</CardTitle>
        <CardDescription>
          Upload required documents for your request. Maximum {maxFiles} files, {maxFileSize}MB each.
          Allowed types: {allowedTypes.join(', ').toUpperCase()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="text-4xl mb-4">📁</div>
          <p className="text-lg font-medium text-gray-900 mb-2">
            Drop files here or click to browse
          </p>
          <p className="text-sm text-gray-600 mb-4">
            {files.length}/{maxFiles} files selected
          </p>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={files.length >= maxFiles}
          >
            Choose Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={allowedTypes.map(type => `.${type}`).join(',')}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Selected Files</h4>
            {files.map((fileWithProgress, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{getStatusIcon(fileWithProgress.status)}</span>
                    <div>
                      <p className="font-medium text-gray-900">{fileWithProgress.file.name}</p>
                      <p className="text-sm text-gray-600">
                        {formatFileSize(fileWithProgress.file.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(fileWithProgress.status)}>
                      {fileWithProgress.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={fileWithProgress.status === 'uploading'}
                    >
                      Remove
                    </Button>
                  </div>
                </div>

                {/* Progress Bar */}
                {fileWithProgress.status === 'uploading' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{fileWithProgress.progress}%</span>
                    </div>
                    <Progress value={fileWithProgress.progress} className="h-2" />
                  </div>
                )}

                {/* Error Message */}
                {fileWithProgress.status === 'error' && fileWithProgress.error && (
                  <div className="text-sm text-red-600 mt-2">
                    ❌ {fileWithProgress.error}
                  </div>
                )}

                {/* Success Message */}
                {fileWithProgress.status === 'completed' && fileWithProgress.result && (
                  <div className="text-sm text-green-600 mt-2">
                    ✅ Uploaded successfully
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upload Summary */}
        {files.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {files.filter(f => f.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {files.filter(f => f.status === 'uploading').length}
                </div>
                <div className="text-sm text-gray-600">Uploading</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">
                  {files.filter(f => f.status === 'error').length}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
