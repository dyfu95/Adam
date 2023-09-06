import { MirrorMedia } from '@mirrormedia/lilith-draft-renderer'
import { all } from 'axios'
const { removeEmptyContentBlock, hasContentInRawContentBlock } = MirrorMedia

/**
 * @typedef {Object} Redirect
 * @property {{ destination: string, permanent: boolean }} redirect
 */
/**
 *
 * Decide whether to redirect, or should redirect to external URL, or `story/[slug]` page.
 * @param {string} redirect - post's redirect URL
 * @returns {Redirect}
 */

const handleStoryPageRedirect = (redirect) => {
  if (redirect && redirect.trim()) {
    const redirectHref = redirect.trim()
    if (
      redirectHref.startsWith('https://') ||
      redirectHref.startsWith('http://')
    ) {
      return {
        redirect: {
          destination: `${redirectHref} `,
          permanent: false,
        },
      }
    } else if (redirectHref.startsWith('www.')) {
      return {
        redirect: {
          destination: `https://${redirectHref}`,
          permanent: false,
        },
      }
    } else {
      return {
        redirect: {
          destination: `/story/${redirectHref} `,
          permanent: false,
        },
      }
    }
  }
}

/**
 * @typedef {import('../type/draft-js').Draft} Content
 */

/**
 * Copy draft data and returns a new data after slice.
 *
 * @param {Content} content - The original draft data object.
 * @param {number} startIndex - The start index of the block to slice.
 * @param {number} [endIndex] - The end index of the block to slice.
 * @return {Content}
 */
const copyAndSliceDraftBlock = (
  content = { blocks: [], entityMap: {} },
  startIndex,
  endIndex
) => {
  const shouldRenderDraft = hasContentInRawContentBlock(content)

  if (shouldRenderDraft) {
    const contentWithoutEmptyBlock = removeEmptyContentBlock(content)
    /**
     * @type {Content}
     */
    const newContent = JSON.parse(JSON.stringify(contentWithoutEmptyBlock))
    // console.log('contentWithoutEmptyBlock', contentWithoutEmptyBlock)
    console.log(newContent)
    if (newContent.blocks.length >= endIndex) {
      let noAtomicStartIndex = startIndex
      let noAtomicIndex = 0
      let allStartIndex = 0
      let allEndIndex = 0

      for (let i = startIndex; i < newContent.blocks.length; i++) {
        console.log(newContent.blocks[i])
        if (newContent.blocks[i].type !== 'atomic') {
          noAtomicStartIndex += 1
        }

        if (noAtomicStartIndex === startIndex) {
          console.log(i)
          allStartIndex = i + 2
          break
        }
      }
      for (let i = 0; i < newContent.blocks.length; i++) {
        if (newContent.blocks[i].type !== 'atomic') {
          if (noAtomicIndex < endIndex) {
            noAtomicIndex += 1
          }
        }

        if (noAtomicIndex === endIndex) {
          allEndIndex = i + 1
          break
        }
      }

      console.log('endIndex', endIndex)
      console.log('allStartIndex', allStartIndex)
      console.log('allIndex', allEndIndex)
      // const newArray = newContent.blocks.slice(startIndex, allIndex)
      // console.log('newArray:', newArray)
      newContent.blocks = newContent.blocks.slice(
        startIndex === 0 ? startIndex : allStartIndex,
        allEndIndex
      )
    } else if (newContent.blocks.length > startIndex) {
      let noAtomicIndex = 0
      let allIndex = 0
      for (let i = 0; i < newContent.blocks.length; i++) {
        if (newContent.blocks[i].type !== 'atomic') {
          noAtomicIndex += 1
        }
        if (noAtomicIndex === endIndex) {
          allIndex = i
          break
        }
      }
      newContent.blocks = newContent.blocks.slice(allIndex)
    } else {
      return { blocks: [], entityMap: {} }
    }

    return newContent
  }
}

/**
 * Return the total number of non-empty content blocks.
 *
 * @param {Content} content
 * @return {number} The number of non-empty content blocks.
 */

const getBlocksCount = (content) => {
  if (hasContentInRawContentBlock(content)) {
    return removeEmptyContentBlock(content).blocks.length
  } else {
    return 0
  }
}

export { handleStoryPageRedirect, copyAndSliceDraftBlock, getBlocksCount }
