// react
import { ReactElement, ReactNode } from 'react'
// next
import { NextPage } from 'next'
import Head from 'next/head'
import App, { AppProps, AppContext } from 'next/app'
import "@/styles/globals.css"
import { XrplProvider } from '@/context/Xrpl/XrplContext'

type NextPageWithLayout = NextPage & {
  // eslint-disable-next-line no-unused-vars
  getLayout?: (page: ReactElement) => ReactNode
}

interface MyAppProps extends AppProps {
  Component: NextPageWithLayout
}

export default function MyApp(props: MyAppProps) {
  const { Component, pageProps } = props

  const getLayout = Component.getLayout ?? ((page) => page)

  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <XrplProvider>
        {getLayout(<Component {...pageProps} />)}
      </XrplProvider>
    </>
  )
}

MyApp.getInitialProps = async (context: AppContext) => {
  const appProps = await App.getInitialProps(context)
  return { ...appProps }
}
