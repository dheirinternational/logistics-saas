"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { IconChevronLeft, IconChevronRight, IconStar, IconX, IconMaximize } from "@tabler/icons-react"
import { BlurReveal } from "@/components/auth/BlurReveal"
import type { MarketingReview } from "@/lib/marketing/marketingReviews"

const GOOGLE_REVIEWS = [
  { id: "david", src: "/reviews/david.png", name: "David Antonia", alt: "David Antonia Google Review" },
  { id: "dikeh", src: "/reviews/dikeh.png", name: "Dikeh Ndidiamaka Johnson", alt: "Dikeh Ndidiamaka Google Review" },
  { id: "gloria", src: "/reviews/gloria.png", name: "Gloria Nwosu", alt: "Gloria Nwosu Google Review" },
  { id: "goldie", src: "/reviews/goldie.png", name: "Goldie", alt: "Goldie Google Review" },
  { id: "kehinde", src: "/reviews/kehinde.png", name: "Kehinde Ifeoluwa", alt: "Kehinde Ifeoluwa Google Review" },
  { id: "lily", src: "/reviews/lily.png", name: "Lilyyy Emily", alt: "Lilyyy Emily Google Review" },
  { id: "oluwatoyin", src: "/reviews/oluwatoyin.png", name: "Oluwatoyin", alt: "Oluwatoyin Google Review" },
  { id: "owoyemi", src: "/reviews/owoyemi.png", name: "Owoyemi Oluwaseun", alt: "Owoyemi Oluwaseun Google Review" },
  { id: "pearl", src: "/reviews/pearl.png", name: "Pearl", alt: "Pearl Google Review" },
  { id: "rukayat", src: "/reviews/rukayat.png", name: "Rukayat Adio", alt: "Rukayat Adio Google Review" },
]

const PASTEL_CARD_COLORS = [
  "bg-[#fef08a] text-slate-900", // Soft yellow
  "bg-[#fca5a5] text-slate-900", // Soft pink/coral
  "bg-[#7dd3fc] text-slate-900", // Soft sky blue
  "bg-[#d9f99d] text-slate-900", // Soft lime green
  "bg-[#e9d5ff] text-slate-900", // Soft lavender
  "bg-[#a7f3d0] text-slate-900", // Soft mint
]

export function ReviewsSection({ initialReviews }: { initialReviews?: MarketingReview[] }) {
  const [googleIndex, setGoogleIndex] = useState(0)
  const [websiteReviews, setWebsiteReviews] = useState<MarketingReview[]>(initialReviews || [])
  const [websitePageIndex, setWebsitePageIndex] = useState(0)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  const googleSliderRef = useRef<HTMLDivElement>(null)

  // Fetch dynamic website reviews from API on mount
  useEffect(() => {
    let active = true
    async function fetchReviews() {
      try {
        const res = await fetch("/api/reviews", { cache: "no-store" })
        const json = await res.json()
        if (active && json.success && Array.isArray(json.data) && json.data.length > 0) {
          const apiReviews: MarketingReview[] = json.data.map((r: any) => ({
            id: Number(r.id),
            name: String(r.name || "Verified Customer"),
            review: String(r.review || ""),
            rating: Math.min(5, Math.max(1, Number(r.rating || 5))),
          }))
          setWebsiteReviews(apiReviews)
        }
      } catch (err) {
        console.error("Could not load dynamic website reviews", err)
      }
    }
    fetchReviews()
    return () => {
      active = false
    }
  }, [])

  // Google slider controls
  const handleGooglePrev = () => {
    setGoogleIndex((prev) => (prev === 0 ? GOOGLE_REVIEWS.length - 1 : prev - 1))
  }

  const handleGoogleNext = () => {
    setGoogleIndex((prev) => (prev === GOOGLE_REVIEWS.length - 1 ? 0 : prev + 1))
  }

  // Scroll track when googleIndex changes
  useEffect(() => {
    if (googleSliderRef.current) {
      const container = googleSliderRef.current
      const cardWidth = container.clientWidth > 768 ? 560 : 320
      container.scrollTo({
        left: googleIndex * (cardWidth + 24),
        behavior: "smooth",
      })
    }
  }, [googleIndex])

  // Pagination for Website Reviews (display 3 at a time)
  const itemsPerPage = 3
  const totalWebsitePages = Math.ceil(websiteReviews.length / itemsPerPage)
  const currentWebsiteReviews = websiteReviews.slice(
    websitePageIndex * itemsPerPage,
    (websitePageIndex + 1) * itemsPerPage
  )

  const handleWebsitePrev = () => {
    setWebsitePageIndex((prev) => (prev === 0 ? totalWebsitePages - 1 : prev - 1))
  }

  const handleWebsiteNext = () => {
    setWebsitePageIndex((prev) => (prev === totalWebsitePages - 1 ? 0 : prev + 1))
  }

  return (
    <section id="reviews" className="marketing-section py-16 md:py-24 bg-[#f8fafc]">
      <div className="marketing-container">
        
        {/* ================= PART A: GOOGLE REVIEWS SLIDER ================= */}
        <div className="mb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <BlurReveal delay={0}>
                <p className="text-xs font-bold uppercase tracking-widest text-dheir-blue">
                  Verified Testimonials
                </p>
              </BlurReveal>
              <BlurReveal delay={60}>
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mt-2">
                  Reviews from Google
                </h2>
              </BlurReveal>
              <BlurReveal delay={120}>
                <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
                  Real feedback from verified importers, retailers, and business owners on Google. Click any image to expand.
                </p>
              </BlurReveal>
            </div>

            {/* Slider Controls matching reference screenshot 2 */}
            <BlurReveal delay={160} className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleGooglePrev}
                className="w-12 h-12 rounded-full bg-white text-slate-900 flex items-center justify-center transition-all hover:bg-slate-200 cursor-pointer"
                aria-label="Previous Google Review"
              >
                <IconChevronLeft size={22} stroke={2.5} />
              </button>
              <button
                type="button"
                onClick={handleGoogleNext}
                className="w-12 h-12 rounded-full bg-dheir-blue text-white flex items-center justify-center transition-all hover:bg-blue-700 cursor-pointer"
                aria-label="Next Google Review"
              >
                <IconChevronRight size={22} stroke={2.5} />
              </button>
            </BlurReveal>
          </div>

          {/* Google Reviews Carousel Slider Track with Large Legible Cards */}
          <div
            ref={googleSliderRef}
            className="flex gap-6 overflow-x-auto pb-4 pt-2 [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
          >
            {GOOGLE_REVIEWS.map((item, idx) => (
              <BlurReveal key={item.id} delay={180 + idx * 30}>
                <div
                  onClick={() => setLightboxImage(item.src)}
                  className="w-[320px] sm:w-[480px] md:w-[560px] lg:w-[620px] shrink-0 p-5 sm:p-6 rounded-3xl bg-white flex flex-col gap-4 cursor-pointer transition-transform duration-300 hover:-translate-y-2"
                >
                  <div className="flex items-center justify-between px-1">
                    <span className="font-display text-sm sm:text-base font-extrabold text-slate-900">
                      {item.name}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-dheir-blue bg-blue-50 px-3 py-1 rounded-full">
                      <IconMaximize size={13} stroke={2.5} />
                      <span>Expand</span>
                    </span>
                  </div>

                  <div className="relative w-full h-[240px] sm:h-[320px] md:h-[380px] lg:h-[420px] rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 768px) 320px, 620px"
                    />
                  </div>
                </div>
              </BlurReveal>
            ))}
          </div>
        </div>

        {/* ================= PART B: WEBSITE CUSTOMER REVIEWS ================= */}
        <div>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <BlurReveal delay={0}>
                <p className="text-xs font-bold uppercase tracking-widest text-dheir-blue">
                  What People Are Saying
                </p>
              </BlurReveal>
              <BlurReveal delay={60}>
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mt-2">
                  Reviews from Our Website
                </h2>
              </BlurReveal>
              <BlurReveal delay={120}>
                <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
                  Direct reviews submitted by registered customers using the D_HEIR dashboard.
                </p>
              </BlurReveal>
            </div>

            {/* Pagination Controls matching reference screenshot 2 */}
            {totalWebsitePages > 1 && (
              <BlurReveal delay={160} className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleWebsitePrev}
                  className="w-12 h-12 rounded-full bg-white text-slate-900 flex items-center justify-center transition-all hover:bg-slate-200 cursor-pointer"
                  aria-label="Previous Website Reviews"
                >
                  <IconChevronLeft size={22} stroke={2.5} />
                </button>
                <button
                  type="button"
                  onClick={handleWebsiteNext}
                  className="w-12 h-12 rounded-full bg-dheir-blue text-white flex items-center justify-center transition-all hover:bg-blue-700 cursor-pointer"
                  aria-label="Next Website Reviews"
                >
                  <IconChevronRight size={22} stroke={2.5} />
                </button>
              </BlurReveal>
            )}
          </div>

          {/* Website Reviews Grid (Pastel Color Cards matching reference screenshot 1) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentWebsiteReviews.map((rev, idx) => {
              const cardStyle = PASTEL_CARD_COLORS[idx % PASTEL_CARD_COLORS.length]
              const initials = rev.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()

              return (
                <BlurReveal key={`${rev.id}-${idx}`} delay={180 + idx * 60}>
                  <div
                    className={`p-8 rounded-3xl ${cardStyle} flex flex-col justify-between h-full transition-transform duration-300 hover:-translate-y-2 cursor-pointer min-h-[260px]`}
                  >
                    {/* Review Quote Text */}
                    <p className="text-sm sm:text-base font-medium leading-relaxed mb-6">
                      &quot;{rev.review}&quot;
                    </p>

                    {/* Reviewer Row matching reference screenshot 2 */}
                    <div className="flex items-center justify-between pt-4 border-t border-black/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {initials}
                        </div>
                        <div>
                          <h3 className="font-display text-sm font-extrabold leading-snug">
                            {rev.name}
                          </h3>
                          <p className="text-[11px] font-semibold opacity-75">
                            Verified Customer
                          </p>
                        </div>
                      </div>

                      {/* Gold Rating Stars */}
                      <div className="flex items-center gap-0.5 text-amber-900 shrink-0">
                        {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                          <IconStar key={i} size={15} className="fill-current text-amber-900" />
                        ))}
                      </div>
                    </div>
                  </div>
                </BlurReveal>
              )
            })}
          </div>
        </div>

      </div>

      {/* Lightbox Modal for Google Review Screenshot Preview */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:p-8"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-5xl w-full bg-white p-4 sm:p-6 rounded-3xl flex flex-col items-center">
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 cursor-pointer z-10"
              aria-label="Close Preview"
            >
              <IconX size={20} stroke={2.5} />
            </button>
            <div className="relative w-full h-[70vh] sm:h-[80vh]">
              <Image
                src={lightboxImage}
                alt="Google Review Full Screenshot"
                fill
                className="object-contain rounded-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
