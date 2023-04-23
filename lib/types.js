"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredefinedCronExpressionsEnum = exports.DateMathOpEnum = exports.TimeUnitsEnum = exports.DayOfWeekEnum = exports.MonthsEnum = void 0;
var MonthsEnum;
(function (MonthsEnum) {
    MonthsEnum[MonthsEnum["jan"] = 1] = "jan";
    MonthsEnum[MonthsEnum["feb"] = 2] = "feb";
    MonthsEnum[MonthsEnum["mar"] = 3] = "mar";
    MonthsEnum[MonthsEnum["apr"] = 4] = "apr";
    MonthsEnum[MonthsEnum["may"] = 5] = "may";
    MonthsEnum[MonthsEnum["jun"] = 6] = "jun";
    MonthsEnum[MonthsEnum["jul"] = 7] = "jul";
    MonthsEnum[MonthsEnum["aug"] = 8] = "aug";
    MonthsEnum[MonthsEnum["sep"] = 9] = "sep";
    MonthsEnum[MonthsEnum["oct"] = 10] = "oct";
    MonthsEnum[MonthsEnum["nov"] = 11] = "nov";
    MonthsEnum[MonthsEnum["dec"] = 12] = "dec";
})(MonthsEnum = exports.MonthsEnum || (exports.MonthsEnum = {}));
var DayOfWeekEnum;
(function (DayOfWeekEnum) {
    DayOfWeekEnum[DayOfWeekEnum["sun"] = 0] = "sun";
    DayOfWeekEnum[DayOfWeekEnum["mon"] = 1] = "mon";
    DayOfWeekEnum[DayOfWeekEnum["tue"] = 2] = "tue";
    DayOfWeekEnum[DayOfWeekEnum["wed"] = 3] = "wed";
    DayOfWeekEnum[DayOfWeekEnum["thu"] = 4] = "thu";
    DayOfWeekEnum[DayOfWeekEnum["fri"] = 5] = "fri";
    DayOfWeekEnum[DayOfWeekEnum["sat"] = 6] = "sat";
})(DayOfWeekEnum = exports.DayOfWeekEnum || (exports.DayOfWeekEnum = {}));
var TimeUnitsEnum;
(function (TimeUnitsEnum) {
    TimeUnitsEnum["second"] = "second";
    TimeUnitsEnum["minute"] = "minute";
    TimeUnitsEnum["hour"] = "hour";
    TimeUnitsEnum["day"] = "day";
    TimeUnitsEnum["month"] = "month";
    TimeUnitsEnum["year"] = "year";
})(TimeUnitsEnum = exports.TimeUnitsEnum || (exports.TimeUnitsEnum = {}));
var DateMathOpEnum;
(function (DateMathOpEnum) {
    DateMathOpEnum["add"] = "add";
    DateMathOpEnum["subtract"] = "subtract";
})(DateMathOpEnum = exports.DateMathOpEnum || (exports.DateMathOpEnum = {}));
var PredefinedCronExpressionsEnum;
(function (PredefinedCronExpressionsEnum) {
    PredefinedCronExpressionsEnum["@yearly"] = "0 0 1 1 *";
    PredefinedCronExpressionsEnum["@monthly"] = "0 0 1 * *";
    PredefinedCronExpressionsEnum["@weekly"] = "0 0 * * 0";
    PredefinedCronExpressionsEnum["@daily"] = "0 0 * * *";
    PredefinedCronExpressionsEnum["@hourly"] = "0 * * * *";
})(PredefinedCronExpressionsEnum = exports.PredefinedCronExpressionsEnum || (exports.PredefinedCronExpressionsEnum = {}));
var DayOfWeek;
(function (DayOfWeek) {
    DayOfWeek[DayOfWeek["sun"] = 0] = "sun";
    DayOfWeek[DayOfWeek["mon"] = 1] = "mon";
    DayOfWeek[DayOfWeek["tue"] = 2] = "tue";
    DayOfWeek[DayOfWeek["wed"] = 3] = "wed";
    DayOfWeek[DayOfWeek["thu"] = 4] = "thu";
    DayOfWeek[DayOfWeek["fri"] = 5] = "fri";
    DayOfWeek[DayOfWeek["sat"] = 6] = "sat";
})(DayOfWeek || (DayOfWeek = {}));
