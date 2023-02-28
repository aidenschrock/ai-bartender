import { AnimatePresence, motion } from "framer-motion";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import Footer from "../components/Footer";
import LoadingDots from "../components/LoadingDots";
import ResizablePanel from "../components/ResizablePanel";
import InventorySelect from "../components/InventorySelect";

interface RecipeResponse {
  name: string;
  ingredients: { name: string; amount: string }[];
  instructions: string;
}

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);

  const [generatedRecipes, setGeneratedRecipes] =
    useState<RecipeResponse | null>();

  const [alcoholInventory, setAlcoholInventory] = useState<string[]>([]);
  const [mixerInventory, setMixerInventory] = useState<string[]>([]);

  function handleAlcoholInventory(inventory: string[]) {
    setAlcoholInventory(inventory);
    console.log(alcoholInventory);
  }
  function handleMixerInventory(inventory: string[]) {
    setMixerInventory(inventory);
    console.log(mixerInventory);
  }

  const prompt = `Generate one cocktail recipe with only the following ingredients: ${alcoholInventory} ${mixerInventory}. The ingredients should also contain amounts. Format it into a json file. The key for the name of the recipe should be "name". The key for the ingredients should be "ingredients". The key for the instructions should be "instructions". The keys within "ingredients" should be "name" and "amount".`;

  const generateRecipes = async (e: any) => {
    e.preventDefault();
    setGeneratedRecipes(null);
    setLoading(true);
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    });

    console.log("Edge function returned.");

    if (!response.ok) {
      console.log(response);
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    let chunks = "";
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      // setReadableRecipes((prev) => prev + chunkValue);
      chunks += chunkValue;
    }
    setGeneratedRecipes(JSON.parse(chunks));
    console.log(chunks);
    console.log(generatedRecipes);

    setLoading(false);
  };
  const alcoholArray = [
    "Vodka",
    "Rum",
    "Tequila",
    "Baileys Irish Cream",
    "Whiskey",
    "Amaretto",
    "Peach Schnapps",
    "Sake",
    "Triple Sec",
  ];

  const mixerArray = [
    "Orange Juice",
    "Sprite",
    "Coke",
    "Pineapple Juice",
    "Milk",
    "Lime Juice",
    "Cream",
    "Coffee",
  ];

  return (
    <div className="flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Head>
        <title>AI Bartender</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-12 sm:mt-20">
        <h1 className="sm:text-6xl text-4xl max-w-2xl font-bold text-slate-900">
          Cocktail Recipe Generator
        </h1>
        <p className="text-slate-400 text-2xl mt-2"></p>

        <div className="max-w-xl w-full">
          <div className="flex mt-10 mb-5 items-center space-x-3">
            <Image
              src="/1-black.png"
              width={30}
              height={30}
              alt="1 icon"
              className="mb-5 sm:mb-0"
            />
            <p className="text-left font-medium">What alcohol do you have?</p>
          </div>
          <InventorySelect
            handleInventory={handleAlcoholInventory}
            inventory={alcoholArray}
          />

          <div className="flex mt-10 mb-5 items-center space-x-3">
            <Image src="/2-black.png" width={30} height={30} alt="1 icon" />
            <p className="text-left font-medium">What mixers do you have?</p>
          </div>

          <InventorySelect
            handleInventory={handleMixerInventory}
            inventory={mixerArray}
          />

          {!loading && (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              onClick={(e) => generateRecipes(e)}
            >
              Let's Get Mixing! &rarr;
            </button>
          )}
          {loading && (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              disabled
            >
              <LoadingDots color="white" style="large" />
            </button>
          )}
        </div>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 2000 }}
        />
        <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" />
        <ResizablePanel>
          <AnimatePresence mode="wait">
            <motion.div className="space-y-10 my-10">
              {generatedRecipes && (
                <>
                  <div>
                    <h2 className="sm:text-4xl text-3xl font-bold text-slate-900 mx-auto">
                      Your generated recipes
                    </h2>
                  </div>
                  <div className="space-y-8 flex flex-col items-center justify-center max-w-xl mx-auto">
                    {
                      <div
                        className="bg-white rounded-xl shadow-md p-4 hover:bg-gray-100 transition cursor-copy border"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${
                              generatedRecipes.name
                            } ingredients: ${generatedRecipes.ingredients.map(
                              (ingredient) => {
                                return (
                                  " " +
                                  ingredient.name +
                                  ": " +
                                  ingredient.amount
                                );
                              }
                            )} instructions: ${generatedRecipes.instructions}`
                          );
                          toast("Recipe copied to clipboard", {
                            icon: "✂️",
                          });
                        }}
                      >
                        <h1 className="text-xl font-bold">
                          {generatedRecipes.name}
                        </h1>
                        <h3 className="font-bold">Ingredients</h3>
                        <ul>
                          {generatedRecipes.ingredients.map(
                            (ingredient, index) => {
                              return (
                                <li key={index}>
                                  {ingredient.name} {ingredient.amount}
                                </li>
                              );
                            }
                          )}
                        </ul>
                        <h3 className="font-bold">Instructions</h3>
                        <p>{generatedRecipes.instructions}</p>
                      </div>
                    }
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </ResizablePanel>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
