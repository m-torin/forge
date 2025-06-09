'use client'
import { useState } from 'react'

const LikeSaveBtns = () => {
  const [isLiked, setIsLiked] = useState(false)

  return (
    <div className="flow-root">
      <div className="-mx-3 -my-1.5 flex text-sm text-neutral-700 dark:text-neutral-300">
        <button
          className="flex cursor-pointer rounded-lg border-none bg-transparent px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="Share"
          type="button"
        >
          <svg
            aria-hidden="true"
            stroke="currentColor"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          <span className="ml-2 hidden sm:block">Share</span>
        </button>
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="flex cursor-pointer rounded-lg border-none bg-transparent px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label={isLiked ? 'Remove from saved' : 'Save'}
          aria-pressed={isLiked}
          type="button"
        >
          <svg
            aria-hidden="true"
            stroke="currentColor"
            viewBox="0 0 24 24"
            className={`h-5 w-5 ${isLiked ? 'text-red-500' : ''}`}
            fill={isLiked ? 'currentColor' : `none`}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span className="ml-2 hidden sm:block">Save</span>
        </button>
      </div>
    </div>
  )
}

export default LikeSaveBtns
