"use strict";

import { Dataset, EnzymeRateParameter, PopulationType } from './enum.js';
import { EnzymeRateCLintUnits, EnzymeRateVmaxUnits, FlowUnits } from './enum.js';
import { PopGenState } from './popgenstate.js';
import { getNonPartitonedEChartsOptions, getPartitonedEChartsOptions } from './conf.js';
import { generatePopAsync, terminate } from "./executor.js";

(async function (global) {

    if (typeof String.prototype.toWellFormed === "undefined") return; // runtime not supported

    const document = global.document;

    const fsForm = document.getElementById("fsForm");
    const txtPopulation = document.getElementById("txtPopulation");
    const rdoP3M = document.getElementById("rdoP3M");
    const rdoICRP = document.getElementById("rdoICRP");
    const rdoHSE = document.getElementById("rdoHSE");
    const rdoNDNS = document.getElementById("rdoNDNS");
    const txtAgeFrom = document.getElementById("txtAgeFrom");
    const txtAgeTo = document.getElementById("txtAgeTo");
    const lblAgeInterval = document.getElementById("lblAgeInterval");
    const txtBMIFrom = document.getElementById("txtBMIFrom");
    const txtBMITo = document.getElementById("txtBMITo");
    const txtHeightFrom = document.getElementById("txtHeightFrom");
    const txtHeightTo = document.getElementById("txtHeightTo");
    const txtProbabilityOfMale = document.getElementById("txtProbabilityOfMale");
    const txtProbabilityOfWhite = document.getElementById("txtProbabilityOfWhite");
    const txtProbabilityOfBlack = document.getElementById("txtProbabilityOfBlack");
    const lblProbabilityOfNBH = document.getElementById("lblProbabilityOfNBH");
    const txtProbabilityOfNBH = document.getElementById("txtProbabilityOfNBH");
    const lblNBH = document.getElementById("lblNBH");
    const chkAdipose = document.getElementById("chkAdipose");
    const chkBone = document.getElementById("chkBone");
    const chkMuscle = document.getElementById("chkMuscle");
    const chkSkin = document.getElementById("chkSkin");
    const chkBrain = document.getElementById("chkBrain");
    const chkGonads = document.getElementById("chkGonads");
    const chkHeart = document.getElementById("chkHeart");
    const chkKidney = document.getElementById("chkKidney");
    const chkLiver = document.getElementById("chkLiver");
    const chkPancreas = document.getElementById("chkPancreas");
    const chkLargeIntestine = document.getElementById("chkLargeIntestine");
    const chkSmallIntestine = document.getElementById("chkSmallIntestine");
    const chkSpleen = document.getElementById("chkSpleen");
    const chkStomach = document.getElementById("chkStomach");
    const ddlEnzymeRateParameter = document.getElementById("ddlEnzymeRateParameter");
    const txtEnzymeName = document.getElementById("txtEnzymeName");
    const txtEnzymeRate = document.getElementById("txtEnzymeRate");
    const ddlFlowUnits = document.getElementById("ddlFlowUnits");
    const ddlEnzymeRateUnits = document.getElementById("ddlEnzymeRateUnits");
    const txtRMM = document.getElementById("txtRMM");
    const txtSeed = document.getElementById("txtSeed");
    const rdoRealistic = document.getElementById("rdoRealistic");
    const rdoHighVariation = document.getElementById("rdoHighVariation");
    const btnGenerate = document.getElementById("btnGenerate");
    const btnDownload = document.getElementById("btnDownload");
    const btnContinue = document.getElementById("btnContinue");
    const btnReset = document.getElementById("btnReset");

    const dvGenerate = document.getElementById("dvGenerate");

    const dvProgress = document.getElementById("dvProgress");
    const progGenPop = document.getElementById("progGenPop");
    const dvProgMessage = document.getElementById("dvProgMessage");
    const btnProgCancel = document.getElementById("btnProgCancel");

    const dvResults = document.getElementById("dvResults");
    const ddlX = document.getElementById("ddlX");
    const ddlY = document.getElementById("ddlY");
    const ddlPartition = document.getElementById("ddlPartition");
    const dvChart = document.getElementById("dvChart");

    const rdoDataset = [rdoP3M, rdoICRP, rdoHSE, rdoNDNS];
    const chkSlowlyPerfused = [chkAdipose, chkBone, chkMuscle, chkSkin];
    const chkRapidlyPerfused = [
        chkBrain, chkGonads, chkHeart, chkKidney, chkLargeIntestine,
        chkLiver, chkPancreas, chkSmallIntestine, chkSpleen, chkStomach
    ];
    const rdoPopulationType = [rdoRealistic, rdoHighVariation];

    const vmaxTexts = ["pmol/min", "µmol/h", "mmol/h", "pg/min", "µg/h", "mg/h"];
    const vmaxOptions = Object.keys(
        EnzymeRateVmaxUnits).map((s, i) => [EnzymeRateVmaxUnits[s].description, vmaxTexts[i]]
        );

    const clintTexts = ["µl/min", "ml/h", "l/h"];
    const clintOptions = Object.keys(
        EnzymeRateCLintUnits).map((s, i) => [EnzymeRateCLintUnits[s].description, clintTexts[i]]
        );

    const rateUnitsRequiringRMM = [
        EnzymeRateVmaxUnits.PicoGramsPerMinute,
        EnzymeRateVmaxUnits.MicroGramsPerHour,
        EnzymeRateVmaxUnits.MilliGramsPerHour
    ];

    const pyGeneratePop = document.getElementById("pyGeneratePop").text;
    const pyPopToCsv = document.getElementById("pyPopToCsv").text;

    function removeOptions(selectElement) {
        let i, last = selectElement.options.length - 1;
        for (i = last; i >= 0; --i) {
            selectElement.remove(i);
        }
    }

    function configureForDataSet() {

        if (rdoP3M.checked) {

            txtAgeFrom.placeholder = ">= 0"
            txtAgeTo.placeholder = "<= 80"
            lblAgeInterval.innerText = "[0, 80]"
            txtProbabilityOfWhite.disabled = false;
            txtProbabilityOfBlack.disabled = false;
            txtProbabilityOfNBH.disabled = false;
            lblProbabilityOfNBH.innerText = "non-black hispanic"
            lblNBH.innerText = "NBH"

        } else if (rdoICRP.checked) {

            txtAgeFrom.placeholder = ">= 0"
            txtAgeTo.placeholder = "<= 80"
            lblAgeInterval.innerText = "[0, 80]"
            txtProbabilityOfWhite.disabled = false;
            txtProbabilityOfBlack.disabled = false;
            txtProbabilityOfNBH.disabled = false;
            lblProbabilityOfNBH.innerText = "non-black hispanic"
            lblNBH.innerText = "NBH"

        } else if (rdoHSE.checked) {

            txtAgeFrom.placeholder = ">= 0"
            txtAgeTo.placeholder = "<= 70"
            lblAgeInterval.innerText = "[0, 70]"
            txtProbabilityOfWhite.disabled = false;
            txtProbabilityOfBlack.disabled = false;
            txtProbabilityOfNBH.disabled = false;
            lblProbabilityOfNBH.innerText = "asian"
            lblNBH.innerText = "A"

        } else {

            txtAgeFrom.placeholder = ">= 1.25"
            txtAgeTo.placeholder = "<= 5"
            lblAgeInterval.innerText = "[1.25, 5]"
            txtProbabilityOfWhite.disabled = true;
            txtProbabilityOfBlack.disabled = true;
            txtProbabilityOfNBH.disabled = true;

        }
    }

    function configureForEnzymeRateParameter() {
        let isVmax = ddlEnzymeRateParameter.value === "Vmax";
        let options = isVmax ? vmaxOptions : clintOptions;

        removeOptions(ddlEnzymeRateUnits);

        options.forEach((element, key) => {
            ddlEnzymeRateUnits[key] = new Option(element[1], element[0]);
        });

        ddlEnzymeRateUnits.selectedIndex = isVmax
            ? selectedVmaxEnzymeRateUnits
            : selectedCLintEnzymeRateUnits;
    }

    function configureForEnzymeRateUnits() {
        let disableRMM = true;

        let isVmax = ddlEnzymeRateParameter.value === "Vmax";
        if (isVmax) {
            let enzymeRateUnits = ddlToEnum(ddlEnzymeRateUnits, EnzymeRateVmaxUnits);
            disableRMM = !rateUnitsRequiringRMM.includes(enzymeRateUnits);
        }

        txtRMM.disabled = disableRMM;
    }

    function configureForNewData(csv, numberOfIndividualsDiscarded) {
        state = new PopGenState(csv, numberOfIndividualsDiscarded);

        let fieldSelectors = state.fieldSelectors;

        removeOptions(ddlX);
        removeOptions(ddlY);

        fieldSelectors.forEach((element, key) => {
            ddlX[key] = new Option(element, element);
            ddlY[key] = new Option(element, element);
        });

        ddlX.selectedIndex = 2;
        ddlY.selectedIndex = 1;
        ddlPartition.selectedIndex = 1;

        btnGenerate.disabled = true;
        btnDownload.disabled = false;
        btnContinue.disabled = false;
        btnReset.disabled = false;

        dvGenerate.classList.add('is-hidden');
        dvProgress.classList.add('is-hidden');
        dvResults.classList.remove('is-hidden');
    }

    function configureForGeneration() {

        fsForm.disabled = false;
        btnGenerate.disabled = false;
        btnDownload.disabled = true;
        btnContinue.disabled = true;

        dvProgress.classList.add('is-hidden');
        dvResults.classList.add('is-hidden');
        dvGenerate.classList.remove('is-hidden');

        txtPopulation.focus();
    }

    function configurePlot() {

        let columnX = ddlX.options[ddlX.selectedIndex].value;
        let columnY = ddlY.options[ddlY.selectedIndex].value;
        let partition = ddlPartition[ddlPartition.selectedIndex].value;

        let options;
        if (partition == "None") {

            let dataX = state.dt.column(columnX);
            let dataY = state.dt.column(columnY);
            options = getNonPartitonedEChartsOptions(global, dataX, dataY);

        } else {

            let vw = state.dt.groupby(partition).select([columnX, columnY]);

            const { rows, get } = vw.groups();

            let series = rows.map((r, i) => {
                let name = get[0](r);
                let indices = vw.partitions()[i];
                let rows = vw.reify(indices);
                return {
                    name: name,
                    dataX: rows.column(columnX),
                    dataY: rows.column(columnY)
                };
            });

            state.dt.ungroup();

            options = getPartitonedEChartsOptions(global, series);
        }

        chart.setOption(options, { notMerge: true });
    }

    function onChangeEnzymeRateParameter() {

        let showingVmaxOptions = ddlEnzymeRateUnits.dataset.rateParameter == "Vmax";

        if (showingVmaxOptions) {
            selectedVmaxEnzymeRateUnits = ddlEnzymeRateUnits.selectedIndex;
        } else {
            selectedCLintEnzymeRateUnits = ddlEnzymeRateUnits.selectedIndex;
        }

        ddlEnzymeRateUnits.dataset.rateParameter = ddlEnzymeRateParameter.value;

        configureForEnzymeRateParameter();
        configureForEnzymeRateUnits();
    }

    function onChangeEnzymeRateUnits() {
        configureForEnzymeRateUnits();
    }

    function resetForm() {
        clearErrors();

        txtPopulation.value = "10";
        rdoHSE.checked = true;
        txtAgeFrom.value = "20";
        txtAgeTo.value = "50";
        txtBMIFrom.value = "20";
        txtBMITo.value = "25";
        txtHeightFrom.value = "140";
        txtHeightTo.value = "170";
        txtProbabilityOfMale.value = "0.5";
        txtProbabilityOfWhite.value = "0.5";
        txtProbabilityOfBlack.value = "0.3";
        txtProbabilityOfNBH.value = "0.1";
        chkAdipose.checked = false;
        chkBone.checked = false;
        chkMuscle.checked = true;
        chkSkin.checked = false;
        chkBrain.checked = false;
        chkGonads.checked = false;
        chkHeart.checked = false;
        chkKidney.checked = false;
        chkLiver.checked = true;
        chkPancreas.checked = false;
        chkLargeIntestine.checked = false;
        chkSmallIntestine.checked = false;
        chkSpleen.checked = false;
        chkStomach.checked = false;
        ddlEnzymeRateParameter.selectedIndex = 0;
        txtEnzymeName.value = "";
        txtEnzymeRate.value = "";
        ddlFlowUnits.selectedIndex = 0;
        txtRMM.value = "";
        txtSeed.value = "";
        rdoRealistic.checked = true;


        // txtPopulation.value = "";
        // rdoP3M.checked = true;
        // txtAgeFrom.value = "";
        // txtAgeTo.value = "";
        // txtBMIFrom.value = "";
        // txtBMITo.value = "";
        // txtHeightFrom.value = "";
        // txtHeightTo.value = "";
        // txtProbabilityOfMale.value = "";
        // txtProbabilityOfWhite.value = "";
        // txtProbabilityOfBlack.value = "";
        // txtProbabilityOfNBH.value = "";
        // chkAdipose.checked = false;
        // chkBone.checked = false;
        // chkMuscle.checked = false;
        // chkSkin.checked = false;
        // chkBrain.checked = false;
        // chkGonads.checked = false;
        // chkHeart.checked = false;
        // chkKidney.checked = false;
        // chkLiver.checked = false;
        // chkPancreas.checked = false;
        // chkLargeIntestine.checked = false;
        // chkSmallIntestine.checked = false;
        // chkSpleen.checked = false;
        // chkStomach.checked = false;
        // ddlEnzymeRateParameter.selectedIndex = 0;
        // txtEnzymeName.value = "";
        // txtEnzymeRate.value = "";
        // ddlFlowUnits.selectedIndex = 0;
        // txtSeed.value = "";
        // rdoRealistic.checked = true;
    }

    function onReset() {

        if (!!state) {
            state.destruct();
            state = null;
        }

        resetForm();

        selectedVmaxEnzymeRateUnits = 0;
        selectedCLintEnzymeRateUnits = 0;
        ddlEnzymeRateUnits.dataset.rateParameter = ddlEnzymeRateParameter.value;

        configureForDataSet();
        configureForEnzymeRateParameter();
        configureForEnzymeRateUnits();

        configureForGeneration();
    }

    function onProgCancel() {
        let id = btnProgCancel.dataset.pgid;
        terminate(id);
        configureForGeneration();
    }

    function radioSetToEnum(radioSet, enumType) {
        for (let i = 0; i < radioSet.length; ++i) {
            let radioButton = radioSet[i];
            if (radioButton.checked) {
                return enumType[radioButton.value];
            }
        }
        return null;
    }

    function ddlToEnum(ddl, enumType) {
        if (ddl.selectedIndex == -1) return null;
        let option = ddl.options[ddl.selectedIndex];
        return enumType[option.value];
    }

    function clearErrors() {
        const toBeCleared = [
            txtPopulation,
            txtAgeFrom,
            txtAgeTo,
            txtBMIFrom,
            txtBMITo,
            txtHeightFrom,
            txtHeightTo,
            txtProbabilityOfMale,
            txtProbabilityOfWhite,
            txtProbabilityOfBlack,
            txtProbabilityOfNBH,
            txtEnzymeName,
            txtEnzymeRate,
            txtRMM,
            txtSeed
        ];

        toBeCleared.forEach(e => e.classList.remove("is-danger"));
    }

    function collectInputs() {

        clearErrors();

        let populationSize = parseFloat(txtPopulation.value);
        if (!Number.isInteger(populationSize) || populationSize < 1) {
            txtPopulation.classList.add("is-danger");
            bulmaToast.toast({ message: 'Enter a valid number for population size', type: 'is-danger' });
            return null;
        }

        let dataset = radioSetToEnum(rdoDataset, Dataset);
        if (!dataset) {
            bulmaToast.toast({ message: 'Select a source data set', type: 'is-danger' });
            return null;
        }

        let ageRangeFrom = parseFloat(txtAgeFrom.value);
        if (Number.isNaN(ageRangeFrom)) {
            txtAgeFrom.classList.add("is-danger");
            bulmaToast.toast({ message: 'Enter a valid number for minimum age', type: 'is-danger' });
            return null;
        }

        let ageRangeTo = parseFloat(txtAgeTo.value);
        if (Number.isNaN(ageRangeTo)) {
            txtAgeTo.classList.add("is-danger");
            bulmaToast.toast({ message: 'Enter a valid number for maximum age', type: 'is-danger' });
            return null;
        }

        if (dataset == Dataset.NDNS) {
            if (ageRangeFrom < 1.25) {
                txtAgeFrom.classList.add("is-danger");
                bulmaToast.toast({ message: 'Minimum age for use with NDNS data set is 1.25 years', type: 'is-danger' });
                return null;
            }
        } else if (ageRangeFrom < 0.) {
            txtAgeFrom.classList.add("is-danger");
            bulmaToast.toast({ message: `Minimum age for use with ${dataset.description} data set is 0 years`, type: 'is-danger' });
            return null;
        }

        if (dataset == Dataset.P3M || dataset == Dataset.HSE) {
            if (ageRangeTo > 80.) {
                txtAgeTo.classList.add("is-danger");
                bulmaToast.toast({ message: `Maximum age for use with ${dataset.description} data set is 80 years`, type: 'is-danger' });
                return null;
            }
        } else if (dataset == Dataset.ICRP) {
            if (ageRangeTo > 70.) {
                txtAgeTo.classList.add("is-danger");
                bulmaToast.toast({ message: `Maximum age for use with ${dataset.description} data set is 70 years`, type: 'is-danger' });
                return null;
            }
        } else { // NDNS
            if (ageRangeTo > 5.) {
                txtAgeTo.classList.add("is-danger");
                bulmaToast.toast({ message: `Maximum age for use with ${dataset.description} data set is 5 years`, type: 'is-danger' });
                return null;
            }
        }

        if (ageRangeTo < ageRangeFrom) {
            txtAgeFrom.classList.add("is-danger");
            txtAgeTo.classList.add("is-danger");
            bulmaToast.toast({ message: 'Enter a valid age range', type: 'is-danger' });
            return null;
        }

        let bmiRangeFrom = parseFloat(txtBMIFrom.value);
        if (Number.isNaN(bmiRangeFrom) || bmiRangeFrom < 0.) {
            txtBMIFrom.classList.add("is-danger");
            bulmaToast.toast({ message: 'Enter a valid number for minimum BMI', type: 'is-danger' });
            return null;
        }

        let bmiRangeTo = parseFloat(txtBMITo.value);
        if (Number.isNaN(bmiRangeTo)) {
            txtBMITo.classList.add("is-danger");
            bulmaToast.toast({ message: 'Enter a valid number for maximum BMI', type: 'is-danger' });
            return null;
        }

        if (bmiRangeTo < bmiRangeFrom) {
            txtBMIFrom.classList.add("is-danger");
            txtBMITo.classList.add("is-danger");
            bulmaToast.toast({ message: 'Enter a valid BMI range', type: 'is-danger' });
            return null;
        }

        let heightRangeFrom = parseFloat(txtHeightFrom.value);
        if (Number.isNaN(heightRangeFrom) || heightRangeFrom < 0.) {
            txtHeightFrom.classList.add("is-danger");
            bulmaToast.toast({ message: 'Enter a valid number for minimum height', type: 'is-danger' });
            return null;
        }

        let heightRangeTo = parseFloat(txtHeightTo.value);
        if (Number.isNaN(heightRangeTo)) {
            txtHeightTo.classList.add("is-danger");
            bulmaToast.toast({ message: 'Enter a valid number for maximum height', type: 'is-danger' });
            return null;
        }

        if (heightRangeTo < heightRangeFrom) {
            txtHeightFrom.classList.add("is-danger");
            txtHeightTo.classList.add("is-danger");
            bulmaToast.toast({ message: 'Enter a valid height range', type: 'is-danger' });
            return null;
        }

        let probabilityOfMale = parseFloat(txtProbabilityOfMale.value);
        if (Number.isNaN(probabilityOfMale) || probabilityOfMale < 0. || probabilityOfMale > 1.) {
            txtProbabilityOfMale.classList.add("is-danger");
            bulmaToast.toast({ message: 'Enter a valid number for probability of male', type: 'is-danger' });
            return null;
        }

        let ethnicity = null;
        if (dataset != Dataset.NDNS) {

            let probabilityOfWhite = parseFloat(txtProbabilityOfWhite.value);
            if (Number.isNaN(probabilityOfWhite) || probabilityOfWhite < 0. || probabilityOfWhite > 1.) {
                txtProbabilityOfWhite.classList.add("is-danger");
                bulmaToast.toast({ message: 'Enter a valid number for probability of white', type: 'is-danger' });
                return null;
            }

            let probabilityOfBlack = parseFloat(txtProbabilityOfBlack.value);
            if (Number.isNaN(probabilityOfBlack) || probabilityOfBlack < 0. || probabilityOfBlack > 1.) {
                txtProbabilityOfBlack.classList.add("is-danger");
                bulmaToast.toast({ message: 'Enter a valid number for probability of black', type: 'is-danger' });
                return null;
            }

            let probabilityOfNBH = parseFloat(txtProbabilityOfNBH.value);
            if (Number.isNaN(probabilityOfNBH) || probabilityOfNBH < 0. || probabilityOfNBH > 1.) {
                txtProbabilityOfNBH.classList.add("is-danger");
                bulmaToast.toast({ message: `Enter a valid number for probability of ${lblProbabilityOfNBH.innerText}`, type: 'is-danger' });
                return null;
            }

            ethnicity = [probabilityOfWhite, probabilityOfBlack, probabilityOfNBH];

            if (ethnicity.reduce((pv, cv) => pv + cv) > 1.) {
                txtProbabilityOfWhite.classList.add("is-danger");
                txtProbabilityOfBlack.classList.add("is-danger");
                txtProbabilityOfNBH.classList.add("is-danger");
                bulmaToast.toast({ message: 'Ethnicity probabilities must sum to 1 or less', type: 'is-danger' });
                return null;
            }
        }

        let isRPTDiscrete = chkRapidlyPerfused.map(chk => chk.checked);
        if (isRPTDiscrete.every(e => !e)) {
            isRPTDiscrete = false;
        } else if (isRPTDiscrete.every(e => !!e)) {
            isRPTDiscrete = true;
        }

        let isSPTDiscrete = chkSlowlyPerfused.map(chk => chk.checked);
        if (isSPTDiscrete.every(e => !e)) {
            isSPTDiscrete = false;
        } else if (isSPTDiscrete.every(e => !!e)) {
            isSPTDiscrete = true;
        }

        let enzymeRateParameter = ddlToEnum(ddlEnzymeRateParameter, EnzymeRateParameter);

        let ss = txtEnzymeName.value
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        if (ss.length != [...new Set(ss)].length) {
            txtEnzymeName.classList.add("is-danger");
            bulmaToast.toast({ message: 'Enter a set of unique enzyme names', type: 'is-danger' });
            return null;
        }

        let ff = txtEnzymeRate.value
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0)
            .map(s => parseFloat(s));

        if (ss.length != ff.length) {
            txtEnzymeName.classList.add("is-danger");
            txtEnzymeRate.classList.add("is-danger");
            bulmaToast.toast({ message: 'Enter an equal number of enzyme names and rates separated using a semicolon', type: 'is-danger' });
            return null;
        }

        if (ff.some(f => Number.isNaN(f))) {
            txtEnzymeRate.classList.add("is-danger");
            bulmaToast.toast({ message: 'Enter a valid number for each enzyme rate', type: 'is-danger' });
            return null;
        }

        let enzymeNames = ss.length ? ss : null;
        let enzymeRates = ff.length ? ff : null;

        let flowUnits = ddlToEnum(ddlFlowUnits, FlowUnits);

        let enzymeRateUnits = ddlToEnum(
            ddlEnzymeRateUnits,
            enzymeRateParameter == EnzymeRateParameter.Vmax
                ? EnzymeRateVmaxUnits
                : EnzymeRateCLintUnits
        );

        let rmm = null;
        if (enzymeRateParameter == EnzymeRateParameter.Vmax && rateUnitsRequiringRMM.includes(enzymeRateUnits)) {
            rmm = parseFloat(txtRMM.value);
            if (Number.isNaN(rmm) || rmm < 1.) {
                txtRMM.classList.add("is-danger");
                bulmaToast.toast({ message: 'Enter a valid number for molecular mass', type: 'is-danger' });
                return null;
            }
        }

        let seed = null;
        if (!!txtSeed.value) {
            seed = parseFloat(txtSeed.value);
            if (!Number.isInteger(seed) || seed < 1) {
                txtSeed.classList.add("is-danger");
                bulmaToast.toast({ message: 'Enter a valid positive integer for seed', type: 'is-danger' });
                return null;
            }
        }

        let populationType = radioSetToEnum(rdoPopulationType, PopulationType);
        if (!populationType) {
            bulmaToast.toast({ message: 'Select a population type', type: 'is-danger' });
            return null;
        }

        let inputs = {
            "population_size": populationSize,
            "dataset_name": dataset.description,
            "age_range": [ageRangeFrom, ageRangeTo],
            "bmi_range": [bmiRangeFrom, bmiRangeTo],
            "height_range": [heightRangeFrom, heightRangeTo],
            "prob_of_male": probabilityOfMale,
            "probs_of_ethnicities": ethnicity,
            "is_richly_perfused_tissue_discrete": isRPTDiscrete,
            "is_slowly_perfused_tissue_discrete": isSPTDiscrete,
            "enzyme_rate_parameter": enzymeRateParameter.description,
            "enzyme_names": enzymeNames,
            "in_vitro_enzyme_rates": enzymeRates,
            "flow_units": flowUnits.description,
            "enzyme_rate_units": enzymeRateUnits.description,
            "molecular_weight": rmm,
            "seed": seed,
            "population_type": populationType.description
        };

        return inputs;
    }

    function configureForProgress(inputs) {
        fsForm.disabled = true;
        btnGenerate.disabled = true;
        btnDownload.disabled = true;
        btnReset.disabled = true;

        progGenPop.max = inputs.population_size;
        progGenPop.value = 0;
        dvProgMessage.innerText = 'Loading Python+libs...there may be a short delay';
        btnProgCancel.disabled = true;

        dvResults.classList.add('is-hidden');
        dvGenerate.classList.add('is-hidden');
        dvProgress.classList.remove('is-hidden');
    }

    async function onGenerate() {

        let inputs = collectInputs();
        if (!inputs) return;

        configureForProgress(inputs);

        let canCancel = false;

        function onUpdate(id, n_gen, n_rej) {
            dvProgMessage.innerText = `${n_gen} (${n_rej})`;
            progGenPop.value = n_gen;
            if (!canCancel) {
                btnProgCancel.dataset.pgid = id;
                btnProgCancel.disabled = false;
                canCancel = true;
            }
        }

        try {
            const { csv, numberOfIndividualsDiscarded } = await generatePopAsync(
                pyGeneratePop,
                pyPopToCsv,
                inputs,
                onUpdate
            );
            configureForNewData(csv, numberOfIndividualsDiscarded);
            configurePlot();
            chart.resize(); // problem: chart initialized on hidden element
        } catch (err) {
            console.log(err);
            console.log("Inputs that led to this fault were:");
            console.log(inputs);
            bulmaToast.toast({ message: 'Generation failed (fault in Python library). See console for details.', type: 'is-danger' });

            configureForGeneration();
        }
    }

    function onDownload() {
        let a = document.createElement('a');
        a.href = state.url;
        a.download = `popgen${String(++downloadNo).padStart(4, '0')}.csv`;
        a.click();
    }

    function onContinue() {
        state.destruct();
        state = null;

        configureForGeneration();
    }

    function onResize() {
        chart.resize();
    }

    rdoP3M.addEventListener("change", configureForDataSet);
    rdoICRP.addEventListener("change", configureForDataSet);
    rdoHSE.addEventListener("change", configureForDataSet);
    rdoNDNS.addEventListener("change", configureForDataSet);

    ddlEnzymeRateParameter.addEventListener("change", onChangeEnzymeRateParameter);
    ddlEnzymeRateUnits.addEventListener("change", onChangeEnzymeRateUnits);

    btnGenerate.addEventListener("click", onGenerate);
    btnDownload.addEventListener("click", onDownload);
    btnContinue.addEventListener("click", onContinue);
    btnReset.addEventListener("click", onReset);

    btnProgCancel.addEventListener("click", onProgCancel);

    global.addEventListener('resize', onResize);
    ddlX.addEventListener('change', configurePlot);
    ddlY.addEventListener('change', configurePlot);
    ddlPartition.addEventListener('change', configurePlot);

    let selectedVmaxEnzymeRateUnits = 0;
    let selectedCLintEnzymeRateUnits = 0;
    let downloadNo = 0;
    let state /* : PopGenState */ = null;
    let chart;

    echarts.registerTransform(ecStat.transform.regression);

    let match = window.matchMedia('(prefers-color-scheme: dark)');
    if (match.matches) {
        chart = echarts.init(dvChart, 'dark');
    } else {
        chart = echarts.init(dvChart);
    }

    resetForm();

    configureForDataSet();
    configureForEnzymeRateParameter();
    configureForEnzymeRateUnits();
    configureForGeneration();

})(window);
