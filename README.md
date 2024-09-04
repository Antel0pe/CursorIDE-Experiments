This is a fun experiment to see how ChatGPT and Cursor can work together to build an app based on a high level request like "build a blog app".

To be clear, I know there are multiple purpose built tools for this kind of thing, and this is not meant to be a replacement for them. It's just a fun experiment to see how far we can push this combination of tools with my skill level.

# My Toy Plan
1. Prompt ChatGPT with high level app request. Ask it to break down the task into several subtasks.
2. For each subtask
    a. Send it the current directory structure
    b. Include current dependencies
    c. Prompt it with the subtask
    d. Ask for a series of prompts of what should be coded in each file to complete the subtask.
3. For each file prompt
    a. If the file doesn't exist, create it
    b. Copy paste the prompt manually into the file with Cursor
4. ??
5. PROFIT

# Possible Future Additions
- Function calling to have ChatGPT interact with the codebase

# How to use

1. `npm install`
2. `npm run dev`
3. Open http://localhost:3000/

What I will do:
- Enter the prompts from ChatGPT into Cursor
- Run command prompts for creating app, running, etc.
- Create any files needed