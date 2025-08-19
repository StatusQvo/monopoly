export function leftNavFilterToggle($sideNavItem) {
  const classesArr = Array.from($sideNavItem.classList);
  const parentContainer = $sideNavItem.parentElement;
  const itemClass = classesArr.find((cls) => cls.endsWith('__item'));
  if (!itemClass) return false;
  parentContainer.classList.toggle(`${parentContainer.classList[0]}--active`);
}
