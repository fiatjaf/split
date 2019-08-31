/** @format */

const defaultParties = [
  {id: Math.random(), name: 'Friedrich', due: '', paid: '20'},
  {id: Math.random(), name: 'Milton', due: '', paid: '21'},
  {id: Math.random(), name: 'Bettina', due: '12', paid: '12'}
]
const defaultAbsoluteDue = 52.5

export function initializeData() {
  let lastState = localStorage.getItem('state')
  if (lastState) {
    return [lastState.parties, lastState.absoluteDue]
  }

  return [defaultParties, defaultAbsoluteDue]
}

export function saveData(parties, absoluteDue) {
  localStorage.setItem('state', JSON.stringify({parties, absoluteDue}))
}
