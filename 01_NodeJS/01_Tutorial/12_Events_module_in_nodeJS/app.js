// Import the built-in 'events' module from Node.js
// EventEmitter is the core class that enables event-driven programming in Node.js
import EventEmitter from "events";

/**
 * Create an instance of EventEmitter.
 * This instance acts as an event manager that can:
 *   - Register event listeners using .on()       → "listen for this event"
 *   - Trigger events using .emit()               → "fire this event now"
 *   - Remove listeners using .off()              → "stop listening"
 *   - Listen once using .once()                  → "listen, then auto-remove"
 * Without creating an instance, we cannot use any event-handling functionality.
 */
const emitter = new EventEmitter();

// .on(eventName, callback) registers a listener for the given event name
// The callback runs every time that event is emitted
// "pink" is a custom event name — you can name events anything you like
emitter.on("pink", () => {
  // This listener takes no arguments — the "pink" event carries no extra data
  console.log("Pink event emitted!");
});

// Registering a listener for a second custom event called "purple"
// This listener accepts one argument: "message"
// The sender can pass data when emitting — the listener receives it here
emitter.on("purple", (message) => {
  // 'message' holds whatever value was passed when emit("purple", ...) was called
  console.log(`purple event emitted with the message : ${message}`);
});

// ─── Synchronous execution ───────────────────────────────────────────────────
// Important: emit() is SYNCHRONOUS in Node.js
// When emit() is called, all registered listeners for that event run immediately
// and BLOCK further execution until they finish — just like a regular function call

console.log("Before Emitting events...");

// Triggers the "pink" event — runs the "pink" listener immediately
// No extra data is passed here, so the callback receives no arguments
emitter.emit("pink");

// Triggers the "purple" event — passes "Hello from the purple event!" as the argument
// The listener receives this string as its 'message' parameter
emitter.emit("purple", "Hello from the purple event!");

console.log("After Emitting events...");

// Expected output (in order):
// Before Emitting events...
// Pink event emitted!
// purple event emitted with the message : Hello from the purple event!
// After Emitting events...
