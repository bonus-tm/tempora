document.addEventListener 'DOMContentLoaded', ->
    app = new Tempora
    do app.start

# заменитель метода jQuery.closest
closest = (el, fn) ->
    return el && (if fn(el) then el else closest el.parentNode, fn)


class Tempora
    @default:
        active_timer: null
        active_timer_before_stop: null
        timers: [
            {id: 'work', name: 'Делу время', minutes_elapsed: 0, started_timestamp: 0}
            {id: 'fun', name: 'Потехе час', minutes_elapsed: 0, started_timestamp: 0}
        ]

    constructor: ->
        @data = if localStorage.tempora?
            JSON.parse localStorage.tempora
        else
            Tempora.default
        @interval = null

# запуск
    start: =>
        console.log 'start'
        do @build_html
        @timer_resume @data.active_timer if @data.active_timer
        document.addEventListener 'click', @onclick

# вёрстка
    build_html: =>
        console.log 'build_html'
        for timer, i in @data.timers
            html = """<div class="timer-wrap" id="#{timer.id}">
                        <div class="timer-inner" data-i="#{i}">
                            <h2>#{timer.name}</h2>
                            <span class="elapsed-time">#{@format_time timer.minutes_elapsed}</span>
                        </div>
                      </div>"""
            document.body.insertAdjacentHTML 'beforeend', html

# клик на кнопке таймера
    onclick: (e) =>
        if e.target.tagName is 'BUTTON'
            if e.target.classList.contains 'reset'
                do @reset
            if e.target.classList.contains 'stop'
                do @stop
        else
            inner = closest e.target, (el) ->
                return el.classList?.contains 'timer-inner'
            if inner
                @timer_go inner.getAttribute 'data-i'

# запуск таймера
    timer_go: (i) =>
        console.log 'timer_go', i
        unless @data.active_timer is i
            @data.active_timer = i
            @data.timers[i].started_timestamp = Date.now()
            @data.active_timer_before_stop = null
            do @save_data
            do @redraw_timers
            do @set_interval

# восстановление и запуск ранее запущенного таймера при загрузке
    timer_resume: (i) =>
        console.log 'timer_resume', i
        @update_elapsed_time i
        do @set_interval

# перерисовка всех таймеров и обновление их значений
    redraw_timers: =>
        console.log 'redraw_timers'
        for timer, i in @data.timers
            el = document.getElementById timer.id
            el.querySelectorAll('.elapsed-time').item(0).textContent = @format_time timer.minutes_elapsed
            unless i is @data.active_timer
                document.body.classList.remove timer.id
                el.classList.remove 'active'

        if @data.active_timer
            document.body.classList.add @data.timers[@data.active_timer].id
            el = document.getElementById @data.timers[@data.active_timer].id
            el.classList.add 'active'
            document.getElementById('stop').disabled = false
        else
            document.getElementById('stop').disabled = true

# форматирование времени
    format_time: (minutes) ->
        hours = Math.floor minutes / 60
        mins = minutes %% 60
        return "#{if hours < 10 then '0' + hours else hours}:#{if mins < 10 then '0' + mins else mins}"

# включение ежеминутного таймера
    set_interval: =>
        clearInterval @interval if @interval
        @interval = setInterval =>
            @update_elapsed_time @data.active_timer
        , 60 * 1000

# обновление значения активного таймера
    update_elapsed_time: (i) =>
        seconds_elapsed = Math.round (Date.now() - @data.timers[i].started_timestamp) / 1000
        @data.timers[i].minutes_elapsed = Math.ceil seconds_elapsed / 60
        do @save_data
        do @redraw_timers

# остановка всех таймеров
    stop: =>
        console.log 'stop'
        clearInterval @interval if @interval
        @data.active_timer_before_stop = @data.active_timer
        @data.active_timer = null
        do @save_data
        do @redraw_timers

# сброс всех значений
    reset: =>
        console.log 'reset'
        clearInterval @interval if @interval
        @data = Tempora.default
        do @save_data
        do @redraw_timers

# сохранение изменённых данных
    save_data: =>
        console.log 'save_data'
        localStorage.tempora = JSON.stringify @data
        