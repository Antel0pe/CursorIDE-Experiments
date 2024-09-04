const { OpenAI } = require("openai");
require('dotenv').config();
const { z } = require("zod");
const fs = require("fs");
const path = require("path");
const prompt = require('prompt-sync')({sigint: true});;


const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY });


// Get Directory Structure
const FileSchema = z.object({
  name: z.string(),
  type: z.enum(["file", "directory"]),
  children: z.lazy(() => z.array(FileSchema)).optional(),
});

const DirectorySchema = z.object({
  name: z.string(),
  type: z.literal("directory"),
  children: z.array(FileSchema),
});

function getDirectoryStructure(dirPath) {
  const stats = fs.statSync(dirPath);
  const info = {
    name: path.basename(dirPath),
    type: stats.isDirectory() ? "directory" : "file",
  };

  if (stats.isDirectory()) {
    const ignoreDirs = ['node_modules', '.git', 'build', 'dist'];
    info.children = fs.readdirSync(dirPath)
      .filter(child => !ignoreDirs.includes(child))
      .map(child => getDirectoryStructure(path.join(dirPath, child)));
  }

  return info;
}

function validateDirectoryStructure(dirPath) {
  const structure = getDirectoryStructure(dirPath);
  return DirectorySchema.parse(structure);
}

// ---------------

// Get Dependencies
function getDependencies(dirPath) {
  const packageJsonPath = path.join(dirPath, "package.json");
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    return packageJson.dependencies;
  }
  return {};
}
// ---------------

// Zod Schema for array of subtasks
const SubtaskSchema = z.object({
  subtask: z.string(),
});

const SubtasksArraySchema = z.array(SubtaskSchema);

const ProjectPlanSchema = z.object({
  projectDescription: z.string(),
  subtasks: SubtasksArraySchema,
});

// -------------    

// List of changes to be made in each file
const FileChangeSchema = z.object({
  filePath: z.string(),
  typeOfChanges: z.enum(["add new file", "remove file", "modify file"]),
  descriptionOfChanges: z.string(),
});

const nonFileChangesSchema = z.object({
  typeOfChanges: z.enum(["install dependency"]),
  descriptionOfChanges: z.string(),
});

const FileChangesArraySchema = z.array(z.union([FileChangeSchema, nonFileChangesSchema]));


// -------------

// Chat with GPT
async function chatWithGPT(prompt) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        {
            role: "user",
            content: prompt,
        },
    ],
    });
    return response.choices[0].message;
  } catch (error) {
    console.error("Error in ChatGPT API call:", error);
    return "Sorry, there was an error processing your request.";
  }
}
// ---------------

const dirPath = "./blog-app";

// Get directory structure
const validatedStructure = validateDirectoryStructure(dirPath);
console.log(JSON.stringify(validatedStructure, null, 2));

// Get dependencies
const dependencies = getDependencies(dirPath);
console.log(dependencies);

// Talk to GPT
const chatgptPrompt = "Build me a blog app.";
// include dir, dependencies, and prompt
let response; // get subtasks
// chatWithGPT(prompt).then(response => console.log(response));

response.subtasks.forEach(async subtask => {
  // include dir, dependencies, and subtask
  let fileChangesForSubtask; // get file changes

  // write files    
  fileChangesForSubtask.fileChanges.forEach(fileChange => {
    if (fileChange.typeOfChanges === 'add new file') {
      const filePath = path.join(dirPath, fileChange.path);
      const directory = path.dirname(filePath);

      // Create directory if it doesn't exist
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }

      // Write the file
      fs.writeFileSync(filePath, fileChange.content);
      console.log(`Added new file: ${fileChange.path}`);
    } else {
      // Sleep until user input
      const userInput = prompt(`Press Enter to continue to the next file...`);
    }
  });
});

