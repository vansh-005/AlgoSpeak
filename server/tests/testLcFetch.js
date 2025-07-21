// const LeetCode = (...args) => import('leetcode-query').then(mod => mod.default(...args));
const {LeetCode} = require('leetcode-query')
const leetcode  = new LeetCode();

async function fetchLeetCodeProblem(slug) {
  try {
    const problem = await leetcode.problem(slug);
    // // Optional: Strip HTML if you want plain text
    // const stripHtml = (html) => html.replace(/<[^>]+>/g, '');
    // console.log(problem);
    return {
        problem
    };
  } catch (err) {
    console.error('LeetCode-query fetch error:', err.message);
    throw err;
  }
}
function prettyNumber(str) {
    // Converts 10^4 to 10000, 10^9 to 1000000000, etc.
    return str.replace(/10\^4/g, "10000")
              .replace(/10\^5/g, "100000")
              .replace(/10\^6/g, "1000000")
              .replace(/10\^7/g, "10000000")
              .replace(/10\^8/g, "100000000")
              .replace(/10\^9/g, "1000000000")
              .replace(/1e4/g, "10000")
              .replace(/1e5/g, "100000")
              .replace(/1e6/g, "1000000")
              .replace(/1e7/g, "10000000")
              .replace(/1e8/g, "100000000")
              .replace(/1e9/g, "1000000000");
}

function formatLeetCodePrompt(problem) {
    const stripHtml = (html) =>
        html.replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&le;/g, '<=')
            .replace(/&ge;/g, '>=')
            .replace(/&quot;/g, '"')
            .replace(/\n{2,}/g, '\n')
            .trim();

    const title = problem.title;
    const difficulty = problem.difficulty;
    const rawStatement = stripHtml(problem.content || '');

    // Extract constraints, format numbers
    let constraints = [];
    const constraintBlock = rawStatement.match(/Constraints:([\s\S]*?)(?:\n[A-Z]|$)/);
    if (constraintBlock) {
        constraints = constraintBlock[1]
            .split('\n')
            .map(line => line.trim())
            .filter(Boolean)
            .map(line => prettyNumber(line.replace(/\.$/, "")));
    }

    // Extract examples (find Example 1: blocks)
    const exampleBlocks = [];
    const exampleRegex = /Example \d+:(.*?)(?=Example \d+:|Constraints:|$)/gs;
    let match;
    while ((match = exampleRegex.exec(rawStatement)) !== null) {
        exampleBlocks.push(match[0].trim());
    }

    // Remove everything after "Constraints:" in problem statement
    let cleanedStatement = rawStatement.split(/Constraints:/)[0].trim();

    // Compose prompt
    let prompt = `LeetCode Problem: ${title}\nDifficulty: ${difficulty}\n\nProblem Statement:\n${cleanedStatement}\n`;

    if (constraints.length > 0) {
        prompt += `\nConstraints:\n`;
        constraints.forEach(c => prompt += `- ${c}\n`);
    }

    // if (exampleBlocks.length > 0) {
    //     prompt += '\n' + exampleBlocks.join('\n\n') + '\n';
    // }

    // Look for follow-up
    const followup = rawStatement.match(/Follow-up:([^\n]+)/);
    if (followup) {
        prompt += `\nFollow-up:\n${followup[1].trim()}\n`;
    }

    // Hints
    if (problem.hints && problem.hints.length > 0) {
        prompt += `\nHints:\n`;
        problem.hints.forEach(h => {
            prompt += `- ${stripHtml(h)}\n`;
        });
    }

    // Tags
    if (problem.topicTags && problem.topicTags.length > 0) {
        const tags = problem.topicTags.map(tag => tag[0]).filter(Boolean).join(', ');
        prompt += `\nTags: ${tags || '(none)'}`;
    } else {
        prompt += `\nTags: (none)`;
    }

    return prompt.trim();
}


async function main(slug) {
    const { problem } = await fetchLeetCodeProblem(slug);
    const contextPrompt = formatLeetCodePrompt(problem);
    // Now, send contextPrompt to your LLM
    console.log(contextPrompt);
}


main('two-sum');
