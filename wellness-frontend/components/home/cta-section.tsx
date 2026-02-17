import React from 'react'
import { ArrowRight, Calendar, Phone, MessageCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const CTASection = () => {
  const benefits = [
    "24/7 Medical Support",
    "Board-Certified Doctors",
    "HIPAA Compliant Platform",
    "Instant Prescription Delivery",
    "Emergency Care Coordination"
  ]

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-40 h-40 bg-[#bed16b] rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-32 right-20 w-32 h-32 bg-[#ea8f39] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-[#bed16b] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-10 right-1/3 w-28 h-28 bg-[#ea8f39] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '6s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary rounded-full blur-3xl animate-pulse" style={{ animationDelay: '8s' }}></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23bed16b' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {/* Main CTA */}
          <div className="mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Ready to Transform Your
              <br />
              <span className="text-primary">
                Health Journey?
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Join thousands of patients who have already experienced the future of healthcare. 
              Get started today and take control of your wellness with our comprehensive platform.
            </p>

            {/* Benefits List */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-slate-700">
                  <CheckCircle className="w-5 h-5 text-[#ea8f39]" />
                  <span className="font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button className="px-10 py-4 bg-primary hover:from-[#a8c55a] hover:to-[#d67d2a] text-white text-lg font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
                <Calendar className="mr-2 w-5 h-5" />
                Book Your First Appointment
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button className="px-10 py-4 border-2 border-slate-300 text-slate-700 hover:bg-slate-100 text-lg font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg">
                <Phone className="mr-2 w-5 h-5" />
                Call Now: (555) 123-4567
              </Button>
            </div>
          </div>

          {/* Contact Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Book Appointment */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:bg-slate-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Book Appointment</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Schedule a consultation with our expert doctors at your convenience.
              </p>
              <Button className="w-full bg-primary hover:from-[#a8c55a] hover:to-[#d67d2a] text-white font-bold rounded-full transition-all duration-300 shadow-lg">
                Schedule Now
              </Button>
            </div>

            {/* Emergency Care */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:bg-slate-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Emergency Care</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Get immediate medical assistance with our 24/7 emergency support.
              </p>
              <Button className="w-full bg-primary hover:from-[#a8c55a] hover:to-[#d67d2a] text-white font-bold rounded-full transition-all duration-300 shadow-lg">
                Call Emergency
              </Button>
            </div>

            {/* Live Chat */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:bg-slate-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Live Chat</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Chat with our medical professionals for quick health advice and support.
              </p>
              <Button className="w-full bg-primary hover:from-[#a8c55a] hover:to-[#d67d2a] text-white font-bold rounded-full transition-all duration-300 shadow-lg">
                Start Chat
              </Button>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 pt-8 border-t border-slate-200">
            <p className="text-slate-500 text-sm mb-4">Trusted by patients worldwide</p>
            <div className="flex flex-wrap justify-center items-center gap-8">
              <div className="text-slate-700 font-semibold">HIPAA Compliant</div>
              <div className="text-slate-700 font-semibold">Board Certified Doctors</div>
              <div className="text-slate-700 font-semibold">24/7 Support</div>
              <div className="text-slate-700 font-semibold">Secure Platform</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTASection
