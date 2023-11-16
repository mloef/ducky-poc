# ducky-poc
Three experiments with talking to ChatGPT.
First, based off a talk-to-chatgpt chrome extension.  Refined ergonomics on ChatGPT. Then, ported to Claude, and finally to a more flexible localhost LLM interface. Prototyped some interesting ideas on improving voice latency, and got valuable UX insights.

Second, a standalone js page based on the above extension. This time, it uses the Claude API instead of acting as an extension on top of Claude chat. Still using browser speech-to-text and text-to-speech.

Third, a simple python program that runs Silero TTS locally, calls Claude instant for a response, then streams audio from Elevenlabs.
