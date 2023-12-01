import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import PodcastCard from './podcast-card'

const CardsWrapper = styled.ul`
  display: grid;
  row-gap: 20px;

  ${({ theme }) => theme.breakpoint.md} {
    grid-template-columns: 1fr 1fr;
    grid-gap: 28px;
    gap: 28px;
  }
  ${({ theme }) => theme.breakpoint.xl} {
    grid-template-columns: 1fr 1fr 1fr 1fr;
    row-gap: 28px;
    column-gap: 16px;
  }
`

const LoadMoreAnchor = styled.div``

const LoadingSpinner = styled.img`
  margin: auto;
`

export default function PodcastList({
  selectedPodcasts,
  allPodcasts,
  selectedAuthor,
}) {
  const [visiblePodcasts, setVisiblePodcasts] = useState(12)
  const [isLoading, setIsLoading] = useState(false)
  const loadMoreAnchorRef = useRef(null)

  useEffect(() => {
    setVisiblePodcasts(12) // Reset visiblePodcasts count when selectedAuthor changes
  }, [selectedAuthor])

  let podcastsToDisplay =
    selectedPodcasts.length > 0 ? selectedPodcasts : allPodcasts

  const loadMore = () => {
    setIsLoading(true)
    // Simulating a time delay of 0.8 second (800ms)
    setTimeout(() => {
      setVisiblePodcasts((prevVisible) => {
        const newVisible = prevVisible + 12
        setIsLoading(newVisible < podcastsToDisplay.length) // Stop showing LoadingSpinner if all podcasts have been displayed
        return newVisible
      })
    }, 800)
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadMore()
          }
        })
      },
      { threshold: 0.5 }
    )

    const anchorRefCurrent = loadMoreAnchorRef.current

    if (anchorRefCurrent) {
      observer.observe(anchorRefCurrent)
    }

    return () => {
      if (anchorRefCurrent) {
        observer.unobserve(anchorRefCurrent)
      }
    }
  }, [])

  // Check if there are no podcasts for the selected author
  const noPodcastsForSelectedAuthor =
    selectedPodcasts.length === 0 &&
    selectedAuthor !== '' &&
    Object.keys(allPodcasts).every((author) => author !== selectedAuthor)

  return (
    <div>
      {noPodcastsForSelectedAuthor ? (
        <p>There are no podcasts for the selected author, {selectedAuthor}.</p>
      ) : podcastsToDisplay.length > 0 ? (
        <>
          <CardsWrapper>
            {podcastsToDisplay.slice(0, visiblePodcasts).map((podcast) => (
              <PodcastCard key={podcast.title} podcast={podcast} />
            ))}
          </CardsWrapper>
          <LoadMoreAnchor ref={loadMoreAnchorRef} />
          {/* Display the loading spinner when isLoading is true and there are more podcasts to load */}
          {isLoading && visiblePodcasts < podcastsToDisplay.length && (
            <LoadingSpinner src="/images-next/loading.gif" alt="Loading" />
          )}
        </>
      ) : (
        <p>There are no podcasts available.</p>
      )}
    </div>
  )
}
