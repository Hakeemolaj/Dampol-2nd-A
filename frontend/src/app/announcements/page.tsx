'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAnnouncements, useCategories } from '@/hooks/use-announcements';
import { formatDate } from '@/lib/utils';

export default function AnnouncementsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { announcements, loading, error, pagination } = useAnnouncements({
    category: selectedCategory || undefined,
    priority: selectedPriority || undefined,
    limit: 10,
  });

  const { categories } = useCategories();

  // Filter announcements by search term (client-side)
  const filteredAnnouncements = announcements.filter(announcement =>
    announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">Announcements</h1>
            <p className="mt-4 text-lg text-gray-600">
              Stay informed with the latest news and updates from your barangay
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex space-x-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Priorities</option>
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="h-4 w-16 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-4 w-20 bg-gray-200 rounded ml-4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-error-200 bg-error-50">
            <CardContent className="p-6 text-center">
              <div className="text-error-600 mb-2">⚠️ Unable to load announcements</div>
              <p className="text-error-700 text-sm">{error}</p>
              <p className="text-gray-600 text-sm mt-2">
                Please check your internet connection or try again later.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Announcements List */}
        {!loading && !error && (
          <>
            {filteredAnnouncements.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-gray-500 mb-2">📢</div>
                  <p className="text-gray-600">
                    {searchTerm || selectedCategory || selectedPriority
                      ? 'No announcements match your search criteria.'
                      : 'No announcements available at the moment.'}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    {searchTerm || selectedCategory || selectedPriority
                      ? 'Try adjusting your filters or search terms.'
                      : 'Check back later for updates from your barangay.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredAnnouncements.map((announcement) => (
                  <Card key={announcement.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-3">
                            <span className="text-sm font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
                              {announcement.category}
                            </span>
                            {announcement.priority === 'urgent' && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-error-100 text-error-800 rounded-full">
                                Urgent
                              </span>
                            )}
                          </div>
                          
                          <h2 className="text-xl font-semibold text-gray-900 mb-3">
                            <Link 
                              href={`/announcements/${announcement.id}`}
                              className="hover:text-primary-600 transition-colors"
                            >
                              {announcement.title}
                            </Link>
                          </h2>
                          
                          <p className="text-gray-600 mb-4 leading-relaxed">
                            {announcement.summary}
                          </p>
                          
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>By {announcement.author}</span>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/announcements/${announcement.id}`}>
                                Read More
                              </Link>
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-500 ml-6 text-right">
                          <div className="font-medium">
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
                ))}
              </div>
            )}

            {/* Pagination Info */}
            {pagination && filteredAnnouncements.length > 0 && (
              <div className="mt-8 text-center text-sm text-gray-600">
                Showing {filteredAnnouncements.length} of {pagination.total} announcements
                {pagination.hasMore && (
                  <div className="mt-4">
                    <Button variant="outline">
                      Load More
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
