function leftNavFilterToggle($sideNavItem) {
  const classesArr = Array.from($sideNavItem.classList);
  const parentContainer = $sideNavItem.parentElement;
  const itemClass = classesArr.find((cls) => cls.endsWith('__item'));
  if (!itemClass) return false;
  parentContainer.classList.toggle(`${parentContainer.classList[0]}--active`);
}

document.addEventListener('DOMContentLoaded', () => {
  const playersContainer = document.querySelector('.amnfr .players-container');

  playersContainer.addEventListener('click', (event) => {
    event.preventDefault();
    const eventClicked = event.target;
    //scroll
    const scrollElt = eventClicked.closest('.scroll__item');
    if (scrollElt) {
      leftNavFilterToggle(scrollElt);
    }
  });
});
