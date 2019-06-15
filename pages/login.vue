<template>
  <v-layout row wrap>

    <v-flex xs12>
      <h3>Googleアカウントでサインインしてください．</h3>
    </v-flex>

    <v-flex xs12>
      <v-btn color="primary" value="google signin" @click="googleLogin()">サインイン</v-btn>
    </v-flex>

  </v-layout>
</template>

<script>
import { mapActions } from 'vuex'
import { auth } from '~/plugins/firebase'
export default {
  data () {
    return {
    }
  },
  methods: {
    ...mapActions([
      'login',
      'setUser',
      'getCurrentData'
    ]),
    googleLogin () {
      let provider = new auth.GoogleAuthProvider()
      auth().signInWithPopup(provider)
        .then(() => { console.log('google login') })
        .catch((err) => console.log(err))
    },
    googleLogout () {
      auth.signOut()
    }
  },
  mounted () {
    auth().onAuthStateChanged((user) => {
      this.setUser(user)
      if (user) {
        this.$router.push('/')
        this.getCurrentData()
      }
    })
  }
}
</script>

