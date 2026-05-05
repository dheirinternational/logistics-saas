"use client"

import { faqs } from '@/assets/faqs/faqs'
import { Announcements } from '@/components/base/Announcements'
import Carousel from '@/components/base/Carousel'
import CTARedirectButton from '@/components/base/CTARedirectButton'
import FAQ from '@/components/base/FAQ'
import { ctaButtonsProps } from '@/components_map_definitions/ctaRedirectButtons'
import { NextPage } from 'next'
import Link from 'next/link'
import { useState } from 'react'

const Page: NextPage = ({}) => {

  // States
  const [isFaqBoxExpanded, setIsFaqBoxExpanded] = useState(false)
  const [isReviewBoxActive, setIsReviewBoxActive] = useState(false)


  return <div className='h-full max-h-full pb-50'>
    {/* Carousel */}
      <Carousel />

      <Announcements />

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

      {/* FAQ */}
      <div className="p-body min-h-160 bg-light/90 flex justify-center flex-col items-center">
        <div>
          <h2 className="tracking-wide font-semibold text-accent-red text-3xl text-center">
            FAQ
          </h2>
          <p className="text-primary-text/60 text-base leading-relaxed mt-4 mb-8 text-[10px]">
            Below are some of our frequently asked questions
          </p>
        </div>
        <div className="space-y-4 md:max-w-100 max-h-80 overflow-y-hidden mt-12">
          
          {
            faqs.map( (faq, i) => 
              <FAQ key={i}  {...faq}/>              
            )
          }
          {/* <FAQ/> */}
          
        </div>
      </div>



      {/* Reviews */}

      <div className='bg-red-400/10 p-body mb-20 min-h-70'>
        <div>
          <h2 className='text-center text-2xl font-semibold'>
            Customer Reviews
          </h2>
          <p className="text-primary-text/60 text-base leading-relaxed mt-4 mb-8 text-[11px] text-center">
            Here is what some of our clients have to say about our services 
          </p>
        </div>

        <div className='h-130 center-items'>

          <div className='w-60 h-60 bg-light shadow-dark/10 shadow rounded-lg flex flex-col p-body gap-15 items-stretch pt-10 justify-between'>
            <div className='center-items flex-col gap-4'>
              <h2 className='text-sm w-full font-semibold'>
                Title of review
              </h2>
              <p className='text-[10px] text-dark/70'>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Placeat, ducimus corporis, neque at excepturi officiis reiciendis voluptate nemo tempore 
              </p>
            </div>
            
            <div className='text-[10px] text-dark/60'>
              <p>-- Name of the Commenter --</p>
            </div>
          </div>

          
        </div>
        <div className='center-items'>
          <button className='mb-20 mx-auto'
          onClick={() => setIsReviewBoxActive(prev => !prev)}
          >
            Add Review...
          </button>
          {
            isReviewBoxActive &&
            <div className='bg-white'>

              <label>
                
              </label>
            </div>
          }
        </div>
      </div>
 
  </div>
}

export default Page