(function () {
  var Tempora, closest,
    bind = function (fn, me) {
      return function () {
        return fn.apply(me, arguments)
      }
    }

  document.addEventListener('DOMContentLoaded', function () {
    const app = new Tempora
    return app.start()
  })

  closest = function (el, fn) {
    return el && (fn(el) ? el : closest(el.parentNode, fn))
  }

  Tempora = (function () {
    Tempora['default'] = {
      active_timer: null,
      timers: [
        {
          id: 'work',
          name: 'Делу время',
          elapsed_seconds: 0,
          timestamp: 0,
        }, {
          id: 'fun',
          name: 'Потехе час',
          elapsed_seconds: 0,
          timestamp: 0,
        },
      ],
    }

    function Tempora () {
      this.save_data = bind(this.save_data, this)
      this.set_interval = bind(this.set_interval, this)
      this.update_elapsed_time = bind(this.update_elapsed_time, this)
      this.reset = bind(this.reset, this)
      this.timers_stop = bind(this.timers_stop, this)
      this.timer_resume = bind(this.timer_resume, this)
      this.timer_go = bind(this.timer_go, this)
      this.onclick = bind(this.onclick, this)
      this.redraw_timers = bind(this.redraw_timers, this)
      this.build_html = bind(this.build_html, this)
      this.start = bind(this.start, this)
      this.data = localStorage.tempora != null ? JSON.parse(localStorage.tempora) : Tempora['default']
      this.interval = null
    }

    Tempora.prototype.start = function () {
      console.log('start')
      this.build_html()
      if (this.data.active_timer) {
        this.timer_resume()
      }
      return document.addEventListener('click', this.onclick)
    }

    Tempora.prototype.build_html = function () {
      var html, i, j, len, ref, results, timer
      console.log('build_html')
      ref = this.data.timers
      results = []
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        timer = ref[i]
        html = `<div class="timer-wrap" id="${timer.id}">
                  <div class="timer-inner" data-i="${i}">
                      <h2>${timer.name}</h2>
                      <span class="elapsed-time">${this.format_time(timer.elapsed_seconds)}</span>
                  </div>
                </div>`
        results.push(document.body.insertAdjacentHTML('beforeend', html))
      }
      return results
    }

    Tempora.prototype.redraw_timers = function () {
      var el, i, j, len, ref, timer
      console.log('redraw_timers')
      ref = this.data.timers
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        timer = ref[i]
        el = document.getElementById(timer.id)
        el.querySelectorAll('.elapsed-time').item(0).textContent = this.format_time(timer.elapsed_seconds)
        if (i !== this.data.active_timer) {
          document.body.classList.remove(timer.id)
          el.classList.remove('active')
        }
      }
      if (this.data.active_timer) {
        document.body.classList.add(this.data.timers[this.data.active_timer].id)
        el = document.getElementById(this.data.timers[this.data.active_timer].id)
        el.classList.add('active')
        return document.getElementById('stop').disabled = false
      } else {
        return document.getElementById('stop').disabled = true
      }
    }

    Tempora.prototype.format_time = function (seconds) {
      var hours, minutes
      hours = Math.floor(seconds / 3600)
      minutes = Math.floor((seconds % 3600) / 60)
      return (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes)
    }

    Tempora.prototype.onclick = function (e) {
      var inner
      if (e.target.tagName === 'BUTTON') {
        if (e.target.classList.contains('reset')) {
          this.reset()
        }
        if (e.target.classList.contains('stop')) {
          return this.timers_stop()
        }
      } else {
        inner = closest(e.target, function (el) {
          var ref
          return (ref = el.classList) != null ? ref.contains('timer-inner') : void 0
        })
        if (inner) {
          return this.timer_go(inner.getAttribute('data-i'))
        }
      }
    }

    Tempora.prototype.timer_go = function (i) {
      console.log('timer_go', i)
      if (this.data.active_timer !== i) {
        this.data.active_timer = i
        this.data.timers[i].timestamp = Date.now()
        this.update_elapsed_time()
        return this.set_interval()
      }
    }

    Tempora.prototype.timer_resume = function () {
      console.log('timer_resume')
      this.update_elapsed_time()
      return this.set_interval()
    }

    Tempora.prototype.timers_stop = function () {
      console.log('timers_stop')
      if (this.interval) {
        clearInterval(this.interval)
      }
      this.update_elapsed_time()
      this.data.timers[this.data.active_timer].timestamp = 0
      this.data.active_timer = null
      this.save_data()
      return this.redraw_timers()
    }

    Tempora.prototype.reset = function () {
      console.log('reset')
      if (this.interval) {
        clearInterval(this.interval)
      }
      this.data = Tempora['default']
      this.save_data()
      return this.redraw_timers()
    }

    Tempora.prototype.update_elapsed_time = function () {
      var t
      t = this.data.timers[this.data.active_timer]
      t.elapsed_seconds += Math.round((Date.now() - t.timestamp) / 1000)
      t.timestamp = Date.now()
      this.save_data()
      return this.redraw_timers()
    }

    Tempora.prototype.set_interval = function () {
      if (this.interval) {
        clearInterval(this.interval)
      }
      return this.interval = setInterval((function (_this) {
        return function () {
          return _this.update_elapsed_time()
        }
      })(this), 30 * 1000)
    }

    Tempora.prototype.save_data = function () {
      console.log('save_data')
      return localStorage.tempora = JSON.stringify(this.data)
    }

    return Tempora
  })()
}).call(this)
