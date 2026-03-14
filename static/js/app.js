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

    const TAG_LABELS = {
        entertainment: 'Entertainment',
        games: 'Games',
        movies: 'Movies',
        food: 'Food',
        snacks: 'Snacks',
        tea: 'Tea'
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

    function loadData() {
        Promise.all([
            api('GET', '/api/visits/'),
            api('GET', '/api/votes/')
        ]).then(function(results) {
            visits = results[0];
            votes = results[1];
            renderSchedule();
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
            var allTags = {};

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

                // Collect tags
                (visit.tags || []).forEach(function(t) {
                    if (!allTags[t]) allTags[t] = 0;
                    allTags[t]++;
                });
            });

            // Tags row
            var tagKeys = Object.keys(allTags);
            if (tagKeys.length > 0) {
                var tagsRow = document.createElement('div');
                tagsRow.className = 'tags-row';

                tagKeys.forEach(function(tag) {
                    var tagEl = document.createElement('span');
                    tagEl.className = 'activity-tag tag-' + tag;

                    var voteCount = votes.filter(function(v) {
                        return v.day === day.key && v.tag === tag;
                    }).length;
                    var myVote = votes.some(function(v) {
                        return v.day === day.key && v.tag === tag && v.voter_name === currentName;
                    });

                    tagEl.textContent = TAG_LABELS[tag] || tag;
                    if (voteCount > 0) {
                        var countSpan = document.createElement('span');
                        countSpan.className = 'vote-count';
                        countSpan.textContent = ' ' + voteCount;
                        tagEl.appendChild(countSpan);
                    }
                    if (myVote) {
                        tagEl.style.boxShadow = '0 0 0 2px currentColor';
                    }

                    tagEl.addEventListener('click', function() {
                        toggleVote(day.key, tag);
                    });

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
    function showAddForm(card, dayKey) {
        // Remove any existing form in this card
        var existing = card.querySelector('.add-visit-form');
        if (existing) { existing.remove(); return; }

        var form = document.createElement('div');
        form.className = 'add-visit-form';
        form.innerHTML =
            '<label>When are you coming?</label>' +
            '<input type="text" class="time-input" placeholder="e.g. afternoon, around 3..." maxlength="200">' +
            '<label>Bringing anything? (optional)</label>' +
            '<input type="text" class="bringing-input" placeholder="e.g. snacks, games..." maxlength="200">' +
            '<label>Activities</label>' +
            '<div class="tag-selector"></div>' +
            '<button class="submit-visit-btn">Add Visit</button>' +
            '<button class="cancel-visit-btn">Cancel</button>';

        // Tag toggles
        var selector = form.querySelector('.tag-selector');
        var selectedTags = {};
        Object.keys(TAG_LABELS).forEach(function(tag) {
            var toggle = document.createElement('span');
            toggle.className = 'tag-toggle tag-' + tag;
            toggle.textContent = TAG_LABELS[tag];
            toggle.addEventListener('click', function() {
                selectedTags[tag] = !selectedTags[tag];
                toggle.classList.toggle('selected', selectedTags[tag]);
            });
            selector.appendChild(toggle);
        });

        // Submit
        form.querySelector('.submit-visit-btn').addEventListener('click', function() {
            var timeText = form.querySelector('.time-input').value.trim();
            if (!timeText) { form.querySelector('.time-input').focus(); return; }

            var tags = Object.keys(selectedTags).filter(function(t) { return selectedTags[t]; });

            api('POST', '/api/visits/', {
                name: currentName,
                day: dayKey,
                time_text: timeText,
                bringing: form.querySelector('.bringing-input').value.trim(),
                tags: tags
            }).then(function() {
                loadData();
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
