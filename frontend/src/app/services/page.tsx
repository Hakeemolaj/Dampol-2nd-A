import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const documentServices = [
  {
    id: "barangay-clearance",
    title: "Barangay Clearance",
    description: "Certificate of good moral character for employment, business, and other legal purposes",
    fee: "₱50.00",
    processingTime: "1-2 business days",
    requirements: [
      "Valid government-issued ID",
      "Proof of residency in Dampol 2nd A",
      "Completed application form",
      "2x2 ID picture (2 pieces)"
    ],
    icon: "📄",
    href: "/services/barangay-clearance",
  },
  {
    id: "certificate-residency",
    title: "Certificate of Residency",
    description: "Official proof of residence in Barangay Dampol 2nd A for various applications",
    fee: "₱30.00",
    processingTime: "1 business day",
    requirements: [
      "Valid government-issued ID",
      "Utility bill or lease contract",
      "Completed application form"
    ],
    icon: "🏠",
    href: "/services/certificate-residency",
  },
  {
    id: "business-permit",
    title: "Barangay Business Permit",
    description: "Permit for small business operations within Barangay Dampol 2nd A",
    fee: "₱100.00",
    processingTime: "3-5 business days",
    requirements: [
      "Valid government-issued ID",
      "Business registration documents",
      "Location sketch/map",
      "Completed application form",
      "Proof of business location"
    ],
    icon: "💼",
    href: "/services/business-permit",
  },
  {
    id: "certificate-indigency",
    title: "Certificate of Indigency",
    description: "Certificate for low-income residents to access government assistance programs",
    fee: "Free",
    processingTime: "2-3 business days",
    requirements: [
      "Valid government-issued ID",
      "Proof of residency",
      "Income statement or affidavit",
      "Completed application form"
    ],
    icon: "🤝",
    href: "/services/certificate-indigency",
  },
  {
    id: "barangay-id",
    title: "Barangay ID",
    description: "Official identification card for Barangay Dampol 2nd A residents",
    fee: "₱25.00",
    processingTime: "5-7 business days",
    requirements: [
      "Valid government-issued ID",
      "Proof of residency",
      "2x2 ID picture (3 pieces)",
      "Completed application form"
    ],
    icon: "🆔",
    href: "/services/barangay-id",
  },
];

const otherServices = [
  {
    title: "Complaint Filing",
    description: "File complaints and disputes for mediation",
    icon: "⚖️",
    href: "/services/complaints",
  },
  {
    title: "Emergency Assistance",
    description: "Request emergency assistance and support",
    icon: "🚨",
    href: "/services/emergency",
  },
  {
    title: "Community Events",
    description: "Information about upcoming community events",
    icon: "🎉",
    href: "/services/events",
  },
];

export default function ServicesPage() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Barangay Services</h1>
        <p className="mt-4 text-xl text-gray-600">
          Online services for Barangay Dampol 2nd A residents
        </p>
        <p className="mt-2 text-lg text-gray-500">
          Fast, convenient, and secure document processing
        </p>
      </div>

      {/* Document Services */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Document Requests</h2>
          <p className="mt-4 text-lg text-gray-600">
            Apply for official documents online
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {documentServices.map((service) => (
            <Card key={service.id} className="government-card group hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <span className="text-3xl" aria-hidden="true">{service.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span className="font-medium text-primary-600">{service.fee}</span>
                      <span>•</span>
                      <span>{service.processingTime}</span>
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-3">{service.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Requirements:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {service.requirements.slice(0, 3).map((req, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-primary-500 mr-2">•</span>
                        {req}
                      </li>
                    ))}
                    {service.requirements.length > 3 && (
                      <li className="text-primary-600 text-xs">
                        +{service.requirements.length - 3} more requirements
                      </li>
                    )}
                  </ul>
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
      </section>

      {/* Other Services */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Other Services</h2>
          <p className="mt-4 text-lg text-gray-600">
            Additional community services and assistance
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {otherServices.map((service) => (
            <Card key={service.title} className="government-card group hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4" aria-hidden="true">{service.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href={service.href}>
                    Learn More
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Help Section */}
      <section className="bg-primary-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h2>
        <p className="text-gray-600 mb-6">
          Our staff is ready to assist you with your document requests and other services.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link href="/contact">
              📞 Contact Us
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/about/office-hours">
              🕒 Office Hours
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/faq">
              ❓ FAQ
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
