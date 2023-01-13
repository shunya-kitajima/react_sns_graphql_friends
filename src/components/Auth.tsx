import React, { useState } from 'react'
import { useMutation } from '@apollo/client'
import { useNavigate } from 'react-router-dom'
import { FlipCameraAndroid } from '@material-ui/icons'
import { CREATE_USER, GET_TOKEN, CREATE_PROFILE } from '../queries'
import styles from './Auth.module.css'

const Auth: React.FC = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [createUser] = useMutation(CREATE_USER)
  const [getToken] = useMutation(GET_TOKEN)
  const [createProfile] = useMutation(CREATE_PROFILE)

  const login = async (): Promise<void> => {
    try {
      const result = await getToken({
        variables: { username: username, password: password },
      })
      localStorage.setItem('token', result.data?.tokenAuth?.token)
      if (!isLogin) {
        await createProfile()
      }
      navigate('/top')
    } catch (err: any) {
      alert(err.message)
    }
  }

  const authUser = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault()
    if (isLogin) {
      await login()
    } else {
      try {
        await createUser({
          variables: { username: username, password: password },
        })
        await login()
      } catch (err: any) {
        alert(err.message)
      }
    }
  }

  return <div>Auth</div>
}

export default Auth
