import { delay, selector, intervalDelay } from "./util";
import { inputDelayTime } from "./constant";
import { async } from "regenerator-runtime";

const inputDelay = new intervalDelay(inputDelayTime);

class KeyupEvent {
  constructor(target, transformer) {
    this.target = target;
    this.transformer = transformer;
    this.relativeList = selector("ul", transformer);
    this.relativeTitle = selector("h3", transformer);
    this.relativeOption = selector("div", transformer);
  }

  findRefinedData = async (address, value = "") => {
    const dataAddress = `data/${address}`;
    const data = await fetch(dataAddress, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ value }),
    });
    const refinedData = await data.json();
    return refinedData;
  };

  drawRelativeListForm = () => {
    if (this.relativeTitle) {
      this.relativeTitle.remove();
      this.relativeOption.remove();
    }
  };

  drawListFromData = (data) => {
    return data.reduce((pre, post) => pre + `<li>${post}</li>`, "");
  };

  addHighlight = (value) => {
    return "<span class='highlight'>" + value + "</span>";
  };

  highlightValueInList = (innerList, value) => {
    const regex = new RegExp(value, "g");
    return innerList.replace(regex, this.addHighlight(value));
  };

  changeRelativeList = (refinedData, value) => {
    let innerList = this.drawListFromData(refinedData);
    if (value) innerList = this.highlightValueInList(innerList, value);
    this.relativeList.innerHTML = innerList;
  };

  showRelativeList = async (value) => {
    const address = "keyword";
    const refinedData = await this.findRefinedData(address, value);
    const isRefinedData = refinedData.length;

    this.transformer.classList[isRefinedData ? "remove" : "add"]("hidden");
    this.changeRelativeList(refinedData, value);
    this.drawRelativeListForm();
  };

  drawRecentListForm = () => {
    this.transformer.classList.remove("hidden");
    this.transformer.append(
      this.relativeTitle,
      this.relativeList,
      this.relativeOption
    );
  };

  showRecentList = async () => {
    const address = "recent";
    const refinedData = await this.findRefinedData(address);

    this.changeRelativeList(refinedData);
    this.drawRecentListForm();
  };

  findNextListIndex = (key, childLists, selectedListIndex) => {
    const isSelectedListIndex = selectedListIndex > -1;
    const keyIndex = {
      ArrowDown: {
        noTarget: 0,
        isTarget: selectedListIndex + 1,
      },
      ArrowUp: {
        noTarget: childLists.length - 1,
        isTarget: selectedListIndex - 1,
      },
    };
    const { noTarget, isTarget } = keyIndex[key];
    let nextListIndex;

    if (!isSelectedListIndex) {
      nextListIndex = noTarget;
    } else {
      nextListIndex = childLists[isTarget] ? isTarget : noTarget;
      childLists[selectedListIndex].classList.remove("selected");
    }

    return nextListIndex;
  };

  changeSearchKeyword = (selectedKeyword) => {
    this.target.value = selectedKeyword;
  };

  findSelectedInChildren = () => {
    const childLists = [...this.relativeList.children];
    const selectedListIndex = childLists.findIndex((list) =>
      list.classList.contains("selected")
    );
    const selectedList = childLists[selectedListIndex];
    return { childLists, selectedListIndex, selectedList };
  };

  moveWithUpDown = (key) => {
    const { childLists, selectedListIndex } = this.findSelectedInChildren();
    const nextListIndex = this.findNextListIndex(
      key,
      childLists,
      selectedListIndex
    );

    childLists[nextListIndex].classList.add("selected");
    const selectedKeyword = childLists[nextListIndex].innerText;
    this.changeSearchKeyword(selectedKeyword);
  };

  showDataByInput = async (value) => {
    await inputDelay.waitDelay();
    const isValueEmpty = value === "";
    isValueEmpty
      ? await this.showRecentList()
      : await this.showRelativeList(value);
  };

  handleKeyupEvent = async ({ target: { value }, key }) => {
    const isUpDown = ["ArrowDown", "ArrowUp"].includes(key);
    isUpDown ? this.moveWithUpDown(key) : this.showDataByInput(value);
  };

  init = () => {
    this.target.addEventListener("keyup", this.handleKeyupEvent);
  };
}

export { KeyupEvent };
