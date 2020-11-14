'use strict'

function Herd () {
  var version = ' v0.5'

  //Global Variables for Reports
  var unvaccinated
  var infected

  function setStatus (message) {
    $('#app>footer').html(message)
  }

  function Patient (id) {
    this.status = 'immune'
    this.locationID = '\'#patient' + id + '\''
    this.neighbors = []

    //Find all adjacent patient objects by ID
    this.setNeighbors = function () {
      this.neighbors.push((id - 10), (id + 10))
      if (id % 10 !== 1) {
        this.neighbors.push((id - 11), (id + 9), (id - 1))
      }
      if (id % 10 !== 0) {
        this.neighbors.push((id + 11), (id - 9), (id + 1))
      }
      this.inRange = function (e) {
        return e > 0 && e < 101
      }
      this.neighbors = this.neighbors.filter(this.inRange)
    }

    var $location = $('#patient-template .patient').clone()
    var self = this

    this.writeLocation = function () {
      $location.attr('id', this.locationID)
      $location.click(function () {infect(self)})
      $('#patient-grid').append($location)
    }
    this.updateStatus = function () {
      switch (this.status) {
        case 'vulnerable':
          $location.removeClass().addClass('patient vulnerable fa fa-meh-o')
          break
        case 'immune':
          $location.removeClass().addClass('patient immune fa fa-smile-o')
          break
        case 'infected':
          $location.removeClass().addClass('patient infected fa fa-frown-o')
          break
      }
    }
  }

  function infect (target) {

    var outbreakLevel

    function report () {
      var saved = unvaccinated - infected
      var spreadPct = Math.floor(((infected - 1) / (unvaccinated - 1)) * 100)
      var protectedPct = 100 - Math.floor(((infected - 1) / (unvaccinated - 1)) * 100)

      if (spreadPct < 11) {
        outbreakLevel = 'Contained'
      } else if (spreadPct > 89) {
        outbreakLevel = 'Mass Extinction'
      } else if (spreadPct > 10 && spreadPct < 40) {
        outbreakLevel = 'Moderate Outbreak'
      } else {
        outbreakLevel = 'Major Outbreak'
      }

      var msg = saved + ' of ' + unvaccinated + ' unvaccinated remain uninfected, ' + infected + ' infected.<br>' + spreadPct + '% infection spread rate, ' + protectedPct + '% of unvaccinated protected by herd immunity.<br>'
      setStatus(msg)
    }

    function tryInfect (element) {
      var targetID = 'patient' + element
      var timeoutID

      function delayedInfect () {
        timeoutID = window.setTimeout(initInfect, 500)
      }

      function initInfect () {
        var contagionTest = Math.random()
        var $contagion = $('#contagion').val()

        if (window.app[targetID].status === 'vulnerable') {
          if (($contagion / 100) > contagionTest) {
            setInfect(window.app[targetID])
          }
        }
      }

      delayedInfect()
    }

    function setInfect (patient) {
      patient.status = 'infected'
      infected += 1
      patient.updateStatus()
      patient.neighbors.forEach(tryInfect)
      report()
      resetTimer()
    }

    //Figures out when the disease has stopped spreading
    var endTimer

    function startTimer () {
      endTimer = window.setTimeout(function () {$('#app>footer').append(outbreakLevel)}, 1000)
    }

    function resetTimer () {
      window.clearTimeout(endTimer)
      startTimer()
    }

    if (target.status === 'vulnerable') {
      $('.patient').off()
      setInfect(target)
    }

  }

  function populate () {
    $('#patient-grid').text('')
    for (var i = 1; i < 101; i++) {
      var key = 'patient' + i
      window.app[key] = new Patient(i)
      window.app[key].setNeighbors()
      window.app[key].writeLocation()
    }
  }

  function vaccinate () {
    populate()
    infected = 0
    $('.patient').removeClass().addClass('patient immune fa fa-smile-o')
    var vacRate = $('#vac-rate').val()
    var uptake = $('#uptake').val()
    vacRate = Math.floor(vacRate * (uptake / 100))
    unvaccinated = 100 - vacRate

    var usedNums = []

    // Set first vulnerable patient to 45, to have a consistent starting point.
    if (vacRate < 100) {
      window.app.patient45.status = 'vulnerable'
      window.app.patient45.updateStatus()
      usedNums.push(45)
    }

    for (var i = 1; i < unvaccinated; i++) {
      var fetchNum = 1
      do {
        fetchNum = Math.floor(Math.random() * 100) + 1
      }
      while (usedNums.indexOf(fetchNum) !== -1)
      usedNums.push(fetchNum)

      var patientID = 'patient' + fetchNum
      window.app[patientID].status = 'vulnerable'
      window.app[patientID].updateStatus()
    }
    setStatus(unvaccinated + ' unvaccinated. Click to infect...')
    $('button#spread-but').click(function () {
      infect(window.app.patient45)
      $('button#spread-but').fadeOut()
    }).fadeIn()
  }

  this.start = function () {
    $('#app>header').append(version)
    setStatus('ready')
    populate()
    $('button#vac-but').click(function () {
      vaccinate()
    })
  }
}

$(function () {
  window.app = new Herd()
  window.app.start()
})
