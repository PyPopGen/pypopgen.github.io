"use strict";

const MessageType = Object.freeze({
    Update: Symbol("Update"),
    Final: Symbol("Final"),
    Error: Symbol("Error")
});

const Dataset = Object.freeze({
    P3M: Symbol("P3M"),
    ICRP: Symbol("ICRP"),
    HSE: Symbol("HSE"),
    NDNS: Symbol("NDNS")
});

const EnzymeRateParameter = Object.freeze({
    Vmax: Symbol("Vmax"),
    CLint: Symbol("CLint")
});

const EnzymeRateVmaxUnits = Object.freeze({
    PicoMolsPerMinute: Symbol("PicoMolsPerMinute"),
    MicroMolsPerHour: Symbol("MicroMolsPerHour"),
    MilliMolsPerHour: Symbol("MilliMolsPerHour"),
    PicoGramsPerMinute: Symbol("PicoGramsPerMinute"),
    MicroGramsPerHour: Symbol("MicroGramsPerHour"),
    MilliGramsPerHour: Symbol("MilliGramsPerHour")
});

const EnzymeRateCLintUnits = Object.freeze({
    MicroLitresPerMinute: Symbol("MicroLitresPerMinute"),
    MilliLitresPerHour: Symbol("MilliLitresPerHour"),
    LitresPerHour: Symbol("LitresPerHour")
});

const FlowUnits = Object.freeze({
    MilliLitresPerMinute: Symbol("MilliLitresPerMinute"),
    LitresPerHour: Symbol("LitresPerHour")
});

const PopulationType = Object.freeze({
    Realistic: Symbol("Realistic"),
    HighVariation: Symbol("HighVariation")
});

export {
    MessageType,
    Dataset,
    EnzymeRateParameter,
    EnzymeRateCLintUnits,
    EnzymeRateVmaxUnits,
    FlowUnits,
    PopulationType
};
