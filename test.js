const fetch = require("node-fetch");
const fs = require("fs");

const placesArray = [
  {
    place_name: "코엑스",
    place_latitude: 127.05882784390123,
    place_longitude: 37.51266138067201,
  },
  {
    place_name: "일자산허브천문공원",
    place_latitude: 127.153348908729,
    place_longitude: 37.537308977014,
  },
  {
    place_name: "국립4.19민주묘지",
    place_latitude: 127.007655529176,
    place_longitude: 37.648576279141,
  },
  {
    place_name: "서울식물원",
    place_latitude: 126.835037244018,
    place_longitude: 37.5693958477101,
  },
  {
    place_name: "서울대학교 관악캠퍼스",
    place_latitude: 126.9511239870991,
    place_longitude: 37.45978574975834,
  },
  {
    place_name: "어린이대공원",
    place_latitude: 127.08378909469191,
    place_longitude: 37.55147044344215,
  },
  {
    place_name: "신도림테크노마트",
    place_latitude: 126.890265628638,
    place_longitude: 37.5070478415241,
  },
  {
    place_name: "금천체육공원",
    place_latitude: 126.908494973796,
    place_longitude: 37.4682335409953,
  },
  {
    place_name: "경춘선숲길",
    place_latitude: 127.078706040469,
    place_longitude: 37.620691807133,
  },
  {
    place_name: "도봉산",
    place_latitude: 127.01545859321786,
    place_longitude: 37.69884206393718,
  },
  {
    place_name: "세종대왕기념관",
    place_latitude: 127.043587838139,
    place_longitude: 37.5908403884541,
  },
  {
    place_name: "노량진 수산시장",
    place_latitude: 126.93800333988018,
    place_longitude: 37.51480414922673,
  },
  {
    place_name: "월드컵공원",
    place_latitude: 126.897635431027,
    place_longitude: 37.5631939895966,
  },
  {
    place_name: "독립문",
    place_latitude: 126.959542648447,
    place_longitude: 37.5724504220421,
  },
  {
    place_name: "예술의전당",
    place_latitude: 127.01179198066225,
    place_longitude: 37.47922106107729,
  },
  {
    place_name: "서울숲",
    place_latitude: 127.037617759165,
    place_longitude: 37.5443222301513,
  },
  {
    place_name: "정릉",
    place_latitude: 127.005657675347,
    place_longitude: 37.6021719603678,
  },
  {
    place_name: "롯데월드타워",
    place_latitude: 127.10255558658325,
    place_longitude: 37.51260447840551,
  },
  {
    place_name: "목동아이스링크",
    place_latitude: 126.879261276407,
    place_longitude: 37.5307334776835,
  },
  {
    place_name: "63스퀘어",
    place_latitude: 126.94026158444098,
    place_longitude: 37.519814891570896,
  },
  {
    place_name: "남산타워",
    place_latitude: 126.988230622132,
    place_longitude: 37.5513049702718,
  },
  {
    place_name: "진관사",
    place_latitude: 126.946885657783,
    place_longitude: 37.638037472559056,
  },
  {
    place_name: "광화문",
    place_latitude: 126.976861018866,
    place_longitude: 37.5759689663327,
  },
  {
    place_name: "숭례문",
    place_latitude: 126.975313124237,
    place_longitude: 37.5600030088843,
  },
  {
    place_name: "용마폭포공원",
    place_latitude: 127.090053515636,
    place_longitude: 37.5736051123377,
  },
];
const baseUrl = "https://api.yubinhome.com/v1/places/init";
async function fetchData(placeObj) {
  const { place_name, place_latitude, place_longitude } = placeObj;
  const url = `${baseUrl}?place_name=${encodeURIComponent(
    place_name
  )}&place_latitude=${encodeURIComponent(
    place_latitude
  )}&place_longitude=${encodeURIComponent(place_longitude)}`;
  const response = await fetch(url);
  const jsonData = await response.json();
  return jsonData;
}

async function main() {
  const dataToSave = {};

  for (const placeObj of placesArray) {
    const itemData = await fetchData(placeObj);
    dataToSave[placeObj.place_name] = itemData;
    console.log(`Fetched data for ${placeObj.place_name}`);
  }

  const filename = "placesData.json";
  fs.writeFileSync(filename, JSON.stringify(dataToSave, null, 4), "utf-8");
  console.log(`All data saved to ${filename}`);
}

main();