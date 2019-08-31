<script>
  import Editor from './Editor.svelte'
</script>

<style>
  #editor {
    margin: 30px 50px;
  }

  header {
    display: flex;
    align-items: center;
    color: indianred;
  }
  header h1, header h2 { margin-top: 0; }
  header h2 { margin-left: 20px; }

  h4 { color: indianred; }
</style>

<div id="editor">
  <header><h1>SSB</h1> <h2>Simple Split Bills</h2></header>

  <Editor />

  <h4>
    Split your bar bills with friends easily with custom amounts and custom
    percentages
  </h4>
</div>
