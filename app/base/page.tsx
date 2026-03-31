import Carousel from '@/components/base/Carousel'
import CTARedirectButton from '@/components/base/CTARedirectButton'
import FAQ from '@/components/base/FAQ'
import { ctaButtonsProps } from '@/components_map_definitions/ctaRedirectButtons'
import { NextPage } from 'next'
import Link from 'next/link'

const Page: NextPage = ({}) => {
  return <>
    {/* Carousel */}
      <Carousel />

      {/* CTA Redirect */}
      <div className="p-body bg-light/90 flex flex-wrap gap-6 justify-center">
        {ctaButtonsProps.map( (button, i) => 
        <CTARedirectButton key={i} {...button} /> 
        )}
      </div>

      {/* About us */}
      <div className="p-body">
        
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          
          {/* LEFT TEXT */}
          <div className="space-y-5">
            <p className="text-sm font-semibold text-accent-blue uppercase tracking-wide">
              About Us
            </p>

            <h2 className="text-3xl md:text-4xl font-bold text-primary-text leading-tight">
              Shipping from China shouldn’t feel complicated
            </h2>

            <p className="text-primary-text/60 text-base leading-relaxed">
              We help you receive, track, and ship your goods from China to Nigeria 
              without stress. From warehouse handling to final delivery, everything 
              is designed to be simple, transparent, and reliable.
            </p>

            <div className="flex gap-4">
              <Link href={"/base/add_package"} className="px-5 py-2.5 bg-accent-blue text-white rounded-lg text-sm font-medium hover:bg-accent-blue/70 transition">
                Get Started
              </Link>
              
            </div>
          </div>

          {/* RIGHT FEATURES */}
          <div className="grid grid-cols-2 gap-4">
            
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <h4 className="font-semibold text-gray-800">📦 Warehouse Support</h4>
              <p className="text-sm text-gray-500 mt-1">
                Receive and manage your packages in China easily.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl shadow-sm">
              <h4 className="font-semibold text-gray-800">✈️ Air & Sea Shipping</h4>
              <p className="text-sm text-gray-500 mt-1">
                Choose speed or affordability based on your needs.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl shadow-sm">
              <h4 className="font-semibold text-gray-800">📍 Real-Time Tracking</h4>
              <p className="text-sm text-gray-500 mt-1">
                Stay updated at every stage of your shipment.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl shadow-sm">
              <h4 className="font-semibold text-gray-800">🤝 Reliable Delivery</h4>
              <p className="text-sm text-gray-500 mt-1">
                Get your goods safely to your doorstep or pickup point.
              </p>
            </div>

          </div>
        </div>
      </div>
      <div className="p-body min-h-160 bg-light/90">
        <h2 className="tracking-wide font-semibold text-accent-red">
          FAQ
        </h2>
        <p className="text-primary-text/60 text-base leading-relaxed mt-4 mb-8">
          Below are some of our frequently asked questions
        </p>
        <div className="space-y-4">
          <FAQ/>
          <FAQ/>
          <FAQ/>
        </div>
      </div>
 
  </>
}

export default Page