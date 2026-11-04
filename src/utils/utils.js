export function getRandomNum(Min, Max) {
  const Range = Max - Min + 1;
  const Rand = Math.random();
  return Min + Math.floor(Rand * Range);
}

export function export_excel_file(export_data, list_name) {
  let link = document.createElement("a");
  let blogw = new Blob([export_data], { type: "application/vnd.ms-excel" });
  let objectUrl = window.URL.createObjectURL(blogw);
  link.href = objectUrl;
  let file_name = ` ${list_name + new Date()}列表.xlsx`;
  link.download = file_name;
  link.click();
  window.URL.revokeObjectURL(objectUrl);
}

function DateTimeConvert(time, type) {
  var d = time ? new Date(time) : new Date();
  var year = d.getFullYear();
  var month = d.getMonth() + 1;
  var day = d.getDate();
  var hours = d.getHours();
  var min = d.getMinutes();
  var seconds = d.getSeconds();

  if (month < 10) month = "0" + month;
  if (day < 10) day = "0" + day;
  if (hours < 0) hours = "0" + hours;
  if (min < 10) min = "0" + min;
  if (seconds < 10) seconds = "0" + seconds;

  var res = "";
  switch (type) {
    case "yyyy-mm-dd":
      res = year + "-" + month + "-" + day;
      break;

    case "yyyy-mm-dd hh:mm":
      res = year + "-" + month + "-" + day + " " + hours + ":" + min;
      break;

    default:
      res =
        year +
        "-" +
        month +
        "-" +
        day +
        " " +
        hours +
        ":" +
        min +
        ":" +
        seconds;
      break;
  }
  return res;
}

export function parseTime(time, cFormat) {
  if (arguments.length === 0 || !time) {
    return null;
  }
  const format = cFormat || "{y}-{m}-{d} {h}:{i}:{s}";
  let date;
  if (typeof time === "object") {
    date = time;
  } else {
    if (typeof time === "string") {
      if (/^[0-9]+$/.test(time)) {
        time = parseInt(time);
      } else {
        time = time.replace(new RegExp(/-/gm), "/");
      }
    }

    if (typeof time === "number" && time.toString().length === 10) {
      time = time * 1000;
    }
    date = new Date(time);
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  };
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key];
    if (key === "a") {
      return ["日", "一", "二", "三", "四", "五", "六"][value];
    }
    return value.toString().padStart(2, "0");
  });
  return time_str;
}
