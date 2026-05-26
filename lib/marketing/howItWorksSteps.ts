/** How it works step illustrations — `public/custom/step*.png` */

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
    imageSrc: "/custom/step1.png",
    imageAlt: "Account signup illustration with user icon and customer code",
  },
  {
    step: 2,
    title: "Copy your China warehouse address",
    description:
      "Use your DHEIR address at checkout on Taobao, 1688, or any Chinese supplier.",
    imageSrc: "/custom/step2.png",
    imageAlt: "China warehouse address and shipping route illustration",
  },
  {
    step: 3,
    title: "We receive, measure, and quote",
    description:
      "Packages are logged, weighed, and consolidated. You see fees clearly before you pay.",
    imageSrc: "/custom/step3.png",
    imageAlt: "Parcels on a scale with checklist illustration",
  },
  {
    step: 4,
    title: "Pay and ship to Nigeria",
    description:
      "Pay your balance, choose air or sea, and track delivery to your door in Nigeria.",
    imageSrc: "/custom/step4.png",
    imageAlt: "Payment, air and sea freight, and delivery illustration",
  },
]
