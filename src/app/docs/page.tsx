"use client";

import { Container } from "@/components/ui/Container";

export default function DocsPage() {
    return (
        <main className="min-h-screen bg-white py-24">
            <Container>
                <div className="max-w-4xl mx-auto space-y-16">

                    {/* Header */}
                    <div className="text-center space-y-6 border-b border-slate-100 pb-12">
                        <h1 className="font-display text-4xl md:text-5xl text-slate-900">Documentation</h1>
                        <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                            Everything you need to know about partnering with PathSathi and integrating with our platform.
                        </p>
                    </div>

                    {/* Agency Guide Section */}
                    <section id="agencies" className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">1</div>
                            <h2 className="text-2xl font-bold text-slate-900">Agency Partner Guide</h2>
                        </div>
                        <div className="prose prose-slate max-w-none text-slate-600 pl-14">
                            <p>
                                PathSathi empowers travel agencies to showcase their routes using our immersive 3D technology.
                                As a partner, you get a dedicated dashboard to manage your routes, leads, and subscriptions.
                            </p>
                            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">Getting Started</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Sign Up:</strong> Create an account via the <a href="/signup" className="text-primary hover:underline">Partner Portal</a>.</li>
                                <li><strong>Verify Profile:</strong> Upload necessary documents (Travel License, ID) to get the "Verified Partner" badge.</li>
                                <li><strong>Subscribe to Routes:</strong> Browse our catalog of 3D routes and subscribe to the ones you sell.</li>
                                <li><strong>Receive Leads:</strong> Direct inquiries from travelers will land in your WhatsApp or Email instantly.</li>
                            </ul>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* API Reference Section */}
                    <section id="api" className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-bold">2</div>
                            <h2 className="text-2xl font-bold text-slate-900">API Reference (Beta)</h2>
                        </div>
                        <div className="prose prose-slate max-w-none text-slate-600 pl-14">
                            <p>
                                For developers building custom integrations, we offer a read-only API to fetch route details and availability.
                            </p>

                            <div className="bg-slate-900 rounded-xl p-6 my-6 text-slate-50 font-mono text-sm overflow-x-auto">
                                <div className="flex items-center gap-2 mb-4 text-slate-400 border-b border-slate-800 pb-2">
                                    <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs">GET</span>
                                    <span>/api/v1/routes</span>
                                </div>
                                <pre>{`{
  "routes": [
    {
      "id": "rt_12345",
      "name": "Siliguri to Darjeeling",
      "distance": "65km",
      "tags": ["Mountain", "Tea Garden"]
    }
  ]
}`}</pre>
                            </div>

                            <p className="text-sm text-slate-500">
                                Note: API access is currently strictly limited to Enterprise partners. Contact support to request an API key.
                            </p>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    {/* Support Section */}
                    <section id="support" className="bg-slate-50 rounded-2xl p-8 text-center">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Need Help?</h3>
                        <p className="text-slate-600 mb-6">Our support team is available Mon-Fri, 9am - 6pm IST.</p>
                        <a href="mailto:rokiroydev@gmail.com" className="inline-flex items-center justify-center px-6 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 font-medium hover:bg-slate-50 hover:border-slate-300 transition-colors">
                            Contact Support
                        </a>
                    </section>

                </div>
            </Container>
        </main>
    );
}
