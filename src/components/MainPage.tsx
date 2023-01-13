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
  const myFriendRequests = dataMyProfile.profile.friendRequests.edges.map(
    ({ node }: any) => node.id
  )
  const [updateFriends] = useMutation(UPDATE_FRIENDS)
  const [updateFriendRequests] = useMutation(UPDATE_FRIEND_REQUESTS)

  const approveFriendRequest = async (node: any): Promise<void> => {
    await updateFriends({
      variables: {
        id: dataMyProfile.profile.id,
        friends: [...myFriends, node.id],
      },
    })
    await updateFriends({
      variables: {
        id: node.id,
        friends: [
          ...node.profilesFriends.edges.map(({ node }: any) => node.id),
          dataMyProfile.profile.userProf.id,
        ],
      },
    })
    await updateFriendRequests({
      variables: {
        id: dataMyProfile.profile.id,
        friendRequests: myFriendRequests.filter(
          (friendRequestId: any) => friendRequestId !== node.id
        ),
      },
    })
  }

  return (
    <div className={styles.mainPage__root}>
      {(errorProfiles || errorMyProfile) && (
        <h3>
          {errorProfiles?.message}/{errorMyProfile?.message}
        </h3>
      )}
      <Grid container>
        <Grid item xs>
          {dataMyProfile?.profile.userProf.username}
        </Grid>
        <Grid item xs>
          <span className={styles.mainPage__title}>Friend Request system</span>
        </Grid>
        <Grid item xs>
          <ExitToApp
            className={styles.mainPage__out}
            onClick={() => {
              localStorage.removeItem('token')
              navigate('/')
            }}
          />
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={4}>
          <h3>my friends</h3>
          <ul className={styles.mainPage__list}>
            {dataMyProfile?.profile.friends.edges.map(({ node }: any) => (
              <li className={styles.mainPage__item} key={node.id}>
                {node.username}
              </li>
            ))}
          </ul>
        </Grid>
        <Grid item xs={4}>
          <h3>ProfileList</h3>
          <ul className={styles.mainPage__list}>
            {dataProfiles?.allProfiles.edges.map(
              ({ node }: any) =>
                node.id !== dataMyProfile?.profile.id && (
                  <li className={styles.mainPage__item} key={node.id}>
                    {node.userProf.username}
                    <button
                      disabled={
                        myFriends?.includes(node.userProf.id) ||
                        myFriendRequests?.includes(node.userProf.id) ||
                        node.friendRequests.edges
                          .map(({ node }: any) => node.id)
                          .includes(dataMyProfile?.profile.userProf.id)
                      }
                    >
                      {myFriends?.includes(node.userProf.id) ||
                      myFriendRequests?.includes(node.userProf.id) ||
                      node.friendRequests.edges
                        .map(({ node }: any) => node.id)
                        .includes(dataMyProfile?.profile.userProf.id)
                        ? 'requested'
                        : 'request'}
                    </button>
                  </li>
                )
            )}
          </ul>
        </Grid>
        <Grid item xs={4}></Grid>
      </Grid>
    </div>
  )
}

export default MainPage
