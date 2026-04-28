const key = "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";
fetch(`https://api.groq.com/openai/v1/models`, {
  headers: {
    'Authorization': `Bearer ${key}`
  }
})
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data.data.map(m => m.id), null, 2)))
  .catch(err => console.error(err));
