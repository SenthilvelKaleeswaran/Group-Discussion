import React from 'react'
import Icon from '../../icons'

export default function Loader({text = "Loading"}) {
  return (
    <div className='flex gap-2 items-center'>
        <Icon name='Loader' className='animate-spin' />
        <p className='text-gray-500'>{text}</p>
    </div>
  )
}
