import Vuex from 'vuex'
import { auth, DB } from '~/plugins/firebase'

const store = () =>
  new Vuex.Store({
    state: {
      itemList: [],
      user: null,
      uid: null
    },
    mutations: {
      setHouseholdData (state, payload) {
        state.itemList = payload
      },
      addHouseholdData (state, payload) {
        let amount = Number(payload.data().amount)
        let newItem = {id: payload.id, date: payload.data().date, name: payload.data().name, amount: amount, type: payload.data().type}
        state.itemList.push(newItem)
      },
      editHouseholdData (state, payload) {
        var index = 0
        for (var i = 0; i < state.itemList.length; i++) {
          if (state.itemList[i].id === payload.id) {
            index = i
          }
        }
        state.itemList.splice(index, 1, payload)
      },
      deleteHouseholdData (state, payload) {
        const index = state.itemList.indexOf(payload)
        state.itemList.splice(index, 1)
      },
      setUser (state, payload) {
        state.user = payload
        state.uid = payload.uid
        console.log(state.uid)
      }
    },
    actions: {
      getCurrentData ({ commit, state }) {
        DB.collection(state.uid).orderBy('date').get().then(res => {
          let itemTmpList = []
          res.forEach(doc => {
            let amount = Number(doc.data().amount)
            let data = {
              id: doc.id,
              date: doc.data().date,
              name: doc.data().name,
              amount: amount,
              type: doc.data().type
            }
            itemTmpList.push(data)
          })
          commit('setHouseholdData', itemTmpList)
        })
      },
      addData ({ commit, state }, item) {
        let newItem = {date: item.date, name: item.name, amount: item.amount, type: item.type}
        DB.collection(state.uid).add(newItem)
          .then(function (docRef) {
            docRef.get().then(function (doc) {
              commit('addHouseholdData', doc)
            })
          })
      },
      editData ({ commit, state }, item) {
        let newItem = {date: item.date, name: item.name, amount: item.amount, type: item.type}
        commit('editHouseholdData', item)
        DB.collection(state.uid).doc(item.id).set(newItem)
      },
      deleteData ({ commit, state }, item) {
        commit('deleteHouseholdData', item)
        DB.collection(state.uid).doc(item.id).delete()
      },
      login ({ commit }, { email, password }) {
        return new Promise((resolve, reject) => {
          auth.signInWithEmailAndPassword(email, password)
            .then(() => resolve())
            .catch((err) => reject(err))
        })
      },
      setUser ({ commit }, payload) {
        commit('setUser', payload)
      }
    },
    getters: {
      getItemList: state => {
        return state.itemList
      },
      isAuthenticated: state => {
        return !!state.user
      }
    }
  })

export default store
