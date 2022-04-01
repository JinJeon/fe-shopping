import items from "../data/items.json";
import recent from "../data/recent.json";
import categories from "../data/categories.json";
import { koreanMatcher } from "./util";
import fs from "fs";
import { async } from "regenerator-runtime";

const getItemsWithValue = (value) => {
  if (value === "") return [];
  const filteredData = items
    .filter(({ keyword }) => koreanMatcher(value).test(keyword))
    .map(({ keyword }) => keyword);
  return filteredData;
};

const searchWithKeyword = async (req, res) => {
  const {
    body: { value },
  } = req;
  res.json(getItemsWithValue(value));
};

const editRecentData = (value) => {
  value ? recent.push({ keyword: value }) : (recent.length = 0);
  fs.writeFile(
    __dirname + "/../data/recent.json",
    JSON.stringify(recent),
    (err) => {
      if (err) return console.log(err);
    }
  );
};

const searchRecent = (req, res) => {
  const { value } = req.body;
  if (value) editRecentData(value);

  const filteredData = recent.map(({ keyword }) => keyword);
  res.json(filteredData);
};

const deleteRecent = () => {
  editRecentData();
};

const sendCategories = (req, res) => {
  res.json(categories);
};

export { searchWithKeyword, searchRecent, sendCategories, deleteRecent };
