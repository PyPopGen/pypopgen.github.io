'use strict';

importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js");

async function loadPyodideAndPackages() {
  self.pyodide = await loadPyodide();

  await self.pyodide.loadPackage("micropip");
  const micropip = self.pyodide.pyimport("micropip");
  await micropip.install(self.location.origin + '/pypopgenbe-1.5.5-py3-none-any.whl');

  await self.pyodide.runPythonAsync("import pypopgenbe as pg");
  await self.pyodide.runPythonAsync("from pypopgenbe import EnzymeRateCLintUnits, EnzymeRateParameter, EnzymeRateVmaxUnits, Dataset, FlowUnits, PopulationType");
  await self.pyodide.runPythonAsync("from pypopgenbe import pop_to_csv");
}

let pyodideReadyPromise = loadPyodideAndPackages();

self.onmessage = async (event) => {

  await pyodideReadyPromise;

  const { id, pyGeneratePop, pyPopToCsv, ...inputs } = event.data;

  function callback(n_gen, n_rej) {
    self.postMessage({ messageType: "Update", id, n_gen, n_rej });
    return false;
  }

  try {
    let options = { locals: self.pyodide.toPy({ callback, ...inputs }) };
    let output = await self.pyodide.runPythonAsync(pyGeneratePop, options);
    let numberOfIndividualsDiscarded = output[1];
    options = { locals: pyodide.toPy({ population: output[0] }) };
    output = await pyodide.runPythonAsync(pyPopToCsv, options);
    let csv = output.toJs();
    self.postMessage({ messageType: "Final", id, csv, numberOfIndividualsDiscarded });
  } catch (error) {
    self.postMessage({ messageType: "Error", id, error: error.message });
  }
};
