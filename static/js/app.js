(function() {
    'use strict';

    // ===== Config =====
    const DAYS = [
        { key: 'sun-15-mar', label: 'Sun Mar 15' },
        { key: 'mon-16-mar', label: 'Mon Mar 16' },
        { key: 'tue-17-mar', label: 'Tue Mar 17' },
        { key: 'wed-18-mar', label: 'Wed Mar 18' },
        { key: 'thu-19-mar', label: 'Thu Mar 19' },
        { key: 'fri-20-mar', label: 'Fri Mar 20' },
        { key: 'sat-21-mar', label: 'Sat Mar 21' },
        { key: 'sun-22-mar', label: 'Sun Mar 22' },
        { key: 'mon-23-mar', label: 'Mon Mar 23' },
        { key: 'tue-24-mar', label: 'Tue Mar 24' },
        { key: 'wed-25-mar', label: 'Wed Mar 25' },
        { key: 'thu-26-mar', label: 'Thu Mar 26' },
        { key: 'fri-27-mar', label: 'Fri Mar 27' },
        { key: 'sat-28-mar', label: 'Sat Mar 28' },
        { key: 'sun-29-mar', label: 'Sun Mar 29' },
        { key: 'mon-30-mar', label: 'Mon Mar 30' },
        { key: 'tue-31-mar', label: 'Tue Mar 31' },
        { key: 'wed-01-apr', label: 'Wed Apr 1' },
        { key: 'thu-02-apr', label: 'Thu Apr 2' },
        { key: 'fri-03-apr', label: 'Fri Apr 3' },
        { key: 'sat-04-apr', label: 'Sat Apr 4' },
        { key: 'sun-05-apr', label: 'Sun Apr 5' },
        { key: 'mon-06-apr', label: 'Mon Apr 6' },
        { key: 'tue-07-apr', label: 'Tue Apr 7' },
        { key: 'wed-08-apr', label: 'Wed Apr 8' },
        { key: 'thu-09-apr', label: 'Thu Apr 9' },
    ];

    const CATEGORIES = {
        help: 'Help',
        tea: 'Tea',
        food: 'Food'
    };

    const STORAGE_KEY = 'bloom_name';
    let currentName = '';
    let visits = [];
    let votes = [];

    // ===== Petals =====
    function createPetals() {
        const container = document.getElementById('petals-container');
        const petals = ['✿', '❀'];
        const colors = ['#FFB6C1', '#FF69B4', '#FFA07A', '#FFD700', '#FF8C94', '#FFDAB9', '#E8A0BF'];

        for (let i = 0; i < 14; i++) {
            const span = document.createElement('span');
            span.className = 'petal';
            span.textContent = petals[i % 2];
            span.style.left = (Math.random() * 100) + '%';
            span.style.fontSize = (18 + Math.random() * 24) + 'px';
            span.style.color = colors[i % colors.length];
            span.style.animationDuration = (7 + Math.random() * 6) + 's';
            span.style.animationDelay = (Math.random() * 8) + 's';
            container.appendChild(span);
        }
    }

    // ===== Main Page Petals =====
    function createMainPetals() {
        var container = document.getElementById('main-petals-container');
        if (container.childElementCount > 0) return; // only create once
        var symbols = ['✿', '❀'];
        var colors = ['#FF6B9D', '#FF1493', '#FFB6C1', '#FFA751', '#B197FC', '#69DB7C', '#FF6969'];

        for (var i = 0; i < 20; i++) {
            var span = document.createElement('span');
            span.className = 'petal';
            span.textContent = symbols[i % 2];
            span.style.left = (Math.random() * 100) + '%';
            span.style.fontSize = (16 + Math.random() * 22) + 'px';
            span.style.color = colors[i % colors.length];
            var dur = (8 + Math.random() * 8).toFixed(1);
            var delay = (Math.random() * 12).toFixed(1);
            var isSparkly = Math.random() < 0.3;
            if (isSparkly) {
                var sparkleDur = (1.2 + Math.random() * 1.2).toFixed(1);
                var sparkleDelay = (Math.random() * 2).toFixed(1);
                span.style.animation = 'floatUp ' + dur + 's linear ' + delay + 's infinite, sparkle ' + sparkleDur + 's ease-in-out ' + sparkleDelay + 's infinite';
            } else {
                span.style.animationDuration = dur + 's';
                span.style.animationDelay = delay + 's';
            }
            container.appendChild(span);
        }
    }

    // ===== Navigation =====
    function getName() {
        return localStorage.getItem(STORAGE_KEY) || '';
    }

    function showWelcome() {
        document.getElementById('welcome-screen').style.display = 'flex';
        document.getElementById('main-page').style.display = 'none';
    }

    function showMain() {
        document.getElementById('welcome-screen').style.display = 'none';
        document.getElementById('main-page').style.display = 'block';
        document.getElementById('header-name').textContent = currentName;
        createMainPetals();
        renderSchedule(); // render skeleton immediately — don't wait for API
        loadData();
    }

    // ===== API =====
    function api(method, url, data) {
        const opts = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': CSRF_TOKEN
            }
        };
        if (data) opts.body = JSON.stringify(data);
        return fetch(url, opts).then(function(r) {
            if (!r.ok) return r.json().then(function(e) { throw e; });
            return r.json();
        });
    }

    function loadData(retry) {
        Promise.all([
            api('GET', '/api/visits/'),
            api('GET', '/api/votes/')
        ]).then(function(results) {
            visits = results[0];
            votes = results[1];
            renderSchedule();
        }).catch(function() {
            // Skeleton already visible — retry once after 3s on first failure
            if (!retry) setTimeout(function() { loadData(true); }, 3000);
        });
    }

    // ===== Render Schedule =====
    function getTodayKey() {
        var now = new Date();
        var months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
        var days = ['sun','mon','tue','wed','thu','fri','sat'];
        var d = days[now.getDay()];
        var dd = String(now.getDate()).padStart(2, '0');
        var m = months[now.getMonth()];
        return d + '-' + dd + '-' + m;
    }

    function renderSchedule() {
        var container = document.getElementById('schedule-container');
        container.innerHTML = '';
        var todayKey = getTodayKey();

        DAYS.forEach(function(day) {
            var card = document.createElement('div');
            card.className = 'day-card';

            // Day label
            var label = document.createElement('div');
            label.className = 'day-label' + (day.key === todayKey ? ' current' : '');
            label.textContent = day.label;
            card.appendChild(label);

            // Visits for this day
            var dayVisits = visits.filter(function(v) { return v.day === day.key; });
            var claimedCats = {};

            dayVisits.forEach(function(visit) {
                var pill = document.createElement('div');
                pill.className = 'visit-pill';

                var nameSpan = document.createElement('span');
                nameSpan.textContent = visit.name;
                pill.appendChild(nameSpan);

                if (visit.time_text) {
                    var timeSpan = document.createElement('span');
                    timeSpan.className = 'visit-time';
                    timeSpan.textContent = '· ' + visit.time_text;
                    pill.appendChild(timeSpan);
                }

                // Delete button — only for own visits
                if (visit.name === currentName) {
                    var delBtn = document.createElement('button');
                    delBtn.className = 'visit-delete';
                    delBtn.textContent = '×';
                    delBtn.setAttribute('aria-label', 'Remove visit');
                    delBtn.addEventListener('click', function() {
                        deleteVisit(visit.id);
                    });
                    pill.appendChild(delBtn);
                }

                card.appendChild(pill);

                // "Bringing" note
                if (visit.bringing) {
                    var bringing = document.createElement('span');
                    bringing.className = 'visit-bringing';
                    bringing.textContent = 'Bringing: ' + visit.bringing;
                    card.appendChild(bringing);
                }

                // Collect categories
                (visit.tags || []).forEach(function(t) {
                    if (!claimedCats[t]) claimedCats[t] = visit.name;
                });
            });

            // Category tags row
            var catKeys = Object.keys(claimedCats);
            if (catKeys.length > 0) {
                var tagsRow = document.createElement('div');
                tagsRow.className = 'tags-row';

                catKeys.forEach(function(cat) {
                    var tagEl = document.createElement('span');
                    tagEl.className = 'activity-tag tag-' + cat;
                    tagEl.textContent = (CATEGORIES[cat] || cat) + ' \u2014 ' + claimedCats[cat];
                    tagsRow.appendChild(tagEl);
                });

                card.appendChild(tagsRow);
            }

            // Add visit button
            var addBtn = document.createElement('button');
            addBtn.className = 'add-visit-btn';
            addBtn.textContent = '+ Add my visit';
            addBtn.addEventListener('click', function() {
                showAddForm(card, day.key);
            });
            card.appendChild(addBtn);

            container.appendChild(card);
        });
    }

    // ===== Add Visit Form =====
    function getClaimedCats(dayKey) {
        var claimed = {};
        visits.filter(function(v) { return v.day === dayKey; }).forEach(function(v) {
            (v.tags || []).forEach(function(t) {
                claimed[t] = v.name;
            });
        });
        return claimed;
    }

    function showAddForm(card, dayKey) {
        // Remove any existing form in this card
        var existing = card.querySelector('.add-visit-form');
        if (existing) { existing.remove(); return; }

        var claimed = getClaimedCats(dayKey);

        var form = document.createElement('div');
        form.className = 'add-visit-form';
        form.innerHTML =
            '<label>When are you coming?</label>' +
            '<input type="text" class="time-input" placeholder="e.g. afternoon, around 3..." maxlength="200">' +
            '<label>What are you coming for?</label>' +
            '<div class="category-selector"></div>' +
            '<button class="submit-visit-btn">Add Visit</button>' +
            '<button class="cancel-visit-btn">Cancel</button>';

        // Category buttons — radio behavior, 1 selection max
        var selector = form.querySelector('.category-selector');
        var selectedCat = null;
        var buttons = {};

        Object.keys(CATEGORIES).forEach(function(cat) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'category-btn';
            btn.setAttribute('data-cat', cat);

            if (claimed[cat]) {
                btn.textContent = CATEGORIES[cat] + ' \u2014 ' + claimed[cat];
                btn.classList.add('claimed');
                btn.disabled = true;
            } else {
                btn.textContent = CATEGORIES[cat];
                btn.addEventListener('click', function() {
                    // Radio: deselect all, select this one
                    if (selectedCat === cat) {
                        selectedCat = null;
                        btn.classList.remove('selected');
                    } else {
                        Object.keys(buttons).forEach(function(k) {
                            buttons[k].classList.remove('selected');
                        });
                        selectedCat = cat;
                        btn.classList.add('selected');
                    }
                });
            }

            buttons[cat] = btn;
            selector.appendChild(btn);
        });

        // Submit
        form.querySelector('.submit-visit-btn').addEventListener('click', function() {
            var timeText = form.querySelector('.time-input').value.trim();
            if (!timeText) { form.querySelector('.time-input').focus(); return; }

            var tags = selectedCat ? [selectedCat] : [];

            api('POST', '/api/visits/', {
                name: currentName,
                day: dayKey,
                time_text: timeText,
                bringing: '',
                tags: tags
            }).then(function() {
                loadData();
            }).catch(function(err) {
                if (err && err.error) alert(err.error);
            });
        });

        // Cancel
        form.querySelector('.cancel-visit-btn').addEventListener('click', function() {
            form.remove();
        });

        card.appendChild(form);
        form.querySelector('.time-input').focus();
    }

    // ===== Delete Visit =====
    function deleteVisit(id) {
        api('DELETE', '/api/visits/' + id + '/', { name: currentName }).then(function() {
            loadData();
        });
    }

    // ===== Toggle Vote =====
    function toggleVote(day, tag) {
        api('POST', '/api/votes/', {
            day: day,
            tag: tag,
            voter_name: currentName
        }).then(function() {
            loadData();
        });
    }

    // ===== Init =====
    document.addEventListener('DOMContentLoaded', function() {
        createPetals();

        currentName = getName();
        if (currentName) {
            showMain();
        } else {
            showWelcome();
        }

        // Let's Go button
        document.getElementById('lets-go-btn').addEventListener('click', function() {
            var name = document.getElementById('name-input').value.trim();
            if (!name) { document.getElementById('name-input').focus(); return; }
            localStorage.setItem(STORAGE_KEY, name);
            currentName = name;
            showMain();
        });

        // Enter key on name input
        document.getElementById('name-input').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                document.getElementById('lets-go-btn').click();
            }
        });

        // Change name
        document.getElementById('change-name-link').addEventListener('click', function() {
            localStorage.removeItem(STORAGE_KEY);
            currentName = '';
            document.getElementById('name-input').value = '';
            showWelcome();
        });
    });
})();
