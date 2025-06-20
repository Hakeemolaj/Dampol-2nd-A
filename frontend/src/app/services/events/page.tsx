"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const serviceInfo = {
  title: "Community Events",
  description: "Information about upcoming community events and activities",
  upcomingEvents: [
    {
      id: 1,
      title: "Barangay Assembly Meeting",
      date: "2024-01-15",
      time: "2:00 PM",
      location: "Barangay Hall",
      description: "Monthly community meeting to discuss barangay matters and updates",
      category: "meeting",
      icon: "👥"
    },
    {
      id: 2,
      title: "Community Clean-up Drive",
      date: "2024-01-20",
      time: "6:00 AM",
      location: "Various locations in Dampol 2nd A",
      description: "Monthly community clean-up activity. Bring your own cleaning materials.",
      category: "community-service",
      icon: "🧹"
    },
    {
      id: 3,
      title: "Health and Wellness Program",
      date: "2024-01-25",
      time: "8:00 AM",
      location: "Barangay Health Center",
      description: "Free health check-up, vaccination, and health education for residents",
      category: "health",
      icon: "🏥"
    },
    {
      id: 4,
      title: "Senior Citizens' Day",
      date: "2024-02-01",
      time: "9:00 AM",
      location: "Barangay Covered Court",
      description: "Special celebration for our senior citizens with activities and free meals",
      category: "celebration",
      icon: "👴"
    },
    {
      id: 5,
      title: "Youth Development Workshop",
      date: "2024-02-10",
      time: "1:00 PM",
      location: "Barangay Hall Conference Room",
      description: "Skills development and leadership training for barangay youth",
      category: "education",
      icon: "🎓"
    },
    {
      id: 6,
      title: "Disaster Preparedness Seminar",
      date: "2024-02-15",
      time: "3:00 PM",
      location: "Barangay Hall",
      description: "Emergency preparedness training and disaster response planning",
      category: "safety",
      icon: "🚨"
    }
  ],
  eventCategories: [
    { name: "All Events", value: "all", icon: "📅" },
    { name: "Meetings", value: "meeting", icon: "👥" },
    { name: "Community Service", value: "community-service", icon: "🧹" },
    { name: "Health Programs", value: "health", icon: "🏥" },
    { name: "Celebrations", value: "celebration", icon: "🎉" },
    { name: "Education", value: "education", icon: "🎓" },
    { name: "Safety", value: "safety", icon: "🚨" }
  ]
}

export default function CommunityEventsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredEvents = selectedCategory === "all" 
    ? serviceInfo.upcomingEvents 
    : serviceInfo.upcomingEvents.filter(event => event.category === selectedCategory)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const isUpcoming = (dateString: string) => {
    const eventDate = new Date(dateString)
    const today = new Date()
    return eventDate >= today
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600">
        <Link href="/services" className="hover:text-primary-600">Services</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-900">Community Events</span>
      </nav>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Community Events</h1>
        <p className="text-xl text-gray-600 mb-2">
          Stay connected with your community through our events and activities
        </p>
        <p className="text-lg text-gray-500">
          Join us in building a stronger, more united Barangay Dampol 2nd A
        </p>
      </div>

      {/* Event Categories Filter */}
      <Card className="government-card">
        <CardHeader>
          <CardTitle>Event Categories</CardTitle>
          <CardDescription>
            Filter events by category to find what interests you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {serviceInfo.eventCategories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`p-3 rounded-lg border text-center transition-all ${
                  selectedCategory === category.value
                    ? 'bg-primary-100 border-primary-300 text-primary-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-1">{category.icon}</div>
                <div className="text-xs font-medium">{category.name}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedCategory === "all" ? "All Upcoming Events" : 
             serviceInfo.eventCategories.find(cat => cat.value === selectedCategory)?.name || "Events"}
          </h2>
          <span className="text-sm text-gray-500">
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {filteredEvents.length === 0 ? (
          <Card className="government-card">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-4">
                There are no events in this category at the moment.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setSelectedCategory("all")}
              >
                View All Events
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <Card 
                key={event.id} 
                className={`government-card hover:shadow-lg transition-all duration-200 ${
                  !isUpcoming(event.date) ? 'opacity-75' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{event.icon}</span>
                      <div>
                        <CardTitle className="text-lg leading-tight">{event.title}</CardTitle>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <span className="mr-2">📅</span>
                            {formatDate(event.date)}
                          </div>
                          <div className="flex items-center">
                            <span className="mr-2">🕐</span>
                            {event.time}
                          </div>
                          <div className="flex items-center">
                            <span className="mr-2">📍</span>
                            {event.location}
                          </div>
                        </div>
                      </div>
                    </div>
                    {!isUpcoming(event.date) && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        Past Event
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {event.description}
                  </CardDescription>
                  <div className="mt-4 flex space-x-2">
                    {isUpcoming(event.date) ? (
                      <>
                        <Button size="sm" className="flex-1">
                          Register Interest
                        </Button>
                        <Button size="sm" variant="outline">
                          Share
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" className="flex-1" disabled>
                        Event Completed
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Event Submission */}
      <Card className="government-card">
        <CardHeader>
          <CardTitle>Suggest an Event</CardTitle>
          <CardDescription>
            Have an idea for a community event? Let us know!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              We welcome suggestions for community events and activities that can benefit our residents.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/contact">
                  📧 Submit Event Suggestion
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contact">
                  📞 Contact Barangay Office
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-800 mb-3">📋 Event Guidelines</h3>
          <ul className="space-y-2 text-sm text-blue-700">
            <li>• All events are free and open to Barangay Dampol 2nd A residents</li>
            <li>• Registration may be required for some events with limited capacity</li>
            <li>• Events may be cancelled or rescheduled due to weather or other circumstances</li>
            <li>• Follow health and safety protocols during events</li>
            <li>• Contact the barangay office for more information about specific events</li>
            <li>• Check announcements for updates and changes to event schedules</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
