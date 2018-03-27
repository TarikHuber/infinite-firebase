import React, { Component } from 'react'
import { render } from 'react-dom'
import firebase from 'firebase'
import InfiniteRTDList from '../../src/InfiniteRTDList'

const config = {
  apiKey: 'AIzaSyC7AXGGhHZ0meVUM3nYr0a_sjCHacTewOg',
  authDomain: 'infinite-firebase.firebaseapp.com',
  databaseURL: 'https://infinite-firebase.firebaseio.com',
  projectId: 'infinite-firebase',
  storageBucket: 'infinite-firebase.appspot.com',
  messagingSenderId: '889793926434'
}

const firebaseApp = firebase.initializeApp(config)

class Demo extends Component {
  componentWillMount() {
    firebaseApp.database().ref('infinite_list').once('value', snap => {
      console.log(snap)
    })
  }

  render() {
    return <div>
      <h1>infinite-firebase Demo</h1>
      <InfiniteRTDList firebaseRef={firebaseApp.database().ref('infinite_list')} />
    </div>
  }
}

render(<Demo />, document.querySelector('#demo'))
