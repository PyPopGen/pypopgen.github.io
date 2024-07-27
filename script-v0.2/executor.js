'use strict';

import { MessageType } from './enum.js';

let pyodideWorker = null;
let id = 0;
const callbacks = {};

function onMessage(event) {
  const { messageType, id, ...data } = event.data;
  const { onUpdate, onFinal, onError } = callbacks[id];
  if (messageType == MessageType.Update.description) {
    onUpdate(id, data.n_gen, data.n_rej);
  } else if (messageType == MessageType.Final.description) {
    delete callbacks[id];
    onFinal(data);
  } else {
    onError(data);
  }
};

const generatePopAsync = (() => {
  return (pyGeneratePop, pyPopToCsv, inputs, onUpdate) => {
    if (!pyodideWorker) {
      pyodideWorker = new Worker("./script-v0.2/worker.js");
      pyodideWorker.onmessage = onMessage;
    }

    id = (id + 1) % Number.MAX_SAFE_INTEGER;

    return new Promise((onFinal, onError) => {
      callbacks[id] = { onUpdate, onFinal, onError };
      pyodideWorker.postMessage({ id, pyGeneratePop, pyPopToCsv, ...inputs });
    });
  };
})();

function terminate(id) {
  pyodideWorker.terminate();
  pyodideWorker = null;
  delete callbacks[id];
}

export { generatePopAsync, terminate };