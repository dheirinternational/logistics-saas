import AddPackage from '@/components/admin/packages/AddPackage'
import { pool } from '@/lib/db/db'

export default async function Page({params}: {params: {id: string}}){

  const { id } = await params
  const res = await pool.query(`
    SELECT * FROM incoming_packages
    WHERE id = $1  
  `, [id])

  const data = res.rows[0]

  console.log(res.rows[0])

  return <div className='space-y-body p-body'>
    <div className='p-4 bg-accent-red rounded-l text-white'>
        <span className='text-xs opacity-80'>
            Admin/Operations
        </span>
        <h1 className='font-bold mt-4 mb-2 text-xl'>
            Add Package
        </h1>
    </div>

    <hr className='border border-dark/20 my-8'/>


    {/* FORM */}
    {/* <AddPackage props={data}/> */}

    
  </div>
}
