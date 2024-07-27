"use strict";

class PopGenState {
    constructor(csv, numberOfIndividualsDiscarded) {
        let blob = new Blob(
            csv.map(r => r + '\n'),
            { type: 'text/csv' }
        );
        this.#url = URL.createObjectURL(blob);

        let indexInputsStart = Math.min(1001, csv.findIndex(l => l.startsWith(",,,,,")));
        let csvToTabulate = csv.toSpliced(indexInputsStart);
        let content = csvToTabulate.join('\n');
        this.#dt = aq.fromCSV(content);

        this.#numberOfIndividualsDiscarded = numberOfIndividualsDiscarded;
    }

    destruct() {
        URL.revokeObjectURL(this.#url);
    }

    #url;
    #dt;
    #numberOfIndividualsDiscarded;

    get url() {
        return this.#url;
    }

    get dt() {
        return this.#dt;
    }

    get numberOfIndividualsDiscarded() {
        return this.#numberOfIndividualsDiscarded;
    }

    get fieldSelectors() {
        const excludedColumnNames = ['Individual No.', 'Sex', 'Ethnicity'];
        let names = this.#dt.columnNames();
        return names.filter(n => !excludedColumnNames.includes(n));
    }
}

export { PopGenState };
