import errors from '@twreporter/errors'
import {
  URL_STATIC_COMBO_SECTIONS,
  URL_STATIC_PREMIUM_SECTIONS,
  URL_STATIC_COMBO_TOPICS,
} from '../../config/index.mjs'
import axiosInstance from '../../axios/index.js'

/**
 * Creates an Axios request function that sends a GET request to the specified URL with a timeout.
 * @param {string} requestUrl - The URL to send the request to.
 
 */
const createAxiosRequest = (requestUrl) => {
  return () => axiosInstance(requestUrl)
}

const errorLogger = (errorMessage) => {
  const annotatingAxiosError = errors.helpers.annotateAxiosError(errorMessage)
  throw annotatingAxiosError
}
const fetchNormalSections = createAxiosRequest(URL_STATIC_COMBO_SECTIONS)
const fetchTopics = createAxiosRequest(URL_STATIC_COMBO_TOPICS)

const fetchPremiumSections = createAxiosRequest(URL_STATIC_PREMIUM_SECTIONS)

const fetchHeaderDataInDefaultPageLayout = async () => {
  let sectionsData = []
  let topicsData = []
  try {
    const responses = await Promise.all([fetchNormalSections(), fetchTopics()])
    if (responses[0]?.data?._items) {
      sectionsData = responses[0]?.data?._items
    }
    if (responses[1]?.data?._endpoints?.topics?._items) {
      topicsData = responses[1].data._endpoints.topics._items
    }
    return { sectionsData, topicsData }
  } catch (err) {
    errorLogger(err)
  }
}

const fetchHeaderDataInPremiumPageLayout = async () => {
  let sectionsData = []
  try {
    const response = await fetchPremiumSections()
    if (response?.data?.sections) {
      sectionsData = response?.data?.sections
    }
    return { sectionsData }
  } catch (err) {
    errorLogger(err)
  }
}
export {
  fetchHeaderDataInDefaultPageLayout,
  fetchHeaderDataInPremiumPageLayout,
}
