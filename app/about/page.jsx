import React from 'react'

import About from '@/components/About'
import clientPromise from '../lib/mongodb'

// Read on every request so a banner changed in the dashboard shows up at once
export const dynamic = 'force-dynamic'

/** The banner image set from the dashboard (About Banner), or null when there is none. */
async function getBannerImage() {
  try {
    const doc = await (await clientPromise).db('test').collection('AboutBanner').findOne({})
    return doc?.img || null
  } catch (error) {
    console.error('Error fetching the about banner:', error)
    return null
  }
}

const page = async () => {
  const banner = await getBannerImage()

  return (
    <>
      {banner && (
        // Full width, flush under the header: the negative top margin cancels
        // .site-container's top padding (1.25rem, 2rem from md up).
        // Height follows the image's own proportions so the whole banner shows, uncropped.
        <div className="full-bleed -mt-5 md:-mt-8 mb-6 md:mb-10">
          <img
            src={banner}
            alt=""
            className="block w-full h-auto"
          />
        </div>
      )}
      <About/>
    </>
  )
}

export default page
