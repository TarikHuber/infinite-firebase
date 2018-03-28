import firebase from 'firebase'

const config = {
  apiKey: 'AIzaSyC7AXGGhHZ0meVUM3nYr0a_sjCHacTewOg',
  authDomain: 'infinite-firebase.firebaseapp.com',
  databaseURL: 'https://infinite-firebase.firebaseio.com',
  projectId: 'infinite-firebase',
  storageBucket: 'infinite-firebase.appspot.com',
  messagingSenderId: '889793926434'
}

export const firebaseApp = firebase.initializeApp(config)
export default firebaseApp