import errors from '@twreporter/errors'
import styled from 'styled-components'

import axios from 'axios'
import client from '../../apollo/apollo-client'
import { fetchPosts } from '../../apollo/query/posts'
import { fetchCategorySections } from '../../apollo/query/categroies'
import CategoryArticles from '../../components/category/category-articles'
import ShareHeader from '../../components/shared/share-header'
import { GCP_PROJECT_ID } from '../../config/index.mjs'

import {
  fetchHeaderDataInDefaultPageLayout,
  fetchHeaderDataInPremiumPageLayout,
} from '../../utils/api'
const CategoryContainer = styled.main`
  width: 320px;
  margin: 0 auto;

  ${({ theme }) => theme.breakpoint.md} {
    width: 672px;
  }
  ${({ theme }) => theme.breakpoint.xl} {
    width: 1024px;
    padding: 0;
  }

  ${({ isPremium, theme }) =>
    isPremium &&
    `
     margin-top: 20px;
     ${theme.breakpoint.md} {
      margin-top: 28px;
     }
     ${theme.breakpoint.xl} {
      margin-top: 36px;
     }
  `}
`
const CategoryTitle = styled.h1`
  margin: 20px 0 16px 16px;
  font-size: 16px;
  line-height: 1.15;
  font-weight: 500;
  color: ${
    /**
     * @param {Object} props
     * @param {string } props.sectionName
     * @param {Theme} [props.theme]
     */
    ({ sectionName, theme }) =>
      sectionName && theme.color.sectionsColor[sectionName]
        ? theme.color.sectionsColor[sectionName]
        : theme.color.brandColor.lightBlue
  };
  ${({ theme }) => theme.breakpoint.md} {
    margin: 20px 0 24px;
    font-size: 20.8px;
    font-weight: 600;
  }
  ${({ theme }) => theme.breakpoint.xl} {
    margin: 24px 0 28px;
    font-size: 28px;
  }
`

const PremiumCategoryTitle = styled.h1`
  margin: 16px 17px;
  font-size: 16px;
  line-height: 1.15;
  font-weight: 500;
  color: ${
    /**
     * @param {Object} props
     * @param {String } props.sectionName
     * @param {Theme} [props.theme]
     */
    ({ sectionName, theme }) =>
      sectionName && theme.color.sectionsColor[sectionName]
        ? theme.color.sectionsColor[sectionName]
        : theme.color.brandColor.lightBlue
  };
  ${({ theme }) => theme.breakpoint.md} {
    margin: 20px 0 24px;
    font-size: 28px;
    font-weight: 600;
    display: flex;
    align-items: center;
    &::before,
    &::after {
      content: '';
      display: inline-block;
      height: 2px;
      background: black;
      flex-grow: 1;
    }
    &::before {
      margin-right: 30px;
    }
    &::after {
      margin-left: 40px;
    }
  }
  ${({ theme }) => theme.breakpoint.xl} {
    margin: 24px 0 28px;
    font-size: 28px;
  }
`

const RENDER_PAGE_SIZE = 12

/**
 * @typedef {import('../../components/category/category-articles').Article} Article
 * @typedef {import('../../components/category/category-articles').Category} Category
 */

/**
 * @param {Object} props
 * @param {Article[]} props.posts
 * @param {Category} props.category
 * @param {number} props.postsCount
 * @param {boolean} props.isPremium
 * @param {Object} props.headerData
 * @returns {React.ReactElement}
 */
export default function Category({
  postsCount,
  posts,
  category,
  isPremium,
  headerData,
}) {
  return (
    <>
      <ShareHeader
        pageLayoutType={isPremium ? 'premium' : 'default'}
        headerData={headerData}
      />
      <CategoryContainer isPremium={isPremium}>
        {isPremium ? (
          <PremiumCategoryTitle sectionName={category?.sections?.slug}>
            {category?.name}
          </PremiumCategoryTitle>
        ) : (
          <CategoryTitle sectionName={category?.sections?.slug}>
            {category?.name}
          </CategoryTitle>
        )}
        <CategoryArticles
          postsCount={postsCount}
          posts={posts}
          category={category}
          renderPageSize={RENDER_PAGE_SIZE}
          isPremium={isPremium}
        />
      </CategoryContainer>
    </>
  )
}

/**
 * @type {import('next').GetServerSideProps}
 */
export async function getServerSideProps({ query, req }) {
  const categorySlug = query.slug
  const traceHeader = req.headers?.['x-cloud-trace-context']
  let globalLogFields = {}
  if (traceHeader && !Array.isArray(traceHeader)) {
    const [trace] = traceHeader.split('/')
    globalLogFields[
      'logging.googleapis.com/trace'
    ] = `projects/${GCP_PROJECT_ID}/traces/${trace}`
  }

  const responses = await Promise.allSettled([
    client.query({
      query: fetchPosts,
      variables: {
        take: RENDER_PAGE_SIZE * 2,
        skip: 0,
        orderBy: { publishedDate: 'desc' },
        filter: {
          state: { equals: 'published' },
          categories: { some: { slug: { equals: categorySlug } } },
        },
      },
    }),
    client.query({
      query: fetchCategorySections,
      variables: {
        categorySlug,
      },
    }),
  ])

  const handledResponses = responses.map((response) => {
    if (response.status === 'fulfilled') {
      return response.value.data
    } else if (response.status === 'rejected') {
      const { graphQLErrors, clientErrors, networkError } = response.reason
      const annotatingError = errors.helpers.wrap(
        response.reason,
        'UnhandledError',
        'Error occurs while getting category page data'
      )

      console.log(
        JSON.stringify({
          severity: 'ERROR',
          message: errors.helpers.printAll(
            annotatingError,
            {
              withStack: true,
              withPayload: true,
            },
            0,
            0
          ),
          debugPayload: {
            graphQLErrors,
            clientErrors,
            networkError,
          },
          ...globalLogFields,
        })
      )
      return
    }
  })

  /** @type {number} postsCount */
  const postsCount = handledResponses[0]?.postsCount || 0
  /** @type {Article[]} */
  const posts = handledResponses[0]?.posts || []
  /** @type {Category} */
  const category = handledResponses[1]?.category || {}
  const isPremium = category.isMemberOnly
  let sectionsData = []
  let topicsData = []
  try {
    if (isPremium) {
      const headerData = await fetchHeaderDataInPremiumPageLayout()
      if (Array.isArray(headerData.sectionsData)) {
        sectionsData = headerData.sectionsData
      }
    } else {
      const headerData = await fetchHeaderDataInDefaultPageLayout()
      if (Array.isArray(headerData.sectionsData)) {
        sectionsData = headerData.sectionsData
      }
      if (Array.isArray(headerData.topicsData)) {
        topicsData = headerData.topicsData
      }
    }
  } catch (err) {
    const annotatingAxiosError = errors.helpers.annotateAxiosError(err)
    console.error(
      JSON.stringify({
        severity: 'ERROR',
        message: errors.helpers.printAll(annotatingAxiosError, {
          withStack: true,
          withPayload: true,
        }),
        ...globalLogFields,
      })
    )
  }
  const props = {
    postsCount,
    posts,
    category,
    isPremium,
    headerData: { sectionsData, topicsData },
  }
  return { props }
}
