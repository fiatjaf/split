/** @format */

const defaultParties = [
  {id: Math.random(), name: 'Friedrich', due: '50%', paid: '25'},
  {id: Math.random(), name: 'Milton', due: '', paid: '21'},
  {id: Math.random(), name: 'Bettina', due: '12', paid: '12'}
]
const defaultAbsoluteDue = 49.5

export function initializeData() {
  try {
    let lastState = JSON.parse(localStorage.getItem('state'))
    return [lastState.parties, lastState.absoluteDue]
  } catch (e) {
    return [defaultParties, defaultAbsoluteDue]
  }
}

export function saveData(parties, absoluteDue) {
  localStorage.setItem('state', JSON.stringify({parties, absoluteDue}))
}

export function returnToDefaults() {
  localStorage.removeItem('state')
  return initializeData()
}

export function getBlankData() {
  return [[], null]
}

export function isNormalNumber(text) {
  return text.trim().match(/^\d+(.\d+)?$/)
}

export function getPercent(text) {
  let perc = text.match(/^(\d+(.\d)?)%$/)
  if (perc) {
    return parseFloat(perc[1]) * 0.01
  }
  return null
}

export function parseFloatOrNaN(text) {
  let num = parseFloat(text)
  return isNaN(num) ? 0 : num
}

export function toFixedIfNeeded(f) {
  if (typeof f !== 'number') {
    return ''
  }

  if (
    parseInt(f * 100)
      .toString()
      .slice(-2) === '00'
  )
    return f.toFixed(0)
  return f.toFixed(2)
}
