const $ = (s) => document.querySelector(s)
const $$ = (s) => Array.from(document.querySelectorAll(s))

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js'))
}

const pages = {
  home: $('#page-home'),
  questions: $('#page-questions'),
  about: $('#page-about'),
}

function setActiveLink() {
  const hash = location.hash || '#/'
  $$('.nav-link').forEach(a => a.classList.remove('bg-white/10'))
  const link = document.querySelector(`a[href="${hash}"]`)
  if (link) link.classList.add('bg-white/10')
}

function route() {
  const p = location.hash.replace('#/', '') || ''
  Object.values(pages).forEach(el => el.classList.add('hidden'))
  if (p === 'questions') pages.questions.classList.remove('hidden')
  else if (p === 'about') pages.about.classList.remove('hidden')
  else pages.home.classList.remove('hidden')
  setActiveLink()
}
window.addEventListener('hashchange', route)
route()

$('#year').textContent = new Date().getFullYear()

let questions = [
  { question: 'What is the SI unit of Force?', options: ['Pascal','Watt','Joule','Newton'], answer: 3, hint: 'It is named after Sir Isaac Newton.', explanation: 'Force is measured in Newton (N). Joule is energy; Pascal is pressure; Watt is power.' },
  { question: 'Which law relates voltage, current and resistance?', options: ['Boyle’s law','Ohm’s law','Hooke’s law','Kepler’s law'], answer: 1, hint: 'V = I R', explanation: 'Ohm’s law states V is directly proportional to I for a conductor at constant temperature (V = IR).' },
  { question: 'Which lens corrects hypermetropia (farsightedness)?', options: ['Concave','Convex','Cylindrical','None'], answer: 1, hint: 'It converges rays.', explanation: 'A convex (converging) lens helps a farsighted eye focus light on the retina.' },
  { question: 'Instrument used to measure electric current:', options: ['Voltmeter','Ammeter','Galvanometer','Ohmmeter'], answer: 1, hint: 'Unit is ampere.', explanation: 'Ammeter measures current; voltmeter measures voltage; ohmmeter measures resistance.' },
  { question: 'Speed with specific direction is called:', options: ['Velocity','Acceleration','Displacement','Momentum'], answer: 0, hint: 'Vector form of speed.', explanation: 'Velocity is speed with direction; acceleration is rate of change of velocity.' },
  { question: 'pH of neutral solution at 25°C:', options: ['0','3','7','14'], answer: 2, hint: 'Middle of the pH scale.', explanation: 'Pure water is neutral at pH 7 at 25°C.' },
  { question: 'Chemical formula of limestone:', options: ['CaCO3','CaO','Ca(OH)2','CaCl2'], answer: 0, hint: 'Contains carbonate ion.', explanation: 'Limestone is calcium carbonate (CaCO3).' },
  { question: 'Element with atomic number 6:', options: ['Nitrogen','Carbon','Oxygen','Calcium'], answer: 1, hint: 'Basis of organic life.', explanation: 'Carbon has Z = 6.' },
  { question: 'Plants prepare food by:', options: ['Respiration','Transpiration','Photosynthesis','Germination'], answer: 2, hint: 'Requires sunlight and chlorophyll.', explanation: 'Photosynthesis converts CO2 and water to glucose and oxygen using sunlight.' },
  { question: 'Cell was discovered by:', options: ['Robert Hooke','Antony van Leeuwenhoek','Robert Brown','Schleiden'], answer: 0, hint: 'Observed cork cells.', explanation: 'Robert Hooke coined the term “cell” in 1665 when viewing cork.' },
  { question: 'Discoverer of human blood groups:', options: ['Edward Jenner','Karl Landsteiner','Louis Pasteur','Watson & Crick'], answer: 1, hint: 'ABO system.', explanation: 'Karl Landsteiner discovered the ABO blood group system.' },
  { question: 'Gas released during human respiration:', options: ['Oxygen','Carbon dioxide','Nitrogen','Hydrogen'], answer: 1, hint: 'We exhale it.', explanation: 'Cells produce CO2 during respiration, which is exhaled.' },
  { question: 'Rear-view mirrors in vehicles use:', options: ['Plane mirror','Concave mirror','Convex mirror','Parabolic mirror'], answer: 2, hint: 'Wider field of view.', explanation: 'Convex mirrors give a wider field and form diminished images.' },
  { question: 'A renewable energy source is:', options: ['Coal','Petroleum','Natural gas','Solar energy'], answer: 3, hint: 'From the Sun.', explanation: 'Solar energy is renewable; the others are fossil fuels.' },
  { question: 'Rusting of iron is:', options: ['Physical change','Chemical change','Both','None'], answer: 1, hint: 'New substance forms.', explanation: 'Rusting forms iron oxide, a chemical change.' },
  { question: 'Total resistance of series resistors is the:', options: ['Smallest value','Equal to each','Sum of all','Product of all'], answer: 2, hint: 'Add them.', explanation: 'In series, R_total = R1 + R2 + ...' },
  { question: 'Powerhouse of the cell:', options: ['Chloroplast','Mitochondria','Ribosome','Nucleus'], answer: 1, hint: 'ATP production.', explanation: 'Mitochondria generate ATP via respiration.' },
  { question: 'Atmospheric pressure is measured by:', options: ['Thermometer','Barometer','Hygrometer','Altimeter'], answer: 1, hint: 'Mercury column instrument.', explanation: 'Barometer measures atmospheric pressure.' },
  { question: 'Metal liquid at room temperature:', options: ['Sodium','Mercury','Aluminium','Zinc'], answer: 1, hint: 'Used in thermometers.', explanation: 'Mercury (Hg) is liquid at room temperature.' },
  { question: 'Vitamin synthesized in skin with sunlight:', options: ['Vitamin A','Vitamin B12','Vitamin C','Vitamin D'], answer: 3, hint: 'Sunshine vitamin.', explanation: 'UV light helps skin synthesize Vitamin D.' }
]

let current = 0
let answers = new Map()
let revealed = new Map()

const quizCard = $('#quizCard')
const progressText = $('#progressText')
const nextBtn = $('#nextBtn')
const resultBlock = $('#resultBlock')
const scoreText = $('#scoreText')
const genCertBtn = $('#genCertBtn')
const downloadCert = $('#downloadCert')

function updateProgress() {
  const progressBar = $('#progressBar')
  if (!progressBar) return
  const pct = Math.max(0, Math.min(100, Math.round(((current) / (questions.length)) * 100)))
  progressBar.style.width = pct + '%'
}

function renderQuestion() {
  if (!questions.length) {
    quizCard.innerHTML = '<div class="text-white/70">No questions loaded. Paste JSON and click Load Questions.</div>'
    progressText.textContent = '0/0'
    nextBtn.disabled = true
    return
  }
  const q = questions[current]
  progressText.textContent = `${current + 1}/${questions.length}`
  nextBtn.textContent = current === questions.length - 1 ? 'Finish' : 'Next'
  const selected = answers.get(current)
  const isRevealed = !!revealed.get(current)
  const letters = ['A','B','C','D','E','F']
  quizCard.innerHTML = `
    <div class="space-y-4">
      <div class="font-semibold text-lg">${current + 1}. ${q.question}</div>
      <div class="grid gap-3">
        ${q.options.map((opt,i)=>{
          const isCorrect = i === q.answer
          const chosen = selected===i
          const state = isRevealed ? (isCorrect ? 'correct' : (chosen ? 'wrong' : 'neutral')) : 'neutral'
          const border = state==='correct' ? 'border-emerald-400' : state==='wrong' ? 'border-rose-400' : (chosen?'border-fuchsia-400':'border-white/10')
          const bg = state==='correct' ? 'bg-emerald-500/10' : state==='wrong' ? 'bg-rose-500/10' : (chosen?'bg-fuchsia-500/10':'bg-white/5')
          return `
          <label class="flex items-center gap-3 p-3 rounded-lg border ${border} ${bg}">
            <input type="radio" name="opt" value="${i}" ${chosen?'checked':''} class="accent-fuchsia-500">
            <span class="w-6 h-6 grid place-items-center rounded-md bg-white/10 text-xs">${letters[i]||''}</span>
            <span>${opt}</span>
          </label>`
        }).join('')}
      </div>
      ${isRevealed ? `
        <div class="mt-2 p-3 rounded-lg border ${selected===q.answer?'border-emerald-400 bg-emerald-500/10':'border-rose-400 bg-rose-500/10'} text-sm">
          ${selected===q.answer ? '<div class="font-semibold text-emerald-300">Right answer</div>' : '<div class="font-semibold text-rose-300">Not quite</div>'}
          <div class="text-white/80">${q.explanation || ''}</div>
        </div>` : ''}
    </div>`
  $$("input[name='opt']").forEach(r => r.addEventListener('change', e => { 
    answers.set(current, Number(e.target.value))
    revealed.set(current, true)
    renderQuestion()
  }))
  nextBtn.disabled = typeof selected === 'undefined'
  updateProgress()
}
renderQuestion()

nextBtn.addEventListener('click', ()=>{
  if (current < questions.length - 1) { current++; renderQuestion(); return }
  finishQuiz()
})

function finishQuiz() {
  let correct = 0
  questions.forEach((q,idx)=>{ if (answers.get(idx) === q.answer) correct++ })
  const percent = Math.round((correct / questions.length) * 100)
  scoreText.textContent = `Score: ${correct}/${questions.length} (${percent}%)`
  resultBlock.classList.remove('hidden')
  genCertBtn.dataset.pass = percent >= 50 ? '1':'0'
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
}

$('#importBtn').addEventListener('click', ()=>{
  const txt = $('#importArea').value.trim()
  if (!txt) return
  try {
    const json = JSON.parse(txt)
    if (!Array.isArray(json) || !json.length) throw new Error('Invalid format')
    if (!json[0].question || !json[0].options || typeof json[0].answer === 'undefined') throw new Error('Missing fields')
    questions = json
    current = 0
    answers = new Map()
    renderQuestion()
  } catch(e) { alert('Invalid JSON format') }
})

async function generateCertificate(name, dept, year, percent, passed) {
  const canvas = $('#certCanvas')
  const w = 1400, h = 1000
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')
  // Background
  const g = ctx.createLinearGradient(0,0,w,h)
  g.addColorStop(0,'#0b0b13'); g.addColorStop(1,'#130a1f')
  ctx.fillStyle = g; ctx.fillRect(0,0,w,h)
  // Border
  const g2 = ctx.createLinearGradient(0,0,w,0)
  g2.addColorStop(0,'#ff00e5'); g2.addColorStop(.5,'#7c3aed'); g2.addColorStop(1,'#00e5ff')
  ctx.strokeStyle = g2; ctx.lineWidth = 12; ctx.strokeRect(50,50,w-100,h-100)
  // Brand seal
  ctx.fillStyle = '#7c3aed'; ctx.beginPath(); ctx.arc(140,140,54,0,Math.PI*2); ctx.fill()
  ctx.fillStyle = '#fff'; ctx.font = '36px Orbitron, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('SC',140,150)
  // Title
  ctx.fillStyle = '#ffffff'; ctx.font = '64px Orbitron, sans-serif'; ctx.fillText('SCIFY Certificate', w/2, 200)
  // Subtitle
  ctx.font = '28px Inter, sans-serif'; ctx.fillStyle = '#c4b5fd'; ctx.fillText('of Achievement', w/2, 245)
  // Body
  ctx.font = '34px Inter, sans-serif'; ctx.fillStyle = '#a5b4fc'; ctx.fillText('This is to certify that', w/2, 320)
  ctx.font = '72px Orbitron, sans-serif'; ctx.fillStyle = '#ffffff'; ctx.fillText(name, w/2, 400)
  ctx.font = '28px Inter, sans-serif'; ctx.fillStyle = '#cbd5e1';
  ctx.fillText(`Department: ${dept}   •   Year: ${year}`, w/2, 450)
  ctx.font = '30px Inter, sans-serif'; ctx.fillStyle = passed ? '#a3ff00' : '#ff7676'
  ctx.fillText(`${passed ? 'PASSED' : 'FAILED'} • Score ${percent}%`, w/2, 500)
  ctx.font = '24px Inter, sans-serif'; ctx.fillStyle = '#94a3b8'
  ctx.fillText('Thank you for participating in the SCIFY Tamil Nadu Science Quiz.', w/2, 540)
  // Footer details
  const d = new Date().toLocaleDateString()
  ctx.fillStyle = '#94a3b8'; ctx.font = '22px Inter, sans-serif'; ctx.fillText(`Issued on ${d}`, w/2, 590)
  // Signature area
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w-420, h-220); ctx.lineTo(w-180, h-220); ctx.stroke()
  ctx.font = '28px Inter, sans-serif'; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
  ctx.fillText('Saran Raj G', w-300, h-185)
  ctx.font = '18px Inter, sans-serif'; ctx.fillStyle = '#cbd5e1'; ctx.fillText('Founder, SCIFY', w-300, h-160)
  const url = canvas.toDataURL('image/png')
  downloadCert.href = url
  downloadCert.download = `certificate_${name.replace(/\s+/g,'_')}.png`
  downloadCert.classList.remove('hidden')
}

genCertBtn.addEventListener('click', async ()=>{
  const name = $('#userName').value.trim()
  const dept = $('#userDept').value.trim()
  const year = $('#userYear').value.trim()
  if (!name || !dept || !year) { alert('Please enter your Name, Department, and Year of Study'); return }
  const correct = questions.reduce((acc,q,idx)=> acc + (answers.get(idx)===q.answer?1:0), 0)
  const percent = Math.round((correct / questions.length) * 100)
  const pass = percent >= 50
  await generateCertificate(name, dept, year, percent, pass)
})
