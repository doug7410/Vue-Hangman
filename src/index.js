import Vue from 'vue/dist/vue.esm';

new Vue({
  el: '#app',
  data: {
    strikes: 11,
    word: "HANGMAN",
    category: null,
    wordLetters: ['H', 'A', 'N', 'G', 'M', 'A', 'N'],
    wordDisplayLetters: ['H', 'A', 'N', 'G', 'M', 'A', 'N'],
    usedLetters: [],
    possibleLetters1: ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
    possibleLetters2: ["J", "K", "L", "M", "N", "O", "P", "Q", "R", "S"],
    possibleLetters3: ["T", "U", "V", "W", "X", "Y", "Z"],
    initialized: false
  },
  methods: {
    initialize: function() {
      var vm = this;
      axios.get('http://localhost:1234')
        .then(function (res) {
          vm.initialized = true;
          vm.strikes = 0;
          vm.word = res.data.word;
          vm.category = res.data.category;
          vm.wordLetters = vm.word.toUpperCase().split('');
          vm.wordDisplayLetters = vm.wordLetters.map(function(letter){
            var letterIsNotAlpha = !letter.match(/^[a-z0-9]+$/i)
            if(letter === ' ') {
              return ' '
            } else if(letterIsNotAlpha) {
              return letter
            } else {
              return ''
            }
          });
          vm.usedLetters = [];
        })
    },
    tryLetter: function(letter) {
      if (this.usedLetters.includes(letter)) {
        return
      }

      this.usedLetters.push(letter)
      var match = false
      for (var i = 0; i < this.wordDisplayLetters.length; i++) {
        if (letter === this.wordLetters[i]) {
          this.wordDisplayLetters.splice(i, 1, letter)
          match = true
        }
      }

      if (!match) {
        this.strikes++
      }
    },
    getStrikethroughClass: function(letter) {
      if (this.usedLetters.includes(letter)) {
        return 'diagonal-strike';
      }
      return null;
    }
  },
  watch: {
    gameIsWon: function(isWon) {
      if(isWon) {
        swal("Good job!", "You won!", "success");
      }
    }
  },
  computed: {
    gameIsWon: function () {
      var vm = this;
      if(!vm.initialized) {
        return false;
      }
      var won = true;
      this.wordLetters.forEach(function (letter) {
        if (!vm.wordDisplayLetters.includes(letter)) {
          won = false;
        }
      });
      return won;
    }
  }
})