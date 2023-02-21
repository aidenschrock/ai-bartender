import { useState } from "react";

export type AlcoholInventory =
  | "Vodka"
  | "Tequila"
  | "Rum"
  | "Non-alcoholic"
  | "Milk"
  | "Orange Juice"
  | "Pineapple Juice"
  | "Sprite";

interface AlcoholProps {
  alcohol: AlcoholInventory;
  setAlcohol: (alcohol: AlcoholInventory) => void;
}
let alcohol: AlcoholInventory[] = [
  "Vodka",
  "Tequila",
  "Rum",
  "Non-alcoholic",
  "Milk",
  "Orange Juice",
  "Pineapple Juice",
  "Sprite",
];

let promptIngredients: string[] = [];

export default function ChipSelect(handleInventory: any) {
  const userSelect = (e: any) => {
    let containBoolean = e.target.classList.contains("activeChip");
    if (containBoolean) {
      e.target.classList.remove("activeChip");
      let index = promptIngredients.indexOf(e.target.innerText);
      promptIngredients.splice(index, 1);
    } else {
      e.target.classList.add("activeChip");
      promptIngredients.push(e.target.innerText);
    }
    console.log("here");
    handleInventory(promptIngredients);
  };

  return (
    <div className="flex flex-row flex-wrap py-3 gap-x-2">
      {alcohol.map((alcoholItem, index) => (
        <div
          key={index}
          onClick={(e) => userSelect(e)}
          className="transition-all hover:border-blue-500 hover:cursor-pointer rounded-full mt-1 py-2 px-6 w-max border border-gray-300"
        >
          {alcoholItem}
        </div>
      ))}
    </div>
  );
}
