export function workWithListSelectors(playerName, tdRows) {
  tdRows.forEach((player) => {
    const playersSelector = player.querySelector(
      'td[name="player-selector"] select.custom-select'
    );
    if (!playersSelector) return;
    const options = playersSelector.children;
    let optionLength = options.length;
    const newOption = document.createElement('option');
    newOption.id = optionLength;
    newOption.textContent = playerName;
    playersSelector.appendChild(newOption);
  });
}
