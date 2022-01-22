const Counter = {
  data() {
    return {
      payload: {
        username: '',
        password: '',
        confirm_pass: ''
      }
    }
  },
  computed: {
    error: function() {
      return  {
        confirm_pass: this.payload.password != this.payload.confirm_pass
      }
    },
    form_invalid: function() {
      const isError = Object.keys(this.error)
        .map(k => this.error[k])
        .every(t => t)
      return isError
    }
  }
}

Vue.createApp(Counter).mount('#main-app')
