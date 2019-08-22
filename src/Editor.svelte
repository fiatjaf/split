<script>
  let parties = [
    {name: 'J', due: '23', paid: '15'},
    {name: 'P', due: '10', paid: '12'}
  ]
</script>

<style>
  table { border-collapse: collapse; }
  table, th, td { border: 1px solid #AAA; }
  thead th { padding: 8px 18px; }
  th { text-align: center; }
  td.due input,
  td.paid input {
    text-align: right;
    font-family: monospace;
    font-size: 1.5em;
  }
  input {
    padding: 8px 18px;
    border: 0;
  }
</style>

<table>
  <thead>
    <tr>
      <th>person</th>
      <th>should pay</th>
      <th>paid</th>
    </tr>
  </thead>
  <tbody>
    {#each parties as p (p.name)}
      <tr>
        <td><input bind:value={p.name}></td>
        <td class="due"><input bind:value={p.due}></td>
        <td class="paid"><input bind:value={p.paid}></td>
      </tr>
    {/each}
  </tbody>
  <tfoot>
    <tr>
      <th>total</th>
      <td class="due"><input value={parties.reduce((acc, p) => parseFloat(p.due) + acc, 0).toFixed(2)}></td>
      <td class="paid"><input value={parties.reduce((acc, p) => parseFloat(p.paid) + acc, 0).toFixed(2)}></td>
    </tr>
  </tfoot>
</table>
