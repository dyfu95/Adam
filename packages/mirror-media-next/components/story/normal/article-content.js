import styled from 'styled-components'
import DraftRenderBlock from '../shared/draft-renderer-block'
import { copyAndSliceDraftBlock, getBlocksCount } from '../../../utils/story'
import dynamic from 'next/dynamic'
import useWindowDimensions from '../../../hooks/use-window-dimensions'
import { useDisplayAd } from '../../../hooks/useDisplayAd'

const GPTAd = dynamic(() => import('../../../components/ads/gpt/gpt-ad'), {
  ssr: false,
})

/**
 * @typedef {import('../../../type/draft-js').Draft} Content
 */

const Wrapper = styled.section`
  margin-top: 32px;

  ${({ theme }) => theme.breakpoint.md} {
    margin-top: 20px;
  }
`
const ContentContainer = styled.section`
  margin-top: 32px;
  margin-bottom: 32px;
`
const StyledGPTAd = styled(GPTAd)`
  width: 100%;
  height: auto;
  max-width: 336px;
  max-height: 280px;
  margin: 32px auto;
  display: ${
    /**
     * @param {Object} props
     * @param {string | undefined} props.pageKey
     */
    (props) => (props.pageKey ? 'block' : 'none')
  };

  ${({ theme }) => theme.breakpoint.xl} {
    max-width: 640px;
    max-height: 390px;
  }
`

/**
 *
 * @param {Object} props
 * @param {Content} props.content
 * @param {boolean} [props.hiddenAdvertised] - CMS Posts「google廣告違規」
 * @param {string | undefined} [props.pageKeyForGptAd]
 * @returns {JSX.Element}
 */
export default function ArticleContent({
  content = { blocks: [], entityMap: {} },
  hiddenAdvertised = false,
  pageKeyForGptAd = '',
}) {
  const shouldShowAd = useDisplayAd(hiddenAdvertised)
  const windowDimensions = useWindowDimensions()

  const blocksLength = getBlocksCount(content)

  //The GPT advertisement for the `mobile` version includes `AT1` & `AT2`
  const MB_contentJsx = (
    <Wrapper>
      <DraftRenderBlock
        rawContentBlock={copyAndSliceDraftBlock(content, 0, 1)}
        contentLayout="normal"
        wrapper={(children) => <ContentContainer>{children}</ContentContainer>}
      />

      {blocksLength > 1 && (
        <>
          <div>廣告1</div>
          {shouldShowAd && (
            <StyledGPTAd pageKey={pageKeyForGptAd} adKey="MB_AT1" />
          )}

          <DraftRenderBlock
            rawContentBlock={copyAndSliceDraftBlock(content, 1, 5)}
            contentLayout="normal"
            wrapper={(children) => (
              <ContentContainer>{children}</ContentContainer>
            )}
          />
        </>
      )}

      {blocksLength > 5 && (
        <>
          <div>廣告2</div>
          {shouldShowAd && (
            <StyledGPTAd pageKey={pageKeyForGptAd} adKey="MB_AT2" />
          )}

          <DraftRenderBlock
            rawContentBlock={copyAndSliceDraftBlock(content, 5)}
            contentLayout="normal"
            wrapper={(children) => (
              <ContentContainer>{children}</ContentContainer>
            )}
          />
        </>
      )}
    </Wrapper>
  )

  //The GPT advertisement for the `desktop` version only `AT1`
  // const PC_contentJsx = (
  //   <Wrapper>
  //     <DraftRenderBlock
  //       rawContentBlock={copyAndSliceDraftBlock(content, 0, 3)}
  //       contentLayout="normal"
  //       wrapper={(children) => <ContentContainer>{children}</ContentContainer>}
  //     />
  //   </Wrapper>
  // )

  const contentJsx =
    windowDimensions.width > 1200 ? MB_contentJsx : MB_contentJsx

  return <>{contentJsx}</>
}
