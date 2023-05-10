import Header from '../header'
import PremiumHeader from '../premium-header'

/**
 * @typedef {Object} HeaderData
 * @property {Array} [sectionsData]
 * @property {Array} [topicsData]
 */

const getDefaultHeader = (headerData) => {
  const { sectionsData, topicsData } = headerData
  if (!sectionsData || !sectionsData.length) {
    console.warn('There is no sections data for header of default page layout')
  } else if (!topicsData || !topicsData.length) {
    console.warn('There is no topics data for header of default page layout')
  }

  return <Header sectionsData={sectionsData} topicsData={topicsData} />
}
const getPremiumHeader = (headerData) => {
  const { sectionsData } = headerData
  if (!sectionsData || !sectionsData.length) {
    console.warn('There is no sections data for header of premium page layout')
  }

  return <PremiumHeader premiumHeaderData={{ sections: sectionsData }} />
}

/**
 *
 * @param {Object} props
 * @param {'default' | 'premium' | 'empty'} props.pageLayoutType
 * @param {HeaderData} props.headerData
 * @returns {JSX.Element}
 */
export default function ShareHeader({
  pageLayoutType = 'default',
  headerData = {},
}) {
  const getheaderJsx = (pageLayoutType) => {
    switch (pageLayoutType) {
      case 'default': {
        const defaultHeader = getDefaultHeader(headerData)
        return defaultHeader
      }
      case 'premium': {
        const premiumHeader = getPremiumHeader(headerData)
        return premiumHeader
      }
      case 'empty':
        return <></>
      default: {
        const defaultHeader = getDefaultHeader(headerData)
        return defaultHeader
      }
    }
  }
  const headerJsx = getheaderJsx(pageLayoutType)

  return headerJsx
}
