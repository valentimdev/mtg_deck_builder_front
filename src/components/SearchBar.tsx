import React from 'react'

function SearchBar() {
  return (
    <div className='flex justify-center items-center h-full w-full'>
        <input type="text" placeholder="Pesquise cards..." className='border border-gray-300 rounded-md p-3 w-150 self-center bg-[#d2d2d2] text-black'/>
    </div>
  )
}

export default SearchBar