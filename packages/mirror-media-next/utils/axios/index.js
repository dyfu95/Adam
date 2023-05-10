import axios from 'axios'

import errors from '@twreporter/errors'
import {
  URL_STATIC_COMBO_SECTIONS,
  URL_STATIC_PREMIUM_SECTIONS,
  URL_STATIC_COMBO_TOPICS,
  API_TIMEOUT,
} from '../../config/index.mjs'

/**
 * Creates an Axios request function that sends a GET request to the specified URL with a timeout.
 * @param {string} requestUrl - The URL to send the request to.
 * @returns {() => Promise<import('axios').AxiosResponse<any>>} A function that sends an Axios GET request to the specified URL and returns a Promise of the response data.
 */
const createAxiosRequest = (requestUrl) => {
  return () =>
    axios({
      method: 'get',
      url: requestUrl,
      timeout: API_TIMEOUT,
    })
}
const errorLogger = (errorMessage, globalLogFields) => {
  const annotatingAxiosError = errors.helpers.annotateAxiosError(errorMessage)
  console.error(
    JSON.stringify({
      severity: 'ERROR',
      message: errors.helpers.printAll(
        annotatingAxiosError,
        {
          withStack: true,
          withPayload: true,
        },
        0,
        0
      ),
      ...globalLogFields,
    })
  )
}
const fetchNormalSections = createAxiosRequest(URL_STATIC_COMBO_SECTIONS)
const fetchTopics = createAxiosRequest(URL_STATIC_COMBO_TOPICS)
const fetchPremiumSections = createAxiosRequest(URL_STATIC_PREMIUM_SECTIONS)

const fetchHeaderDataInDefaultPageLayout = async (globalLogFields = {}) => {
  let sectionsData = []
  let topicsData = []
  try {
    const responses = await Promise.allSettled([
      fetchNormalSections(),
      fetchTopics(),
    ])

    responses.forEach((response) => {
      if (response.status === 'fulfilled') {
        console.log(
          JSON.stringify({
            severity: 'INFO',
            message: `Successfully fetch data on ${response.value.request.res.responseUrl}`,
          })
        )
      } else {
        const rejectedReason = response.reason
        errorLogger(rejectedReason)
      }
    })

    const sectionsResponse = responses[0].status === 'fulfilled' && responses[0]
    const topicsResponse = responses[1].status === 'fulfilled' && responses[1]
    if (Array.isArray(sectionsResponse?.value?.data._items)) {
      sectionsData = sectionsResponse?.value?.data?._items
    }

    if (
      Array.isArray(topicsResponse?.value?.data?._endpoints?.topics?._items)
    ) {
      topicsData = topicsResponse?.value?.data?._endpoints?.topics?._items
    }

    return { sectionsData, topicsData }
  } catch (err) {
    errorLogger(err, globalLogFields)

    return { sectionsData, topicsData }
  }
}

const fetchHeaderDataInPremiumPageLayout = async (globalLogFields = {}) => {
  let sectionsData = []
  try {
    const response = await fetchPremiumSections()
    if (response?.data?.sections) {
      sectionsData = response?.data?.sectionsColor
    }
    return { sectionsData }
  } catch (err) {
    errorLogger(err, globalLogFields)
    return { sectionsData }
  }
}
export {
  fetchHeaderDataInDefaultPageLayout,
  fetchHeaderDataInPremiumPageLayout,
}
