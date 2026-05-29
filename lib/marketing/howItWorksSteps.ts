/** How it works step photos — Unsplash (images.unsplash.com) */

export type HowItWorksStep = {
  step: number
  title: string
  description: string
  imageSrc: string
  imageAlt: string
}

const unsplash = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&q=80`

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    step: 1,
    title: "Create your account",
    description:
      "Sign up in minutes and get your customer code for every package you send to China.",
    imageSrc: unsplash("photo-1660732421009-469aba1c2e81"),
    imageAlt: "Graphical user interface on a laptop screen",
  },
  {
    step: 2,
    title: "Copy your China warehouse address",
    description:
      "Use your DHEIR address at checkout on Taobao, 1688, or any Chinese supplier.",
    imageSrc: unsplash("photo-1662037955115-3aed23bba6b1"),
    imageAlt: "Warehouse district street scene in China",
  },
  {
    step: 3,
    title: "We receive, measure, and quote",
    description:
      "Packages are logged, weighed, and consolidated. You see fees clearly before you pay.",
    imageSrc: unsplash("photo-1642418934307-cc2c5bf83e65"),
    imageAlt: "Close-up of numbered shipping containers",
  },
  {
    step: 4,
    title: "Pay and ship to Nigeria",
    description:
      "Pay your balance, choose air or sea, and track delivery to your door in Nigeria.",
    imageSrc: unsplash("photo-1709666749228-b9dc5e5e65f6"),
    imageAlt: "Large cargo ship on open water",
  },
]
