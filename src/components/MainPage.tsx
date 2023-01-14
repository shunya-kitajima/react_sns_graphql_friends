import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@apollo/react-hooks'
import { useMutation, useLazyQuery } from '@apollo/client'
import {
  Grid,
  Modal,
  makeStyles,
  TextField,
  IconButton,
} from '@material-ui/core'
import ExitToApp from '@material-ui/icons/ExitToApp'
import SendIcon from '@material-ui/icons/Send'
import {
  UPDATE_FRIENDS,
  UPDATE_FRIEND_REQUESTS,
  CREATE_MESSAGE,
  GET_PROFILES,
  GET_MYPROFILE,
  GET_MESSAGES,
} from '../queries'
import styles from './MainPage.module.css'

const getModalStyle = () => {
  const top = 50
  const left = 50

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  }
}

const useStyles = makeStyles((theme) => ({
  modal: {
    outline: 'none',
    position: 'absolute',
    width: 250,
    borderRadius: 3,
    backgroundColor: 'white',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(3),
  },
}))

const MainPage: React.FC = () => {
  const navigate = useNavigate()
  const classes = useStyles()
  const [dm, setDm] = useState('')
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [selectedReceiver, setSelectedReceiver] = useState('')
  const { data: dataMyProfile, error: errorMyProfile } = useQuery(
    GET_MYPROFILE,
    {
      fetchPolicy: 'cache-and-network',
    }
  )
  const { data: dataProfiles, error: errorProfiles } = useQuery(GET_PROFILES, {
    fetchPolicy: 'cache-and-network',
  })
  const [getDMs, { data: dataDMs }] = useLazyQuery(GET_MESSAGES, {
    fetchPolicy: 'cache-and-network',
  })
  const myFriends = dataMyProfile?.profile.friends.edges.map(
    ({ node }: any) => node.id
  )
  const myFriendRequests = dataMyProfile?.profile.friendRequests.edges.map(
    ({ node }: any) => node.id
  )
  const [updateFriends] = useMutation(UPDATE_FRIENDS)
  const [updateFriendRequests] = useMutation(UPDATE_FRIEND_REQUESTS)
  const [createMessage] = useMutation(CREATE_MESSAGE)

  const sendFriendRequest = async (node: any): Promise<void> => {
    await updateFriendRequests({
      variables: {
        id: node.id,
        friendRequests: [
          ...node.friendRequests.edges.map(({ node }: any) => node.id),
          dataMyProfile?.profile.userProf.id,
        ],
      },
    })
  }

  const approveFriendRequest = async (node: any): Promise<void> => {
    await updateFriends({
      variables: {
        id: dataMyProfile.profile.id,
        friends: [...myFriends, node.id],
      },
    })
    await updateFriends({
      variables: {
        id: node.profile.id,
        friends: [
          ...node.profilesFriends.edges.map(
            ({ node }: any) => node.userProf.id
          ),
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

  const createDM = async () => {
    await createMessage({
      variables: {
        message: dm,
        receiver: selectedReceiver,
      },
    })
    setDm('')
    setSelectedReceiver('')
    setIsOpenModal(false)
  }

  useEffect(() => {
    if (dataMyProfile?.profile.userProf.id) {
      getDMs({
        variables: {
          receiver: dataMyProfile?.profile.userProf.id,
        },
      })
    }
  }, [dataMyProfile?.profile.userProf.id, getDMs])

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
                      onClick={async () => await sendFriendRequest(node)}
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
        <Grid item xs={4}>
          <h3>Friend requests by</h3>
          <ul className={styles.mainPage__list}>
            {dataMyProfile?.profile.friendRequests.edges.map(
              ({ node }: any) => (
                <li className={styles.mainPage__item} key={node.id}>
                  {node.username}
                  <button
                    onClick={async () => {
                      await approveFriendRequest(node)
                    }}
                  >
                    approve
                  </button>
                </li>
              )
            )}
          </ul>
        </Grid>
      </Grid>
    </div>
  )
}

export default MainPage
