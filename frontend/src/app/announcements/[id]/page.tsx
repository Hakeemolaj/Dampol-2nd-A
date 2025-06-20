'use client'

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAnnouncement } from '@/hooks/use-announcements';
import { formatDateTime } from '@/lib/utils';

export default function AnnouncementDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const { announcement, loading, error } = useAnnouncement(id);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button variant="outline" asChild>
              <Link href="/announcements">
                ← Back to Announcements
              </Link>
            </Button>
          </div>
          
          <Card className="animate-pulse">
            <CardContent className="p-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-20 bg-gray-200 rounded"></div>
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button variant="outline" asChild>
              <Link href="/announcements">
                ← Back to Announcements
              </Link>
            </Button>
          </div>
          
          <Card className="border-error-200 bg-error-50">
            <CardContent className="p-8 text-center">
              <div className="text-error-600 mb-4">⚠️ Announcement not found</div>
              <p className="text-error-700 mb-4">{error}</p>
              <Button variant="outline" asChild>
                <Link href="/announcements">
                  View All Announcements
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button variant="outline" asChild>
              <Link href="/announcements">
                ← Back to Announcements
              </Link>
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-500 mb-4">📢</div>
              <p className="text-gray-600 mb-4">Announcement not found.</p>
              <Button variant="outline" asChild>
                <Link href="/announcements">
                  View All Announcements
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/announcements">
              ← Back to Announcements
            </Link>
          </Button>
        </div>

        {/* Announcement Content */}
        <Card>
          <CardContent className="p-8">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded">
                  {announcement.category}
                </span>
                {announcement.priority === 'urgent' && (
                  <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-error-100 text-error-800 rounded-full">
                    🚨 Urgent
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {announcement.title}
              </h1>
              
              <div className="flex items-center justify-between text-sm text-gray-600 border-b border-gray-200 pb-4">
                <div className="space-y-1">
                  <div>
                    <span className="font-medium">Published by:</span> {announcement.author}
                  </div>
                  <div>
                    <span className="font-medium">Published on:</span> {formatDateTime(announcement.publishedAt)}
                  </div>
                  {announcement.expiresAt && (
                    <div>
                      <span className="font-medium">Expires on:</span> {formatDateTime(announcement.expiresAt)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Summary</h2>
              <p className="text-gray-700 text-lg leading-relaxed bg-gray-50 p-4 rounded-lg">
                {announcement.summary}
              </p>
            </div>

            {/* Content */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Details</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {announcement.content}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <div>Created: {formatDateTime(announcement.createdAt)}</div>
                  {announcement.publishedAt !== announcement.createdAt && (
                    <div>Last updated: {formatDateTime(announcement.publishedAt)}</div>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/announcements">
                      View All Announcements
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: announcement.title,
                          text: announcement.summary,
                          url: window.location.href,
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link copied to clipboard!');
                      }
                    }}
                  >
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Actions */}
        <div className="mt-8 text-center">
          <div className="space-y-4">
            <p className="text-gray-600">
              Have questions about this announcement?
            </p>
            <div className="space-x-4">
              <Button variant="outline" asChild>
                <Link href="/contact">
                  Contact Barangay Office
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/services">
                  View Services
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
