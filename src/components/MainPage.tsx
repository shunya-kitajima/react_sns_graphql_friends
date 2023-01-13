import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@apollo/react-hooks'
import { useMutation } from '@apollo/client'
import { Grid } from '@material-ui/core'
import ExitToApp from '@material-ui/icons/ExitToApp'
import {
  UPDATE_FRIENDS,
  UPDATE_FRIEND_REQUESTS,
  GET_PROFILES,
  GET_MYPROFILE,
} from '../queries'
import styles from './MainPage.module.css'

const MainPage: React.FC = () => {
  const navigate = useNavigate()
  const { data: dataMyProfile, error: errorMyProfile } = useQuery(
    GET_MYPROFILE,
    {
      fetchPolicy: 'cache-and-network',
    }
  )
  const { data: dataProfiles, error: errorProfiles } = useQuery(GET_PROFILES, {
    fetchPolicy: 'cache-and-network',
  })
  const myFriends = dataMyProfile?.profile.friends.edges.map(
    ({ node }: any) => node.id
  )
  const myfriendRequests = dataMyProfile.profile.friendRequests.edges.map(
    ({ node }: any) => node.id
  )
  const [updateFriends] = useMutation(UPDATE_FRIENDS)
  const [updateFriendRequests] = useMutation(UPDATE_FRIEND_REQUESTS)

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
