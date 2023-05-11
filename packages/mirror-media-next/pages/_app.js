import React, { useEffect } from 'react'
import { GlobalStyles } from '../styles/global-styles'
import { ThemeProvider } from 'styled-components'
import { theme } from '../styles/theme'
import { ApolloProvider } from '@apollo/client'
import client from '../apollo/apollo-client'
import * as gtag from '../utils/gtag'
import TagManager from 'react-gtm-module'
import { ENV, GTM_ID } from '../config/index.mjs'

/**
 *
 * @param {Object} props
 * @param {React.ElementType} props.Component
 * @param {Object} props.pageProps
 * @param {Object[]} props.sectionsData
 * @param {Object[]} props.topicsData
 * @returns {React.ReactElement}
 */

function MyApp({ Component, pageProps }) {
  //Temporarily enable google analytics and google tag manager only in dev and local environment.
  useEffect(() => {
    if (ENV === 'dev' || ENV === 'local') {
      gtag.init()
      TagManager.initialize({ gtmId: GTM_ID })
    }
  }, [])
  return (
    <>
      <GlobalStyles />
      <ApolloProvider client={client}>
        <ThemeProvider theme={theme}>
          <Component {...pageProps} />
        </ThemeProvider>
      </ApolloProvider>
    </>
  )
}

export default MyApp
