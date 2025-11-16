import React, { useState, useMemo } from 'react'
import Reviews from '../Reviews/Reviews'
import './DescriptionBox.css'

const DescriptionBox = ({ productId, product, descriptionHtml, defaultTab = 'desc' }) => {
  const [tab, setTab] = useState(defaultTab)
  const [reviewCount, setReviewCount] = useState(null)

  const pid = useMemo(() => productId ?? product?._id ?? product?.id ?? null, [productId, product])

  return (
    <div className="descriptionbox">
      <div className="descriptionbox-navigator">
        <button
          className={`descriptionbox-nav-box ${tab === 'desc' ? '' : 'fade'}`}
          onClick={() => setTab('desc')}
          type="button"
        >
          Description
        </button>
        <button
          className={`descriptionbox-nav-box ${tab === 'reviews' ? '' : 'fade'}`}
          onClick={() => setTab('reviews')}
          type="button"
        >
          {`Reviews${reviewCount !== null ? ` (${reviewCount})` : ''}`}
        </button>
      </div>

      <div className="descriptionbox-content">
        {tab === 'desc' ? (
          <div className="descriptionbox-description">
            {descriptionHtml
              ? <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
              : (<><p>DescriptionBox Description</p><p>DescriptionBox Description 2</p></>)
            }
          </div>
        ) : (
          <Reviews productId={pid} onCountChange={setReviewCount} />
        )}
      </div>
    </div>
  )
}

export default DescriptionBox
