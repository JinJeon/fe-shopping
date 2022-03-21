import { selector } from "./util";

class ClickEvent {
  constructor(target, transformer, parentName) {
    this.target = target;
    this.transformer = transformer;
    this.parentName = parentName;
  }

  toggleIcon = ({ classList }) => {
    classList.toggle("fa-chevron-down");
    classList.toggle("fa-chevron-up");
  };

  toggleList = () => {
    this.transformer.classList.toggle("hidden");
  };

  handleCenterMenuClick = () => {
    const centerMenu = this.target.parentNode;
    const menuIcon = selector("i", centerMenu);
    this.toggleIcon(menuIcon);
    this.toggleList();
  };

  changeTargetInnerText = ({ innerText }) => {
    console.log(this.target.children[0]);
    this.target.children[0].innerText = innerText;
  };

  handleClickEvent = ({ target, target: { tagName } }) => {
    const isTarget = target.closest(this.parentName);
    const isListHidden = this.transformer.classList.contains("hidden");
    if (isTarget || !isListHidden) this.handleCenterMenuClick();
    if (tagName === "LI" && isTarget) this.changeTargetInnerText(target);
  };

  init = () => {
    document.addEventListener("click", this.handleClickEvent);
  };
}

export { ClickEvent };