(() => {
  'use strict';
  const projects = {
    hms: { title: 'Multi-Speciality HMS', category: 'Healthcare', group: 'operations', description: 'Appointments, patient queues, clinical workflows and billing in one connected hospital workspace.', label: 'Hospital workspace', features: 'Patient registration, OPD & inpatient care, pharmacy, billing & reporting', stack: '.NET, PostgreSQL, Python' },
    school: { title: 'School ERP', category: 'Education', group: 'operations', description: 'Bring admissions, attendance, fees and parent communication into the same school day.', label: 'School administration', features: 'Admissions, attendance, fee collection, timetables & parent apps', stack: '.NET, PostgreSQL, Kotlin, iOS' },
    billing: { title: 'Billing & Inventory', category: 'Retail & business', group: 'operations', description: 'Move from product selection to an accurate invoice, with stock information close at hand.', label: 'Retail billing workspace', features: 'Invoicing, GST configuration, stock control, purchases & reporting', stack: '.NET, PostgreSQL, Azure' },
    food: { title: 'Food Ordering & Delivery', category: 'On-demand commerce', group: 'apps', description: 'Connect the customer, restaurant and delivery partner through every stage of an order.', label: 'Customer order tracking', features: 'Restaurant discovery, checkout, kitchen orders, rider assignment & tracking', stack: '.NET, Kotlin, iOS, Maps' },
    taxi: { title: 'Taxi Booking', category: 'Mobility', group: 'apps', description: 'A connected booking experience for passengers, drivers and the team managing the fleet.', label: 'Passenger booking app', features: 'Vehicle selection, driver matching, fares, navigation & fleet operations', stack: '.NET, Kotlin, iOS, Maps' },
    home: { title: 'Smart Home IoT', category: 'Connected living', group: 'connected', description: 'Simple controls for lighting, climate and connected devices, wherever you are.', label: 'Home controls', features: 'Device control, room scenes, telemetry, alerts & mobile access', stack: 'Python, MQTT, Kotlin, iOS' },
    solar: { title: 'Solar Monitoring', category: 'Energy intelligence', group: 'connected', description: 'See generation patterns and system performance clearly across web and mobile.', label: 'Solar energy workspace', features: 'Generation, inverter health, consumption, grid export & alerts', stack: 'Python, MQTT, PostgreSQL, Kotlin' },
    exam: { title: 'Online Examination Portal', category: 'Digital assessment', group: 'operations', description: 'Give students a focused assessment experience and educators a manageable evaluation workflow.', label: 'Student assessment', features: 'Question banks, assessments, evaluation, results & analytics', stack: '.NET, React, PostgreSQL' }
  };
  const queueSeed = () => [
    { token: 'OPD-024', department: 'Cardiology', reason: 'Follow-up', state: 'In consultation' },
    { token: 'OPD-025', department: 'Orthopaedics', reason: 'Consultation', state: 'Waiting' },
    { token: 'OPD-026', department: 'Cardiology', reason: 'Review', state: 'Waiting' },
    { token: 'OPD-023', department: 'General medicine', reason: 'Consultation', state: 'Completed' }
  ];
  const state = {
    hms: { queue: queueSeed(), department: 'All departments', message: '' },
    school: { present: [true, true, false, true], message: '' },
    billing: { cart: { 0: 1, 1: 2 } }, food: { step: 0 },
    taxi: { vehicle: 0, booked: false }, home: { lights: true, plug: false, temperature: 24 },
    solar: { period: 'day' }, exam: { question: 0, answer: null, submitted: false, score: 0, complete: false }
  };
  const catalog = [{ name: 'Rice, 1 kg', price: 68 }, { name: 'Milk, 500 ml', price: 30 }, { name: 'Tea, 250 g', price: 125 }, { name: 'Oil, 1 L', price: 148 }, { name: 'Soap, 100 g', price: 42 }, { name: 'Sugar, 1 kg', price: 46 }];
  const vehicles = [{ name: 'Mini', price: 186, eta: '4 min away' }, { name: 'Auto', price: 128, eta: '3 min away' }, { name: 'Bike', price: 76, eta: '2 min away' }];
  const questions = [
    { text: 'Which SQL clause filters the results of a grouped query?', options: ['WHERE', 'HAVING', 'ORDER BY', 'JOIN'], correct: 1, explanation: 'HAVING filters groups after GROUP BY is applied.' },
    { text: 'Which HTTP method is conventionally used to retrieve a resource?', options: ['POST', 'DELETE', 'GET', 'PATCH'], correct: 2, explanation: 'GET requests a representation of the specified resource.' }
  ];
  const root = document.querySelector('#demo-root');
  const detail = document.querySelector('#project-detail');
  const picker = document.querySelector('#project-select');
  const status = document.querySelector('[data-selection-status]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = Object.hasOwn(projects, location.hash.slice(1)) ? location.hash.slice(1) : 'hms';
  let filter = 'all';
  let transition;
  const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  const action = (name, label, extra = '', secondary = false) => `<button type="button" class="${secondary ? 'demo-secondary' : 'demo-action'}" data-action="${name}" ${extra}>${label}</button>`;
  const top = (title, subtitle, control = '<span class="sample-tag">Sample data</span>') => `<div class="demo-topline"><div><h3>${title}</h3><p>${subtitle}</p></div>${control}</div>`;

  function hmsDemo() {
    const s = state.hms;
    const rows = s.queue.filter(p => s.department === 'All departments' || p.department === s.department);
    const waiting = rows.filter(p => p.state === 'Waiting').length;
    return top('Outpatient queue', 'Reception / Today', `<label class="demo-select"><span class="sr-only">Department</span><select data-control="department">${['All departments', 'Cardiology', 'Orthopaedics', 'General medicine'].map(d => `<option ${d === s.department ? 'selected' : ''}>${d}</option>`).join('')}</select></label>`) +
      `<div class="queue-metrics">${['Waiting', 'In consultation', 'Completed'].map(label => `<div><strong>${rows.filter(p => p.state === label).length}</strong><span>${label}</span></div>`).join('')}</div>
      <div class="table-scroll"><table class="data-table"><caption class="sr-only">Sample outpatient queue</caption><thead><tr><th>Patient token</th><th class="department-cell">Department</th><th>Visit</th><th>Status</th></tr></thead><tbody>${rows.map(p => `<tr><td>${p.token}</td><td class="department-cell">${p.department}</td><td>${p.reason}</td><td><span class="state-text">${p.state}</span></td></tr>`).join('')}</tbody></table></div>
      <div class="demo-actions"><p>Try moving the queue forward.</p>${action(waiting ? 'call-patient' : 'reset-queue', waiting ? 'Call next patient' : 'Reset queue')}</div><p class="demo-feedback" role="status">${s.message}</p>`;
  }
  function schoolDemo() {
    const s = state.school;
    const students = ['Meera R.', 'Arjun S.', 'Nila K.', 'Aditya M.'];
    return top('Class attendance', 'Class VIII A / Morning session') +
      `<div class="queue-metrics"><div><strong>${s.present.filter(Boolean).length}</strong><span>Present</span></div><div><strong>${s.present.filter(p => !p).length}</strong><span>Absent</span></div><div><strong>${students.length}</strong><span>Students in preview</span></div></div><table class="data-table"><caption class="sr-only">Sample class attendance</caption><thead><tr><th>Roll</th><th>Student</th><th>Attendance</th></tr></thead><tbody>${students.map((name, i) => `<tr><td>${i + 1}</td><td>${name}</td><td><label><input type="checkbox" data-student="${i}" ${s.present[i] ? 'checked' : ''} aria-label="${name} present">Present</label></td></tr>`).join('')}</tbody></table><div class="demo-actions"><p>Mark attendance, then save.</p>${action('save-attendance', 'Save attendance')}</div><p class="demo-feedback" role="status">${s.message}</p>`;
  }
  function billingDemo() {
    const cart = state.billing.cart;
    const entries = Object.entries(cart).filter(([, qty]) => qty > 0);
    const total = entries.reduce((sum, [id, qty]) => sum + catalog[id].price * qty, 0);
    return top('New sale', 'Select a product to add it to the bill') + `<div class="billing-layout"><div class="catalog">${catalog.map((p, i) => `<button type="button" data-action="add-item" data-item="${i}" aria-label="Add ${p.name} to bill">${p.name}<span>${money(p.price)} <span aria-hidden="true" style="display:inline">+</span></span></button>`).join('')}</div><div class="invoice"><h4>Current bill</h4>${entries.length ? `<ul class="invoice-lines">${entries.map(([id, qty]) => `<li><span>${catalog[id].name} × ${qty}</span><strong>${money(catalog[id].price * qty)}</strong></li>`).join('')}</ul>` : '<p class="invoice-empty">Your bill is empty. Choose a product to begin.</p>'}<div class="invoice-total"><span>Total</span><output aria-live="polite">${money(total)}</output></div>${action('clear-bill', 'Clear bill', entries.length ? '' : 'disabled', true)}</div></div><p class="demo-caption">Sample prices are tax inclusive. No payment is collected.</p>`;
  }
  function foodDemo() {
    const steps = ['Order confirmed', 'Preparing your food', 'On the way', 'Delivered'];
    const notes = ['The restaurant has your order', 'Freshly prepared in the kitchen', 'Your delivery partner has collected it', 'Enjoy your meal'];
    return top('Your order', 'Order FD-2841 / Sample delivery') + `<div class="delivery-layout"><div class="order-summary"><h4>Lunch from your favourites</h4><p>Deliver to Home</p><ul class="order-items"><li><span>Vegetable biryani × 2</span><strong>₹320</strong></li><li><span>Fresh lime soda × 1</span><strong>₹60</strong></li></ul><div class="order-total"><span>Total paid</span><strong>₹380</strong></div></div><ol class="delivery-track">${steps.map((label, i) => `<li class="${i <= state.food.step ? 'complete' : ''} ${i === state.food.step ? 'current' : ''}" ${i === state.food.step ? 'aria-current="step"' : ''}>${label}<small>${i === state.food.step ? notes[i] : i < state.food.step ? 'Completed' : 'Upcoming'}</small></li>`).join('')}</ol></div><div class="demo-actions"><p role="status">${notes[state.food.step]}</p>${action('advance-order', state.food.step === 3 ? 'Replay order' : 'Advance order')}</div>`;
  }
  function taxiDemo() {
    const s = state.taxi;
    const vehicle = vehicles[s.vehicle];
    return top('Plan a ride', 'Tenkasi / Sample booking') + `<div class="ride-layout"><div><div class="trip-route"><div><small>Pickup</small><p>Tenkasi New Bus Stand</p></div><div><small>Destination</small><p>Courtallam Main Falls</p></div></div><p class="demo-caption">Choose a vehicle to compare sample fares.</p></div><div>${s.booked ? `<div class="ride-confirmation" role="status"><strong>Your ${vehicle.name.toLowerCase()} is assigned.</strong><p>Driver: Karthik R.<br>TN 76 AB 2048<br>${vehicle.eta}</p><p>Demo booking only. No ride has been requested.</p></div>` : `<div class="ride-choices" role="group" aria-label="Vehicle type">${vehicles.map((v, i) => `<button type="button" data-action="choose-vehicle" data-vehicle="${i}" aria-pressed="${i === s.vehicle}"><span>${v.name}<small>${v.eta}</small></span><strong>${money(v.price)}</strong></button>`).join('')}</div>`}</div></div><div class="demo-actions"><p>${s.booked ? 'Booking preview complete.' : `${vehicle.name} selected / ${money(vehicle.price)} estimated fare`}</p>${action(s.booked ? 'reset-ride' : 'book-ride', s.booked ? 'Try another ride' : 'Preview booking')}</div>`;
  }
  function homeDemo() {
    const s = state.home;
    return top('Living room', 'Control your connected devices') + `<div class="home-layout"><figure style="margin:0"><img class="home-photo" src="assets/portfolio-smart-home.webp" width="1536" height="1024" loading="lazy" alt="Illustrative smart-home hub and wall switch in a home"><figcaption class="home-photo-caption">Product concept illustration</figcaption></figure><div><div class="device-control"><div><strong>Ambient lighting</strong><small>${s.lights ? 'On' : 'Off'}</small></div><button class="switch" type="button" role="switch" aria-checked="${s.lights}" aria-label="Ambient lighting" data-action="toggle-light"></button></div><div class="device-control"><div><strong>Smart plug</strong><small>${s.plug ? 'On' : 'Off'}</small></div><button class="switch" type="button" role="switch" aria-checked="${s.plug}" aria-label="Smart plug" data-action="toggle-plug"></button></div><label class="temperature-control"><span>Target temperature <output id="temperature-value">${s.temperature}°C</output></span><input type="range" min="18" max="30" value="${s.temperature}" data-control="temperature" aria-label="Target temperature" aria-valuetext="${s.temperature} degrees Celsius"></label><p class="demo-feedback" role="status" data-home-status>Adjust a control to try the room settings.</p></div></div>`;
  }
  function solarDemo() {
    const day = state.solar.period === 'day';
    const values = day ? [0, .6, 2.1, 4.8, 6.1, 5.2, 3.4, .8, 0] : [25.4, 29.8, 31.2, 26.7, 34.1, 30.4, 28.6];
    const labels = day ? ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const peak = Math.max(...values);
    const total = values.reduce((sum, value) => sum + value, 0) * (day ? 2 : 1);
    const points = values.map((v, i) => `${i * 600 / (values.length - 1)},${125 - v / peak * 105}`).join(' ');
    return top('Generation overview', day ? 'Power output through the day' : 'Energy generated this week', `<div class="period-switch" role="group" aria-label="Generation period"><button type="button" data-action="solar-period" data-period="day" aria-pressed="${day}">Day</button><button type="button" data-action="solar-period" data-period="week" aria-pressed="${!day}">Week</button></div>`) + `<div class="solar-summary"><div><strong>${total.toFixed(1)} <small>kWh</small></strong><span>Total generation</span></div><div><strong>${peak.toFixed(1)} <small>${day ? 'kW' : 'kWh'}</small></strong><span>${day ? 'Peak output' : 'Best day'}</span></div></div><svg class="solar-chart" viewBox="0 0 600 145" preserveAspectRatio="none" role="img" aria-label="Sample ${day ? 'daily power output' : 'weekly generation'} chart. Values are available in the data table below."><path d="M0 125H600 M0 72H600 M0 20H600" fill="none" stroke="var(--line)" stroke-width="1"/><polygon points="0,125 ${points} 600,125" fill="var(--accent-soft)"/><polyline points="${points}" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg><div class="chart-labels"><span>${labels[0]}</span><span>${labels[Math.floor(labels.length / 2)]}</span><span>${labels.at(-1)}</span></div><details class="chart-data"><summary>View sample readings</summary><table><caption class="sr-only">Sample generation readings</caption><thead><tr><th>${day ? 'Time' : 'Day'}</th><th>${day ? 'Power (kW)' : 'Energy (kWh)'}</th></tr></thead><tbody>${values.map((v, i) => `<tr><td>${labels[i]}</td><td>${v.toFixed(1)}</td></tr>`).join('')}</tbody></table></details>`;
  }
  function examDemo() {
    const s = state.exam;
    if (s.complete) return top('Assessment complete', 'Software fundamentals / Sample assessment') + `<div class="exam-result" role="status"><strong>${s.score} / ${questions.length}</strong><h4>Your results are ready.</h4><p>You completed both sample questions.</p></div><div class="demo-actions"><p>Try the assessment again.</p>${action('restart-exam', 'Restart assessment')}</div>`;
    const q = questions[s.question];
    return top('Software fundamentals', 'Sample assessment') + `<div class="exam-progress"><span>Question ${s.question + 1} of ${questions.length}</span><span>Single answer</span></div><p class="exam-question" id="exam-question">${q.text}</p><fieldset class="exam-options" aria-labelledby="exam-question" ${s.submitted ? 'disabled' : ''}>${q.options.map((option, i) => `<label><input type="radio" name="exam-answer" value="${i}" ${s.answer === i ? 'checked' : ''}>${option}</label>`).join('')}</fieldset><p class="demo-feedback" role="status">${s.submitted ? `${s.answer === q.correct ? 'Correct.' : 'Not quite.'} ${q.explanation}` : 'Choose an answer to continue.'}</p><div class="demo-actions"><p>${s.submitted ? 'Answer saved.' : 'Your answer stays selected until you submit.'}</p>${action(s.submitted ? 'next-question' : 'submit-answer', s.submitted ? (s.question === questions.length - 1 ? 'See results' : 'Next question') : 'Submit answer', s.answer === null ? 'disabled' : '')}</div>`;
  }
  const demos = { hms: hmsDemo, school: schoolDemo, billing: billingDemo, food: foodDemo, taxi: taxiDemo, home: homeDemo, solar: solarDemo, exam: examDemo };
  function renderDemo(focusSelector) {
    root.innerHTML = demos[current]();
    if (focusSelector) root.querySelector(focusSelector)?.focus({ preventScroll: true });
  }
  function selectProject(id, announce = true, updateHash = true) {
    if (!Object.hasOwn(projects, id)) return;
    current = id;
    const p = projects[id];
    document.querySelectorAll('[data-project]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.project === id)));
    picker.value = id;
    for (const key of ['title', 'category', 'description', 'features', 'stack']) document.querySelector(`[data-${key}]`).textContent = p[key];
    document.querySelector('[data-demo-label]').textContent = p.label;
    document.querySelector('.project-enquiry').setAttribute('aria-label', `Discuss ${p.title}`);
    renderDemo();
    transition?.cancel();
    if (!reducedMotion.matches) transition = detail.animate([{ opacity: .3, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 280, easing: 'ease-out' });
    if (announce) status.textContent = `${p.title} selected. Interactive preview updated.`;
    if (updateHash) history.replaceState(null, '', `${location.pathname}${location.search}#${id}`);
  }
  function filterProjects(nextFilter, announce = true) {
    filter = nextFilter;
    const visible = Object.keys(projects).filter(id => filter === 'all' || projects[id].group === filter);
    document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
    document.querySelectorAll('[data-project]').forEach(button => { button.hidden = !visible.includes(button.dataset.project); });
    picker.innerHTML = visible.map(id => `<option value="${id}">${projects[id].title}</option>`).join('');
    document.querySelector('[data-count]').textContent = `${visible.length} products`;
    selectProject(visible.includes(current) ? current : visible[0], false, announce);
    if (announce) status.textContent = `${visible.length} products. ${projects[current].title} selected.`;
  }
  document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => selectProject(button.dataset.project)));
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => filterProjects(button.dataset.filter)));
  picker.addEventListener('change', () => selectProject(picker.value));
  window.addEventListener('hashchange', () => {
    const id = location.hash.slice(1);
    if (!Object.hasOwn(projects, id)) return;
    current = id;
    if (filter !== 'all' && projects[id].group !== filter) filterProjects('all', false);
    selectProject(id, true, false);
  });
  root.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const name = button.dataset.action;
    let focus = `[data-action="${name}"]`;
    switch (name) {
      case 'call-patient': {
        const s = state.hms;
        const next = s.queue.find(p => p.state === 'Waiting' && (s.department === 'All departments' || p.department === s.department));
        if (next) { s.queue.filter(p => p.state === 'In consultation' && p.department === next.department).forEach(p => p.state = 'Completed'); next.state = 'In consultation'; s.message = `${next.token} called for ${next.department.toLowerCase()}.`; }
        focus = '.demo-actions button'; break;
      }
      case 'reset-queue': state.hms.queue = queueSeed(); state.hms.message = 'Sample queue reset.'; focus = '.demo-actions button'; break;
      case 'save-attendance': state.school.message = `Attendance saved: ${state.school.present.filter(Boolean).length} present, ${state.school.present.filter(p => !p).length} absent.`; break;
      case 'add-item': { const id = Number(button.dataset.item); state.billing.cart[id] = (state.billing.cart[id] || 0) + 1; focus += `[data-item="${id}"]`; break; }
      case 'clear-bill': state.billing.cart = {}; focus = '[data-action="add-item"]'; break;
      case 'advance-order': state.food.step = (state.food.step + 1) % 4; break;
      case 'choose-vehicle': state.taxi.vehicle = Number(button.dataset.vehicle); focus += `[data-vehicle="${state.taxi.vehicle}"]`; break;
      case 'book-ride': state.taxi.booked = true; focus = '[data-action="reset-ride"]'; break;
      case 'reset-ride': state.taxi.booked = false; focus = '[data-action="book-ride"]'; break;
      case 'toggle-light': state.home.lights = !state.home.lights; break;
      case 'toggle-plug': state.home.plug = !state.home.plug; break;
      case 'solar-period': state.solar.period = button.dataset.period; focus += `[data-period="${state.solar.period}"]`; break;
      case 'submit-answer': if (state.exam.answer === null) return; state.exam.submitted = true; if (state.exam.answer === questions[state.exam.question].correct) state.exam.score++; focus = '[data-action="next-question"]'; break;
      case 'next-question': if (state.exam.question === questions.length - 1) { state.exam.complete = true; focus = '[data-action="restart-exam"]'; } else { state.exam.question++; state.exam.answer = null; state.exam.submitted = false; focus = 'input[name="exam-answer"]'; } break;
      case 'restart-exam': state.exam = { question: 0, answer: null, submitted: false, score: 0, complete: false }; focus = 'input[name="exam-answer"]'; break;
      default: return;
    }
    renderDemo(focus);
  });
  root.addEventListener('change', event => {
    const input = event.target;
    if (input.dataset.control === 'department') { state.hms.department = input.value; state.hms.message = ''; renderDemo('[data-control="department"]'); }
    if (input.hasAttribute('data-student')) { state.school.present[Number(input.dataset.student)] = input.checked; state.school.message = 'Unsaved attendance changes.'; renderDemo(`[data-student="${input.dataset.student}"]`); }
    if (input.name === 'exam-answer') { state.exam.answer = Number(input.value); root.querySelector('[data-action="submit-answer"]').disabled = false; }
  });
  root.addEventListener('input', event => {
    if (event.target.dataset.control !== 'temperature') return;
    state.home.temperature = Number(event.target.value);
    root.querySelector('#temperature-value').textContent = `${state.home.temperature}°C`;
    event.target.setAttribute('aria-valuetext', `${state.home.temperature} degrees Celsius`);
    root.querySelector('[data-home-status]').textContent = `Target temperature set to ${state.home.temperature}°C.`;
  });
  root.addEventListener('error', event => {
    if (event.target.tagName === 'IMG') { event.target.hidden = true; const caption = event.target.parentElement.querySelector('figcaption'); if (caption) caption.textContent = 'Product illustration unavailable. The controls remain available.'; }
  }, true);

  // Shared site navigation, footer and motion are handled by script.js.
  document.querySelector('[data-year]').textContent = new Date().getFullYear();
  filterProjects('all', false);
})();
