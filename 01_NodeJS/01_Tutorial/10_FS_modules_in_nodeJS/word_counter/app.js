import fs from "fs/promises";

const filePath = process.argv[2];
const content = await fs.readFile(filePath, "utf8");

// Split on non-word chars, filter out empty strings
const wordsArray = content.split(/[\W]+/).filter((w) => w);
const wordCount = {};
wordsArray.forEach((word) => {
  if (wordCount[word]) {
    wordCount[word]++;
  } else {
    wordCount[word] = 1;
  }
});

console.log(wordCount);
