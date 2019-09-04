<script>
  import {afterUpdate, onMount} from 'svelte'
  import {
    saveData,
    initializeData,
    returnToDefaults,
    getBlankData,
    isNormalNumber,
    getPercent,
    parseFloatOrNaN,
    toFixedIfNeeded
  } from './helpers'

  let [parties, absoluteDue] = initializeData()

  var due, paid, remaining, assigned

  $: due = calcDue(absoluteDue, parties)
  $: paid = calcPaid(parties)
  $: remaining = calcRemaining(absoluteDue, paid, parties)
  $: assigned = parties.reduce((acc, p) => acc + (partyDueSpecified(p, absoluteDue) || 0), 0)

  afterUpdate(() => {
    // remove all blank parties
    // add a new blank party at the end
    parties = parties
      .filter(
        p =>
          p.name.trim().length > 0 ||
          p.due.trim().length > 0 ||
          p.paid.trim().length > 0
      )
      .concat({id: Math.random(), name: '', due: '', paid: ''})

    // save data to localStorage
    saveData(parties, absoluteDue)
  })

  function clearAll(e) {
    e.preventDefault()
    let [p, d] = getBlankData()
    parties = p
    absoluteDue = d
  }

  function defaultAll(e) {
    e.preventDefault()
    let [p, d] = returnToDefaults()
    parties = p
    absoluteDue = d
  }

  function setParty(party, prop) {
    return e => {
      party[prop] = e.target.value
      parties = parties
    }
  }

  function setAbsoluteDue(e) {
    let parsed = parseFloat(e.target.value)
    absoluteDue = isNaN(parsed) ? null : parsed
  }

  function calcPaid(parties) {
    return parties.reduce((acc, p) => acc + parseFloatOrNaN(p.paid), 0)
  }

  function calcDue(absoluteDue, parties) {
    return (
      absoluteDue || parties.reduce((acc, p) => acc + parseFloatOrNaN(p.due), 0)
    )
  }

  function calcRemaining(absoluteDue, paid, parties) {
    return calcDue(absoluteDue, parties) - paid
  }

  function partyDueSpecified(party, absoluteDue) {
    // absolute value, then it's it
    if (isNormalNumber(party.due)) return parseFloat(party.due)

    // percent value: calculate with absoluteDue
    let percent = getPercent(party.due)
    if (absoluteDue && percent) {
      return percent * absoluteDue
    }
  }

  function partyDueEstimated(party, parties, absoluteDue) {
    // take the absolute quantity, subtract what was declared absolutely to be [due] by each peer
    // then divide the rest equally among all parties who have not declared any [due]
    if (party.name.trim() !== '' || party.paid.trim() !== '') {
      // only perform this estimation it for peers with names or paid values (that denote they exist)
      if (absoluteDue && party.due.trim() === '') {
        let whatIsDecided = parties.reduce((acc, p) => {
          if (isNormalNumber(p.due)) {
            return acc + parseFloat(p.due)
          }

          let percent = getPercent(p.due)
          if (percent) {
            return acc + percent * absoluteDue
          }

          return acc + 0
        }, 0)
        let whatIsLeftToDecide = absoluteDue - whatIsDecided
        let nblankParties = parties.filter(
          p =>
            (p.name.trim() !== '' || p.paid.trim() !== '') &&
            p.due.trim() === ''
        ).length

        return whatIsLeftToDecide / nblankParties
      }
    }
  }

  function partyDue(party, parties, absoluteDue) {
    // if nothing (or something invalid) was written this will be null
    let specifiedValue = partyDueSpecified(party, absoluteDue)
    if (specifiedValue) {
      return specifiedValue
    }

    // blank: estimate due
    let estimatedValue = partyDueEstimated(party, parties, absoluteDue)
    if (estimatedValue) {
      return estimatedValue
    }

    // otherwise nothing
    return
  }

  function balanceColor(balance) {
    if (balance > 0) return 'green'
    else if (balance < 0) return 'red'
    else return ''
  }
</script>

<style>
  table {
    border-collapse: collapse;
  }
  table,
  th,
  td {
    border: 1px solid #aaa;
  }
  thead th {
    padding: 8px 18px;
  }
  th {
    text-align: center;
  }
  td.editable input {
    text-align: right;
    font-family: monospace;
    font-size: 1.5em;
  }
  input {
    border: 0;
    background: transparent;
  }
  tbody input {
    padding: 16px 10px;
    width: 200px;
    float: right;
  }
  tbody td.editable {
    position: relative;
  }
  tbody td.editable .preview {
    position: absolute;
    left: 10px;
    top: 16px;
    color: #999;
  }
  tfoot td.editable label {
    padding: 16px 0 16px 10px;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
  }
  tfoot input {
    padding: 16px 10px 16px 0;
    display: inline;
    width: 120px;
  }
</style>

<table>
  <thead>
    <tr>
      <th>person</th>
      <th>due ({toFixedIfNeeded(assigned)})</th>
      <th>paid ({toFixedIfNeeded(paid)})</th>
    </tr>
  </thead>
  <tbody>
    {#each parties as p (p.id)}
      <tr>
        <td>
          <input bind:value={p.name} />
        </td>
        <td class="editable">
          <span class="preview">
            {toFixedIfNeeded(partyDue(p, parties, absoluteDue))}
          </span>
          <input value={p.due} on:input={setParty(p, 'due')} />
        </td>
        <td class="editable">
          {#if p.name.trim() !== '' || p.paid.trim() !== ''}
            <span
              class="preview"
              style="color: {balanceColor(parseFloatOrNaN(p.paid) - partyDue(p, parties, absoluteDue))}">
              {toFixedIfNeeded(Math.abs(parseFloatOrNaN(p.paid) - partyDue(p, parties, absoluteDue)))}
            </span>
          {/if}
          <input value={p.paid} on:input={setParty(p, 'paid')} />
        </td>
      </tr>
    {/each}
  </tbody>
  <tfoot>
    <tr>
      <th>
        <div>
          <button on:click={clearAll}>clear all</button>
        </div>
        <div>
          <button on:click={defaultAll}>return to defaults</button>
        </div>
      </th>
      <td class="editable">
        <label>
          bill total:
          <input on:input={setAbsoluteDue} value={toFixedIfNeeded(due)} />
        </label>
      </td>
      <td class="editable">
        <label>
          {#if remaining > 0}remaining{:else}outstanding{/if}
          :
          <input
            disabled
            value={toFixedIfNeeded(Math.abs(remaining))}
            style="color: {balanceColor(-remaining)}" />
        </label>
      </td>
    </tr>
  </tfoot>
</table>
