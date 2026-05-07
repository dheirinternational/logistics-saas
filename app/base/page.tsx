"use client"

import { faqs } from '@/assets/faqs/faqs'
import { Announcements } from '@/components/base/Announcements'
import Carousel from '@/components/base/Carousel'
import CTARedirectButton from '@/components/base/CTARedirectButton'
import FAQ from '@/components/base/FAQ'
import { ctaButtonsProps } from '@/components_map_definitions/ctaRedirectButtons'
import { Reviews } from '@/types/entityTypeDef'
import { NextPage } from 'next'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FaQuoteLeft } from 'react-icons/fa'
import { BeatLoader } from 'react-spinners'
import { toast } from 'react-toastify'

const Page: NextPage = ({}) => {

  // Arrays
  const [reviews, setReviews] = useState<Reviews[]>()


  // placeholders
  const [newReview, setNewReview] = useState("")


  // States
  const [isFaqBoxExpanded, setIsFaqBoxExpanded] = useState(false)
  const [isReviewBoxActive, setIsReviewBoxActive] = useState(false)
  


  // Loading States 
  const [isPostingReview, setIsPostingReview] = useState(false)
  const [isFetchingReviews, setIsFetchingReviews] = useState(false)




  // Function to post review to backend
  const handleReviewPost = async () => {
    if(newReview.length < 15){
      toast.error("Review cannot be less than 15 characters")
      return
    }
    setIsPostingReview(true)
    try{
      const res = await fetch(`/api/reviews`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type" : "application/json"
        },
        body: JSON.stringify({
          review: newReview
        })
      })
    }
    catch(err){
      console.error("Network Error", err)
      toast.error("Network Error")
    }
    finally{
      setIsPostingReview(false)
    }
  }

  // Function to fetch User reviews
  const fetchReviews = async () => {
    setIsFetchingReviews(true)
    try{
      const res = await fetch(`/api/reviews`)
      const result = await res.json()

      if (!res.ok){
        toast.error(result.message)
        return 
      }

      setReviews(result.data)
    }

    catch(err){
      console.error("Network Error", err)
      toast.error("Network Error")
    }
    finally{
      setIsFetchingReviews(false)
    }
  }

  
  // Fetch Reviews
  useEffect(() => {
    fetchReviews()
  }, [])



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

        <div className='h-130 center-items flex max-w-full overflow-x-auto'>
          {
            isFetchingReviews ?
            <BeatLoader color='orange' size={8}/> :
            reviews?.map( review => 
              <div key={review.id} className='w-60 h-60 bg-light shadow-dark/10 shadow rounded-lg flex flex-col p-body items-stretch pt-10 '>
                <div className='flex justify-end text-2xl text-orange-400 '>
                  <FaQuoteLeft/>
                </div>
                <div>
                  <p className='font-bold mt-4'>
                    {review.name}
                  </p>
                </div>
                <div className='h-40 flex flex-col justify-between'>
                  <div className='center-items flex-col gap-4 mt-4'>
                    <p className='text-[10px] text-dark/90 italic'>
                      {`"`}{review.review}{`"`}
                    </p>
                  </div>
                  
                  <div className='text-[10px] text-dark/60'>
                    <p>{new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )
          }

          

          
        </div>
        <div className='center-items mb-40 space-x-8'>
          <button className=''
          onClick={() => setIsReviewBoxActive(prev => !prev)}
          >
            {isReviewBoxActive ? "Close" : "Add"} Review...
          </button>
          {
            isReviewBoxActive &&
            <div className='flex center-items gap-2 h-fit'>

              <label>
                <input 
                type="text" 
                name='review'
                value={newReview}
                onChange={(e) => setNewReview(e.currentTarget.value)}
                className='rounded bg-white text-[10px] py-2.5 min-w-50 px-2 outline-0'
                />
              </label>

              <button 
              className='bg-[orange] text-[10px] text-white h-full px-3 py-2.5 rounded '
              onClick={handleReviewPost}
              >
                {
                  isPostingReview ? 
                  <BeatLoader color={"white"} size={8} /> :
                  "Submit"
                }
              </button>
            </div>
          }
        </div>
      </div>
 
  </div>
}

export default Page