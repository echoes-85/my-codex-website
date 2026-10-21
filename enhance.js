// Small progressive enhancement layer kept separate from the mock catalogue logic.
$('#active-filters').addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="clear-tag"]');
  if (!button) return;
  const tag = button.dataset.tag;
  if (state.brands.includes(tag)) state.brands = state.brands.filter(x => x !== tag);
  if (state.techs.includes(tag)) state.techs = state.techs.filter(x => x !== tag);
  if (state.retailers.includes(tag)) state.retailers = state.retailers.filter(x => x !== tag);
  if (state.features.includes(tag)) state.features = state.features.filter(x => x !== tag);
  if (tag.endsWith('”')) state.sizes = state.sizes.filter(x => `${x}”` !== tag);
  if (tag.startsWith('from £')) state.min = null;
  if (tag.startsWith('up to £')) state.max = null;
  if (tag.startsWith('“')) state.query = '';
  render();
});
