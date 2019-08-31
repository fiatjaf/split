<script>
  import { afterUpdate } from 'svelte'

  let absoluteDue = null;
  var parties = [
    { id: Math.random(), name: "J", due: "23", paid: "15" },
    { id: Math.random(), name: "P", due: "10", paid: "12" }
  ];
  let due = calcDue(absoluteDue, parties);
  let paid = calcPaid(parties);
  let remaining = calcRemaining(absoluteDue, paid, parties)

  $: due = calcDue(absoluteDue, parties);
  $: paid = calcPaid(parties);
  $: remaining = calcRemaining(absoluteDue, paid, parties)

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
      .concat({ id: Math.random(), name: "", due: "", paid: "" });
  })

  function setParty(party, prop) {
    return e => {
      party[prop] = e.target.value;
      parties = parties;
    };
  }

  function setAbsoluteDue(e) {
    let parsed = parseFloat(e.target.value)
    absoluteDue = isNaN(parsed) ? null : parsed;
  }

  function calcPaid(parties) {
    return parties.reduce((acc, p) => acc + parseFloatOrNaN(p.paid), 0)
  }

  function calcDue(absoluteDue, parties) {
    return absoluteDue || parties.reduce((acc, p) => acc + parseFloatOrNaN(p.due), 0)
  }

  function calcRemaining (absoluteDue, paid, parties) {
    return calcDue(absoluteDue, parties) - paid
  }

  function infoPartyDue (party, parties) {
    // absolute value, then it's it
    if (isNormalNumber(party.due)) return parseFloat(party.due)

    // percent value: calculate with absoluteDue
    let percent = getPercent(party.due)
    if (absoluteDue && percent) {
      return toFixedIfNeeded(percent * absoluteDue);
    }

    // blank: estimate what is left divided equally
    if (absoluteDue && party.due.trim() === '') {
      let whatIsDecided = parties.reduce((acc, p) => {
        if (isNormalNumber(p.due)) {
          return acc + parseFloat(p.due)
        }

        let percent = getPercent(p.due)
        if (percent) {
          return acc + (percent * absoluteDue)
        }

        return acc + 0
      }, 0)
      let whatIsLeftToDecide = absoluteDue - whatIsDecided
      let nblankParties = parties.filter(p => p.due.trim() === '').length

      return toFixedIfNeeded(whatIsLeftToDecide / nblankParties)
    }

    // otherwise nothing is shown
    return ''
  }

  function infoPartyBalanceColor (party) {
    let balance = party.paid - party.due
    if (balance > 0) return 'green'
    else if (balance < 0) return 'red'
    else return ''
  }

  function isNormalNumber (text) { return text.trim().match(/^\d+(.\d+)?$/) }

  function getPercent (text) {
    let perc = text.match(/^(\d+(.\d)?)%$/)
    if (perc) {
      return parseFloat(perc[1]) * 0.01
    }
    return null
  }

  function parseFloatOrNaN (text) {
    let num = parseFloat(text)
    return isNaN(num) ? 0 : num
  }

  function toFixedIfNeeded (float) {
    if (parseInt(float * 100).toString().slice(-2) === '00') return float.toFixed(0)
    return float.toFixed(2)
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
  }
  tbody input {
    padding: 16px 10px;
    width: 200px;
    float: right;
  }
  tbody td.editable { position: relative; }
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
      <th>should pay</th>
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
          <span class="preview">{infoPartyDue(p, parties)}</span>
          <input value={p.due} on:input={setParty(p, 'due')} />
        </td>
        <td class="editable">
          <span class="preview" style="color: {infoPartyBalanceColor(p)}">{toFixedIfNeeded(p.paid - p.due)}</span>
          <input value={p.paid} on:input={setParty(p, 'paid')} />
        </td>
      </tr>
    {/each}
  </tbody>
  <tfoot>
    <tr>
      <th />
      <td class="editable">
        <label>
          bill total:
          <input on:input={setAbsoluteDue} value={toFixedIfNeeded(due)} />
        </label>
      </td>
      <td class="editable">
        <label>
          {#if remaining > 0}remaining{:else}outstanding{/if}:
          <input value={toFixedIfNeeded(Math.abs(remaining))} />
        </label>
      </td>
    </tr>
  </tfoot>
</table>
