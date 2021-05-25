import waitNum from "@/data/wait_num.json";
import waitTime from "@/data/wait_time.json";
import totalNum from "@/data/total_num.json";
import currentNum from "@/data/current_num.json";

function getEntryAt(array, minute) {
  for (let i = 1; i < array.length; i++) {
    const st = array[i - 1]["时间"];
    const ed = array[i]["时间"];

    if (st <= minute && minute <= ed) {
      return array[i];
    }
  }

  // if (minute < array[array.length - 1]["时间"]) return array[array.length - 1];
  // else return null;

  return array[array.length - 1];
}

export function getWaitNum(label, minute) {
  const entry = getEntryAt(waitNum, minute);

  if (entry !== null) {
    return entry[label];
  } else {
    return 0;
  }
}

export function getWaitTime(label, minute) {
  const entry = getEntryAt(waitTime, minute);

  if (entry !== null) {
    return Math.round(entry[label]);
  } else {
    return 0;
  }
}

export function getWaitCount(label, minute) {
  const entry = getEntryAt(currentNum, minute);

  if (entry !== null) {
    return Math.round(entry[label]);
  } else {
    return 0;
  }
}

export function getPlayerCount(minute) {
  const entry = getEntryAt(totalNum, minute);

  if (entry != null) {
    return {
      in: Math.round(entry["当前园内人数"]),
      tot: Math.round(entry["游园人数统计"]),
    };
  } else {
    return {
      in: 0,
      tot: 0,
    };
  }
}

export function dateToMinute(date) {
  return date.getHours() * 60 + date.getMinutes() - 8 * 60;
}

export function getModifiedTime() {
  const date = new Date();

  let hours = date.getHours();

  if (hours <= 8) hours = 9;
  else if (hours >= 16) hours = 15;

  date.setHours(hours);

  return date;
}

export function getCurrentWaitNum(label) {
  const date = getModifiedTime();

  return getWaitNum(label, dateToMinute(date));
}

export function getCurrentWaitTime(label) {
  const date = getModifiedTime();

  return getWaitTime(label, dateToMinute(date));
}

export function getCurrentWaitCount(label) {
  const date = getModifiedTime();

  return getWaitCount(label, dateToMinute(date));
}

export function getCurrentPlayerCount() {
  const date = getModifiedTime();

  return getPlayerCount(dateToMinute(date));
}
