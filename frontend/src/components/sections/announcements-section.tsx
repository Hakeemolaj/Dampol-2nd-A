'use client'

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAnnouncements } from '@/hooks/use-announcements';
import { formatDate } from '@/lib/utils';

export function AnnouncementsSection() {
  const { announcements, loading, error } = useAnnouncements({ limit: 3 });

  if (loading) {
    return (
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Latest Announcements</h2>
            <p className="mt-2 text-lg text-gray-600">
              Stay updated with community news and important notices
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/announcements">
              View All
            </Link>
          </Button>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="government-card animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-4 w-20 bg-gray-200 rounded ml-4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Latest Announcements</h2>
            <p className="mt-2 text-lg text-gray-600">
              Stay updated with community news and important notices
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/announcements">
              View All
            </Link>
          </Button>
        </div>
        
        <Card className="government-card border-error-200 bg-error-50">
          <CardContent className="p-6 text-center">
            <div className="text-error-600 mb-2">⚠️ Unable to load announcements</div>
            <p className="text-error-700 text-sm">{error}</p>
            <p className="text-gray-600 text-sm mt-2">
              Please check your internet connection or try again later.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Latest Announcements</h2>
          <p className="mt-2 text-lg text-gray-600">
            Stay updated with community news and important notices
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/announcements">
            View All
          </Link>
        </Button>
      </div>
      
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <Card className="government-card">
            <CardContent className="p-6 text-center">
              <div className="text-gray-500 mb-2">📢</div>
              <p className="text-gray-600">No announcements available at the moment.</p>
              <p className="text-gray-500 text-sm mt-1">
                Check back later for updates from your barangay.
              </p>
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement.id} className="government-card hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-primary-600">
                        {announcement.category}
                      </span>
                      {announcement.priority === 'urgent' && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-error-100 text-error-800 rounded-full">
                          Urgent
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      <Link 
                        href={`/announcements/${announcement.id}`}
                        className="hover:text-primary-600 transition-colors"
                      >
                        {announcement.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 line-clamp-2">{announcement.summary}</p>
                    <div className="mt-3 flex items-center text-sm text-gray-500">
                      <span>By {announcement.author}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 ml-4 text-right">
                    <div>
                      {formatDate(announcement.publishedAt)}
                    </div>
                    {announcement.expiresAt && (
                      <div className="text-xs text-gray-400 mt-1">
                        Expires: {formatDate(announcement.expiresAt)}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {announcements.length > 0 && (
        <div className="text-center">
          <Button variant="outline" size="lg" asChild>
            <Link href="/announcements">
              View All Announcements
            </Link>
          </Button>
        </div>
      )}
    </section>
  );
}

export default AnnouncementsSection;
