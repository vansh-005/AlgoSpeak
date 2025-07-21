from gtts import gTTS

test_text = (
    "Hello! Today I will explain my approach for LeetCode problem one hundred and two. "
    "I plan to use a breadth-first search, or BFS, to traverse the binary tree level by level. "
    "First, I’ll check if the root is null. If it’s not, I’ll initialize a queue and add the root node. "
    "For each level, I’ll record all node values, then enqueue their left and right children for the next level. "
    "Finally, I’ll return a list of lists, where each list contains the node values at each level. "
    "For example, if the tree is 3, 9, 20, null, null, 15, 7, "
    "the output should be: open bracket 3 close bracket, open bracket 9, 20 close bracket, open bracket 15, 7 close bracket. "
    "My expected time complexity is O of n, and space complexity is also O of n. That’s my plan!"
)

tts = gTTS(text=test_text, lang='en', slow=False)
tts.save("transcription_test.mp3")
print("Audio file saved as transcription_test.mp3")
