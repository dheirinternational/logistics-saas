"use client"

import { NextPage } from 'next'
import { useRouter } from 'next/navigation'

const Page: NextPage = ({}) => {

  const router = useRouter()

  return <div className='h-dvh w-screen bg-light center-items'>
    <div className='center-items gap-10 flex-col'>
      
      <div className='center-items gap-4'>
        <h1 className='font-semibold text-2xl'>
          Page In Development
        </h1>

        <div className='relative scale-50'>
          <div className='w-fit h-fit animate-[spin_3s_linear_infinite]'>
            <CogWheel />
          </div>
          <div className='w-fit h-fit relative left-12 my-2 animate-[spin_3s_linear_infinite_reverse]'>
            <CogWheel color='#f26430'/>
          </div>
          <div className='w-fit h-fit relative -left-2 my-2 animate-[spin_3s_linear_infinite]'>
            <CogWheel />
          </div>
        </div>
      </div>

      <button onClick={() => {router.back()}}
      className='px-5 py-2 border border-dark/20 rounded-lg'  
      >
        Go Back
      </button>
    </div>
  </div>
}

export default Page




const CogWheel = ({color}: {color?: string}) => {
  return   <div className='w-16 h-16 bg-dark text-accent-red rounded-full center-items relative' style={{backgroundColor: color}}>
    <div className='w-24 h-4 bg-dark absolute rounded-lg z-10 top-1/2 left-1/2 -translate-1/2' style={{backgroundColor: color}}>
      
    </div>
    <div className='w-24 h-4 bg-dark absolute rounded-lg z-10 top-1/2 left-1/2 -translate-1/2 rotate-90' style={{backgroundColor: color}}>
      
    </div>
    <div className='w-24 h-4 bg-dark absolute rounded-lg z-10 top-1/2 left-1/2 -translate-1/2 rotate-45' style={{backgroundColor: color}}>
      
    </div>
    <div className='w-24 h-4 bg-dark absolute rounded-lg z-10 top-1/2 left-1/2 -translate-1/2 -rotate-45' style={{backgroundColor: color}}>
      
    </div>
    

    <div className='w-7 h-7 bg-light rounded-full relative z-1000'>
      
    </div>

    
  </div>
}