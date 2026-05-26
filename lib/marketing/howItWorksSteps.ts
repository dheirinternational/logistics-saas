/** Step imagery: replace with client photos when available (Unsplash placeholders). */

export type HowItWorksStep = {
  step: number
  title: string
  description: string 
  imageSrc: string
  imageAlt: string
}

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    step: 1,
    title: "Create your account",
    description:
      "Sign up in minutes and get your customer code for every package you send to China.",
    imageSrc:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Customer creating an account",
  },
  {
    step: 2,
    title: "Copy your China warehouse address",
    description:
      "Use your DHEIR address at checkout on Taobao, 1688, or any Chinese supplier.",
    imageSrc:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Warehouse receiving area",
  },
  {
    step: 3,
    title: "We receive, measure, and quote",
    description:
      "Packages are logged, weighed, and consolidated. You see fees clearly before you pay.",
    imageSrc:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Stacked shipping boxes and parcels",
  },
  {
    step: 4,
    title: "Pay and ship to Nigeria",
    description:
      "Pay your balance, choose air or sea, and track delivery to your door in Nigeria.",
    imageSrc:
      "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Freight forwarding and delivery",
  },
]
