import React from 'react'
import { useNavigate } from 'react-router-dom'
import ExitToApp from '@material-ui/icons/ExitToApp'
import styles from './MainPage.module.css'

const MainPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div>
      <ExitToApp
        className={styles.mainPage__out}
        onClick={() => {
          localStorage.removeItem('token')
          navigate('/')
        }}
      />
    </div>
  )
}

export default MainPage
