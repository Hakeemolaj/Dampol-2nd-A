import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnnouncementsSection } from "../components/sections/announcements-section";

const quickServices = [
  {
    title: "Barangay Clearance",
    description: "Certificate of good moral character for employment and other purposes",
    fee: "₱50.00",
    processingTime: "1-2 days",
    href: "/services/barangay-clearance",
    icon: "📄",
  },
  {
    title: "Certificate of Residency",
    description: "Proof of residence in the barangay for various applications",
    fee: "₱30.00",
    processingTime: "1 day",
    href: "/services/certificate-residency",
    icon: "🏠",
  },
  {
    title: "Business Permit",
    description: "Permit for small business operations within the barangay",
    fee: "₱100.00",
    processingTime: "3-5 days",
    href: "/services/business-permit",
    icon: "💼",
  },
];



const barangayInfo = [
  {
    title: "Barangay Officials",
    description: "Meet your elected leaders",
    icon: "👥",
    href: "/officials",
  },
  {
    title: "Demographics",
    description: "Population: 8,542 | Households: 2,134",
    icon: "📊",
    href: "/about/demographics",
  },
  {
    title: "Location",
    description: "Dampol 2nd A, Pulilan, Bulacan",
    icon: "📍",
    href: "/about/location",
  },
  {
    title: "Contact Information",
    description: "Office: (044) 815-1234 | Hours: 8AM - 5PM",
    icon: "📞",
    href: "/contact",
  },
];

export default function Home() {
  const barangayName = process.env.NEXT_PUBLIC_BARANGAY_NAME || "Barangay Dampol 2nd A";

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Welcome to {barangayName}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-primary-100">
              Pulilan, Bulacan - Your Digital Gateway to Local Government Services
            </p>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-primary-200">
              Access government services online, stay updated with community announcements,
              and connect with your local officials - all in one convenient platform.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary-700 hover:bg-primary-50" asChild>
                <Link href="/services">
                  📄 Request Documents
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-700" asChild>
                <Link href="/announcements">
                  📢 View Announcements
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-error-300 bg-error-600 text-white hover:bg-error-700" asChild>
                <Link href="/emergency">
                  🚨 Emergency Hotline
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Quick Services Section */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Quick Services</h2>
            <p className="mt-4 text-lg text-gray-600">
              Fast processing, online applications for your convenience
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quickServices.map((service) => (
              <Card key={service.title} className="government-card group hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl" aria-hidden="true">{service.icon}</span>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                  </div>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fee:</span>
                    <span className="font-medium text-primary-600">{service.fee}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Processing Time:</span>
                    <span className="font-medium">{service.processingTime}</span>
                  </div>
                  <Button className="w-full" asChild>
                    <Link href={service.href}>
                      Apply Now
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button variant="outline" size="lg" asChild>
              <Link href="/services">
                View All Services
              </Link>
            </Button>
          </div>
        </section>

        {/* Latest Announcements Section */}
        <AnnouncementsSection />

        {/* Barangay Information Section */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Barangay Information</h2>
            <p className="mt-4 text-lg text-gray-600">
              Learn more about your local government and community
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {barangayInfo.map((info) => (
              <Card key={info.title} className="government-card group hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-4" aria-hidden="true">{info.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{info.description}</p>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={info.href}>
                      Learn More
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
