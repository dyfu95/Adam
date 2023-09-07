import { MirrorMedia } from '@mirrormedia/lilith-draft-renderer'
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
    /** @type {Content}*/
    const newContent = JSON.parse(JSON.stringify(contentWithoutEmptyBlock))
    console.log('newContent', newContent)
    if (newContent.blocks.length >= endIndex) {
      // console.log('condition1')
      const noAtomicContent = newContent.blocks.filter(
        (block) => block.type !== 'atomic'
      )
      const slicedNoAtomicContent = noAtomicContent.slice(startIndex, endIndex)
      const startKey = slicedNoAtomicContent[0].key
      const endKey =
        slicedNoAtomicContent[slicedNoAtomicContent.length - 1]?.key

      const startKeyItemInNewContentKey = newContent.blocks.findIndex(
        (block) => block.key === startKey
      )
      const endKeyItemInNewContentKey = newContent.blocks.findIndex(
        (block) => block.key === endKey
      )
      console.log(
        'startKeyItemInNewContentKey, endKeyItemInNewContentKey',
        startKeyItemInNewContentKey,
        endKeyItemInNewContentKey
      )
      console.log(
        'item in newContent',
        newContent.blocks[startKeyItemInNewContentKey],
        newContent.blocks[endKeyItemInNewContentKey]
      )
      function test() {
        if (startIndex === 0 || startKeyItemInNewContentKey === 0) {
          return 0
        } else {
          return startKeyItemInNewContentKey
        }
      }

      console.log(
        'startKeyItemInNewContentKey',
        startKeyItemInNewContentKey - 1
      )
      const startIndexNew = test()
      function test2() {
        if (endIndex >= newContent.blocks.length) {
          return endIndex
        }
        if (endKeyItemInNewContentKey === 0) {
          return endKeyItemInNewContentKey + 1
        }
        return endKeyItemInNewContentKey + 1
      }
      const endIndexNew = test2()

      console.log(startIndexNew, endIndexNew)
      newContent.blocks = newContent.blocks.slice(startIndexNew, endIndexNew)
    } else if (newContent.blocks.length > startIndex) {
      const noAtomicContent = newContent.blocks.filter(
        (block) => block.type !== 'atomic'
      )
      const slicedNoAtomicContent = noAtomicContent.slice(startIndex, endIndex)

      const startKey = slicedNoAtomicContent[0].key

      const startKeyItemInNewContentKey = newContent.blocks.findIndex(
        (block) => block.key === startKey
      )
      console.log(startKeyItemInNewContentKey)
      const startIndexNew = startIndex <= 0 ? 0 : startKeyItemInNewContentKey

      newContent.blocks = newContent.blocks.slice(startIndexNew)
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
