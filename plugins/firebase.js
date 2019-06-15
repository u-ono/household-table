import firebase from 'firebase'
import 'firebase/auth'
import 'firebase/firestore'
import config from '@/firebase.config.js'

if (!firebase.apps.length) {
  firebase.initializeApp(config)
}

const settings = { timestampsInSnapshots: true }

export const auth = firebase.auth
export const DB = firebase.firestore()
DB.settings(settings)

export default firebase
