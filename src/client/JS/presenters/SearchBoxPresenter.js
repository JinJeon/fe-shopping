import { ListMark } from "./ListMark";
import { IntervalDelay } from "./IntervalDelay";
import { inputDelayTime } from "../constant";

class SearchBoxPresenter {
  constructor(view) {
    this.view = view;
    this.model = null;
    this.target = view.target;
    this.transformer = view.transformer;
    this.relativeList = view.relativeList;
    this.relativeTitle = view.relativeTitle;
    this.relativeOption = view.relativeOption;
    this.listMark = new ListMark(view);
    this.inputDelay = new IntervalDelay(inputDelayTime);
  }

  setModel = (model) => {
    this.model = model;
  };

  getNextListIndex = (key, childLists, selectedListIndex) => {
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

  findSelectedInChildren = () => {
    const childLists = [...this.relativeList.children];
    const selectedListIndex = childLists.findIndex((list) =>
      list.classList.contains("selected")
    );
    return { childLists, selectedListIndex };
  };

  moveWithUpDown = (key) => {
    const { childLists, selectedListIndex } = this.findSelectedInChildren();
    const nextListIndex = this.getNextListIndex(
      key,
      childLists,
      selectedListIndex
    );
    const nextSelectedChild = childLists[nextListIndex];
    const selectedKeyword = nextSelectedChild.innerText;
    this.view.changeOptionSelected(nextSelectedChild, "add");
    this.view.changeSearchKeyword(selectedKeyword);
  };

  getListFormFromData = (data) => {
    return data.reduce((pre, post) => pre + `<li>${post}</li>`, "");
  };

  addHighlight = (value) => {
    return "<span class='highlight'>" + value + "</span>";
  };

  getHighLightList = (list, value) => {
    const regex = new RegExp(value, "g");
    return list.replace(regex, this.addHighlight(value));
  };

  changeRelativeList = (data, value) => {
    let innerList = this.getListFormFromData(data);
    if (value) innerList = this.getHighLightList(innerList, value);
    this.view.changeRelativeListContent(innerList);
  };

  showRecentList = async () => {
    const address = "recent";
    await this.model.findData(address);
    const data = this.model.getData();
    this.changeRelativeList(data);
    this.view.drawRecentListForm();
  };

  showRelativeList = async (value) => {
    const address = "keyword";
    await this.model.findData(address, value);
    const data = this.model.getData();
    const isData = data.length;

    this.changeRelativeList(data, value);
    this.view.changeOptionHidden(this.transformer, isData ? "remove" : "add");
    this.view.drawRelativeListForm();
  };

  showDataByInput = async (value) => {
    await this.inputDelay.waitDelay();
    const isValueEmpty = value === "";
    isValueEmpty
      ? await this.showRecentList()
      : await this.showRelativeList(value);
  };

  handleKeyupEvent = ({ target: { value }, key }) => {
    const isUpDown = ["ArrowDown", "ArrowUp"].includes(key);
    isUpDown ? this.moveWithUpDown(key) : this.showDataByInput(value);
  };

  toggleTransformerHidden = () => {
    this.view.changeOptionHidden(this.transformer, "toggle");
  };
}

export default SearchBoxPresenter;