<template>
  <v-layout row wrap>

    <v-flex xs12>
      <h2>アイテム</h2>
    </v-flex>

    <v-flex xs12>

      <v-toolbar dark flat>

        <v-spacer></v-spacer>

        <v-text-field
        v-model="search"
        append-icon="search"
        label="Search"
        single-line
        hide-details
        ></v-text-field>
 
        <v-spacer></v-spacer>

        <v-toolbar-items>

          <v-btn small fab class="mb-2" @click.stop="dialog = true" color="primary">
            <v-icon>add</v-icon>
          </v-btn>

        </v-toolbar-items>

        <v-dialog v-model="dialog" max-width="500px">

          <v-card>
  
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>

                  <v-flex xs12 sm6 md4>
                    <v-text-field v-model="editedItem.name" label="項目" required></v-text-field>
                  </v-flex>

                  <v-flex xs12>
                    <v-menu
                      ref="menu2"
                      :close-on-content-click="false"
                      v-model="menu2"
                      :return-value.sync="editedItem.date"
                      lazy
                      transition="scale-transition"
                      offset-y
                      full-width
                    >
                      <v-text-field
                        slot="activator"
                        v-model="editedItem.date"
                        label="日付"
                        prepend-icon="event"
                        readonly
                      ></v-text-field>
                      <v-date-picker v-model="editedItem.date" @input="$refs.menu2.save(editedItem.date)" no-title full-width></v-date-picker>
                    </v-menu>
                  </v-flex>
  
                  <v-flex xs12>
                    <v-radio-group v-model="editedItem.type" row color="success">
                      <v-radio label="支出" value="expense" color="primary"></v-radio>
                      <v-radio label="収入" value="income" color="primary"></v-radio>
                    </v-radio-group>
                  </v-flex>
  
                  <v-flex xs12>
                    <v-text-field v-model="editedItem.amount" @blur="setBlur()" @keyup="setKeyup()" @keydown="setKeydown()" @keypress="setKeypress()" label="金額" prefix="¥" type="tel" required></v-text-field>
                  </v-flex>
    
                </v-layout>
              </v-container>
            </v-card-text>
  
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click="close">キャンセル</v-btn>
              <v-btn color="blue darken-1" flat @click="save">保存</v-btn>
            </v-card-actions>
  
          </v-card>
  
        </v-dialog>

      </v-toolbar>

      <v-data-table
        :headers="headers"
        :items="itemList"
        :search="search"
        class="elevation-1"
      >
 
        <template slot="items" scope="props">
          <td>{{ props.item.name }}</td>
          <td class="text-xs-right">{{ props.item.date }}</td>
          <td class="text-xs-right">{{ separate(props.item.amount) }}</td>
          <td class="text-xs-right">{{ encode(props.item.type) }}</td>
          <td class="justify-center layout px-0">
            <v-icon
              small
              class="mr-2"
              @click="editItem(props.item)"
            >
              edit
            </v-icon>
            <v-icon
              small
              @click="deleteItem(props.item)"
            >
              delete
            </v-icon>
          </td>
        </template>

      </v-data-table>

    </v-flex>

    <v-flex xs12>
      <h2>月次 - {{ monthFormat() }}</h2>
    </v-flex>

    <v-flex xs12>
      <v-date-picker v-model="picker" full-width type="month" locale="ja" no-title :show-current="false" class="month-height" color="primary" header-color="primary"></v-date-picker>
    </v-flex>
 
    <v-flex xs12>
      <v-card>
        <v-list>
          <v-list-tile>
            <v-list-tile-content>収入</v-list-tile-content>
            <v-list-tile-content class="title table-end">{{ separate(calcProfit.income) }}</v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-content>支出</v-list-tile-content>
            <v-list-tile-content class="title table-end">{{ separate(calcProfit.expense) }}</v-list-tile-content>
          </v-list-tile>
          <v-divider></v-divider>
          <v-list-tile>
            <v-list-tile-content>収支</v-list-tile-content>
            <v-list-tile-content class="title table-end">{{ separate(calcProfit.profit) }}</v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-card>
    </v-flex>

  </v-layout>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  components: {
  },
  data () {
    return {
      picker: null,
      dialog: false,
      search: '',
      menu2: false,
      headers: [
        {
          text: '項目',
          align: 'center',
          sortable: false,
          value: 'name'
        },
        { text: '日付', value: 'date', align: 'right' },
        { text: '金額', value: 'amount', align: 'right' },
        { text: '収支', value: 'type', align: 'right' },
        { text: '', value: 'name', sortable: false }
      ],
      editedIndex: -1,
      editedItem: {
        id: null,
        name: null,
        date: new Date().toISOString().substr(0, 10),
        amount: '',
        type: 'expense'
      },
      defaultItem: {
        id: null,
        name: null,
        date: new Date().toISOString().substr(0, 10),
        amount: '',
        type: 'expense'
      },
      isIME: false
    }
  },
  methods: {
    monthFormat () {
      var year = this.picker.substr(0, 4)
      var month = this.picker.substr(-2)
      return year + '年' + month + '月'
    },
    separate (num) {
      return '¥ ' + String(num).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')
    },
    encode (side) {
      let code = '収入'
      if (side === 'expense') {
        code = '支出'
      }
      return code
    },
    editItem (item) {
      this.editedIndex = this.itemList.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },
    deleteItem (item) {
      if (confirm('本当に削除しますか？')) {
        this.$store.dispatch('deleteData', item)
      }
    },
    close () {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
    },
    save () {
      let date = this.editedItem.date
      let amount = this.editedItem.amount
      if (typeof this.editedItem.amount === 'string') {
        amount = Number(this.editedItem.amount.replace(/,/g, ''))
      }
      let item = {
        id: this.editedItem.id,
        name: this.editedItem.name,
        date: date,
        amount: amount,
        type: this.editedItem.type
      }
      if (this.editedIndex > -1) {
        this.$store.dispatch('editData', item)
      } else {
        this.$store.dispatch('addData', item)
      }
      this.close()
    },
    addFigure (value) {
      let originValue = value
      value = this.removeFigure(value)
      value = parseInt(value, 10)
      if (isNaN(value)) return originValue
      return value.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1,')
    },
    removeFigure (value) {
      if (value.length === 0) return ''
      let num = Number(value.toString().replace(/,/g, ''))
      if (isNaN(num)) return value
      return num
    },
    setKeydown () {
      this.isIME = true
    },
    setKeypress () {
      this.isIME = false
    },
    setKeyup () {
      if (this.isIME === false) this.editedItem.amount = this.addFigure(this.editedItem.amount)
    },
    setBlur () {
      this.editedItem.amount = this.addFigure(this.editedItem.amount)
    }
  },
  created () {
    let today = new Date()
    this.picker = today.getFullYear() + '-' + ('00' + (today.getMonth() + 1)).slice(-2)
  },
  mounted () {
  },
  watch: {
    picker: function () {
      this.search = this.picker
    },
    dialog (val) {
      val || this.close()
    }
  },
  computed: {
    ...mapGetters({
      itemList: 'getItemList'
    }),
    formTitle () {
      return this.editedIndex === -1 ? '新規登録' : '項目の編集'
    },
    calcProfit () {
      let sumExpense = 0
      let sumIncome = 0
      for (var i = 0; i < this.itemList.length; i++) {
        if (this.itemList[i].date.substr(0, 7) === this.picker) {
          if (this.itemList[i].type === 'expense') {
            sumExpense += this.itemList[i].amount
          } else {
            sumIncome += this.itemList[i].amount
          }
        }
      }
      return {expense: sumExpense, income: sumIncome, profit: sumIncome - sumExpense}
    }
  }
}
</script>

<style>
.table-center {
  align-items: center;
}

.table-end {
  align-items: flex-end;
}

.month-height td {
  height: 45px;
}

.month-height .v-date-picker-table--month {
  height: 198px;
}
</style>
