import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ApolloProvider } from '@apollo/react-hooks'
import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import Auth from './components/Auth'
import MainPage from './components/MainPage'
import styles from './App.module.css'

const httpLink = createHttpLink({
  uri: 'http://127.0.0.1:8000/graphql/',
})
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token')
  return {
    headers: {
      ...headers,
      authorization: token ? `JWT ${token}` : '',
    },
  }
})
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
})

const App: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <div className={styles.app__root}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/top" element={<MainPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ApolloProvider>
  )
}

export default App
