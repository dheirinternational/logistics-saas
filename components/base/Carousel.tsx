"use client"

import { carouselImages } from "@/assets/carousel-images/carousel-images"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"


const Carousel = () => {

    const [currentIndex, setCurrentIndex] = useState(0)
    const [clickDetector, setClickDetector] = useState(false)
    
    const sliderRef = useRef<HTMLDivElement>(null)


    // Interval 

    useEffect(() => {
        const intervalId = setInterval(() => setCurrentIndex(prev => prev + 1) , 5000)

        return () => clearInterval(intervalId)
    }, [clickDetector])

    // Watch Transition

    useEffect(() => {
        const slider = sliderRef.current
        if (!slider) return

        function handleTransition() {

            if(!slider) return

            if(currentIndex > 3){
                slider.style.transition = "none"
                slider.style.transform = "translateX(0vw)"
                
                setTimeout(() => {
                    slider.style.transition = "transform 0.6s ease-out"
                    setCurrentIndex(0)
                }, 0)
            }
        } 

        slider.addEventListener("transitionend", handleTransition)

        return () => slider.removeEventListener("transitionend", handleTransition)
    }, [currentIndex])



  return (
    <div className="bg-accent-blue h-50 relative max-w-[100vw] overflow-hidden md:h-110">

        {/* Content Scroll bar */}
        <div 
        className={`h-full w-100 bg-accent-red flex transition-set relative`}
        style={{transform: `translateX(-${currentIndex * 100}vw)`}}
        ref={sliderRef}
        >
            {
                carouselImages.map( (img, i) => 
                <div 
                className="w-screen relative h-full min-w-screen"
                key={i}
                >
                    <Image 
                    src={img}
                    alt="Carousel Image"
                    className="object-cover"
                    loading="eager"
                    fill
                    />

                    {/* Shadow Cover */}
                    <div className="w-full h-full absolute bg-black/10 pointer-events-none" />

                    {/* Content */}
                    {/* <div className="absolute text-xs left-1/2 top-1/2 -translate-1/2">
                        <h2 className="max-w-60 text-center text-white font-bold">
                            Lorem ipsum dolor sit amet
                        </h2>
                    </div> */}
                </div>
                )
            }
            {
                carouselImages.map( (img, i) => 
                <div 
                className="w-screen relative h-full min-w-screen"
                key={i}
                >
                    <Image 
                    src={img}
                    alt="Carousel Image"
                    fill
                    />

                    {/* Shadow Cover */}
                    <div className="w-full h-full absolute bg-black/40 pointer-events-none" />

                    {/* Content */}
                    <div className="absolute text-xs left-1/2 top-1/2 -translate-1/2">
                        <h2 className="max-w-60 text-center text-white font-bold">
                            Lorem ipsum dolor sit amet
                        </h2>
                    </div>
                </div>
                )
            }
        </div>


        {/* Controls */}
        <button className="absolute top-1/2 -translate-y-1/2 left-4 text-white p-3 rounded-full bg-white/30 backdrop-blur-lg border border-white/60"
        onClick={() => {
            setCurrentIndex(prev => prev < 1 ? 3 : prev - 1)
            setClickDetector(!clickDetector)
        }}
        >
            <FaChevronLeft/>                
        </button>
        <button className="absolute top-1/2 -translate-y-1/2 right-4 text-white p-3 rounded-full bg-white/30 backdrop-blur-lg border border-white/60"
        onClick={() => {
            setCurrentIndex(prev => prev > 3 ? 0 : prev + 1)
            setClickDetector(!clickDetector)
        }}
        >
            <FaChevronRight/>
        </button>


        {/* Indicator */}
        <div className="flex w-fit left-1/2 bottom-2 -translate-x-1/2 gap-1 absolute">
            
            {carouselImages.map( (_, indicator) => 
                <div
                key={indicator} 
                className={`p-1 rounded-full transition-set 
                    ${indicator === currentIndex ? "bg-accent-red" : "bg-white"}`} 
                onClick={() => {
                    setCurrentIndex(indicator)
                    setClickDetector(!clickDetector)
                }}
                />
            )} 
        </div>

       
    </div>
  )
}

export default Carousel