const fetch = require("node-fetch");
const fs = require("fs");

const placesArray = [
  {
    "place_name": "코엑스",
    "post_star_rating": 5.0,
    "post_description": "코엑스(COEX)는 강남구의 컨벤션 및 전시 복합시설로 경제와 문화의 중심으로 알려져 있으며 쇼핑몰과 엔터테인먼트 시설도 풍부하게 갖추고 있습니다.",
    "post_image_url": "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/1코엑스.jpeg",
    "place_latitude": 127.0588278439012,
    "place_longitude": 37.51266138067201
  },
  {
    "place_name": "일자산허브천문공원",
    "post_star_rating": 5.0,
    "post_description": "허브천문공원은 한민족 고유의 전통사상과 음양오행사상을 기반으로 우주공간과 자연을 담고 있으며, 수목과 시설물이 배치되어 있습니다.",
    "post_image_url": "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/2허브천문공원.jpeg",
    "place_latitude": 127.153348908729,
    "place_longitude": 37.537308977014
  },
  {
    "place_name": "국립4.19민주묘지",
    "post_star_rating": 5.0,
    "post_description": "국립 4.19 민주묘지는 4·19 혁명을 상징하는 높은 탑과 다양한 조형물로 구성되어 있으며, 40,000평으로 확장되었습니다.",
    "post_image_url": "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/3국립419민주묘지.jpeg",
    "place_latitude": 127.007655529176,
    "place_longitude": 37.648576279141
  },
  {
    "place_name": "서울식물원",
    "post_star_rating": 5.0,
    "post_description": "서울식물원은 4개의 구역으로 나뉘어 있으며, 다양한 식물과 생태계 보전, 연구 활동을 통해 환경을 유지하고 식물 연구를 수행합니다.",
    "post_image_url": "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/4서울식물원.jpeg",
    "place_latitude": 126.835037244018,
    "place_longitude": 37.5693958477101
  },
  {
    "place_name": "서울대학교 관악캠퍼스",
    "post_star_rating": 5.0,
    "post_description": "서울대학교는 한국을 대표하는 대학으로 교육과 연구 활동을 수행하며 문화와 학문의 중심 역할을 합니다.",
    "post_image_url": "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/5서울대학교.jpeg",
    "place_latitude": 126.9511239870991,
    "place_longitude": 37.45978574975834
  },
  {
    "place_name": "서울어린이대공원 놀이동산",
    "post_star_rating": 5.0,
    "post_description": "어린이대공원은 가족 단위 놀이공원으로 동물, 자연, 인간의 조화를 추구하며 다양한 활동을 제공합니다.",
    "post_image_url": "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/6어린이대공원.png",
    "place_latitude": 127.0837890946919,
    "place_longitude": 37.55147044344215
  },
  {
    "place_name": "신도림테크노마트",
    "post_star_rating": 5.0,
    "post_description": "신도림 테크노마트는 2007년에 지어졌습니다. 전자기기 관련 각종 상가들이 모여 있는 서울의 3대 디지털 상가입니다.",
    "post_image_url": "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/7신도림테크노마트.jpeg",
    "place_latitude": 126.890265628638,
    "place_longitude": 37.5070478415241
  },
  {
    "place_name": "금천체육공원",
    "post_star_rating": 5.0,
    "post_description": "금천 체육공원은 다목적 공원으로 농구, 배드민턴, 게이트볼 등 다양한 운동 시설을 제공하며 다양한 연령대의 사람들이 이용합니다.",
    "post_image_url": "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/8금천체육공원.jpeg",
    "place_latitude": 126.908494973796,
    "place_longitude": 37.4682335409953
  },
  {
    "place_name": "경춘선숲길",
    "post_star_rating": 5.0,
    "post_description": "경춘선 숲길은 이전에 철도로 사용되다가 폐선된 후 공원으로 조성되어 경춘선의 추억을 되살립니다.",
    "post_image_url": "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/9경춘선숲길.jpeg",
    "place_latitude": 127.078706040469,
    "place_longitude": 37.620691807133
  },
  {
    "place_name": "도봉산",
    "post_star_rating": 5.0,
    "post_description": "도봉산은 북한산 국립공원의 일부로서 서울 시내에서 쉽게 접근할 수 있는 산으로 국립공원 중에서 가장 많은 탐방객이 찾는 장소 중 하나입니다.",
    "post_image_url": "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/10도봉산.jpeg",
    "place_latitude": 127.0154585932179,
    "place_longitude": 37.69884206393718
  },
  {
    "place_name": "세종대왕기념관",
    "post_star_rating": 5.0,
    "post_description": "세종대왕기념관은 한글 창제와 과학기술 발전을 기리는 박물관으로 세종대왕의 업적을 전시하고 있습니다.",
    "post_image_url": "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/11세종대왕기념관.jpeg",
    "place_latitude": 127.043587838139,
    "place_longitude": 37.5908403884541
  },
  {
    "place_name": "노량진수산물도매시장",
    "post_star_rating": 5.0,
    "post_description": "노량진 수산시장은 전국 각지의 수산물을 판매하는 종합 시장으로 2016년에 현대화되었습니다.",
    "post_image_url": "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/12노량진수상시장.jpeg",
    "place_latitude": 126.9380033398802,
    "place_longitude": 37.51480414922673
  },
  {
    "place_name": "월드컵공원",
    "post_star_rating": 5.0,
    "post_description": "월드컵공원은 쓰레기 매립지를 환경생태공원으로 복원한 공원으로 다양한 테마 공원을 포함하고 있습니다.",
    "post_image_url": "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/13월드컵공원.jpeg",
    "place_latitude": 126.959542648447,
    "place_longitude": 37.5724504220421
  },
  {
    "place_name": "독립문",
    "post_star_rating": 5.0,
    "post_description": "독립문은 조선 시대의 성문으로 1968년에 복원되었으며 국보로 지정되어 있습니다.",
    "post_image_url": "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/%E1%84%85%E1%85%A2%E1%86%AB%E1%84%83%E1%85%B3%E1%84%86%E1%85%A1%E1%84%8F%E1%85%B3/14%E1%84%83%E1%85%A9%E1%86%A8%E1%84%82%E1%85%B5%E1%86%B8%E1%84%86%E1%85%AE%E1%86%AB.jpeg",
    "place_latitude": 126.959542648447,
    "place_longitude": 37.5724504220421
  },
  {
    "place_name": "예술의전당",
    "post_star_rating": 5.0,
    "post_description": "예술의전당은 대규모 복합문화공간으로 다양한 공연과 전시가 개최되고 있습니다.",
    "post_image_url": "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/%E1%84%85%E1%85%A2%E1%86%AB%E1%84%83%E1%85%B3%E1%84%86%E1%85%A1%E1%84%8F%E1%85%B3/15%E1%84%8B%E1%85%A8%E1%84%89%E1%85%AE%E1%86%AF%E1%84%8B%E1%85%B4%E1%84%8C%E1%85%A5%E1%86%AB%E1%84%83%E1%85%A1%E1%86%BC.webp",
    "place_latitude": 127.0117919806623,
    "place_longitude": 37.47922106107729
  },
  {
    "place_name": "서울숲",
    "post_star_rating": 5.0,
    "post_description": "서울숲공원은 도심 속의 자연 숲으로 문화와 생태를 경험할 수 있는 공간입니다.",
    "post_image_url": "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/16서울숲공원.jpeg",
    "place_latitude": 127.037617759165,
    "place_longitude": 37.5443222301513
  },
  {
    "place_name": "정릉",
    "post_star_rating": 5.0,
    "post_description": "정릉은 조선 태조 이성계와 신덕왕후 강 씨의 무덤이 있는 곳으로 조선의 역사를 간직하고 있습니다.",
    "post_image_url": "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/17정릉.webp",
    "place_latitude": 127.1025555865833,
    "place_longitude": 37.51260447840551
  },
  {
    "place_name": "롯데월드타워",
    "post_star_rating": 5.0,
    "post_description": "롯데월드타워는 대한민국의 최고 높이를 가진 건물으로 123층으로 이루어져 있습니다.",
    "post_image_url": "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/18롯데월드타워.webp",
    "place_latitude": 127.1025555865833,
    "place_longitude": 37.51260447840551
  },
  {
    "place_name": "목동종합운동장 목동아이스링크",
    "post_star_rating": 5.0,
    "post_description": "목동아이스링크는 국내 최대 규모의 실내 빙상장으로 다양한 체육활동을 즐길 수 있는 시설입니다.",
    "post_image_url": "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/19목동아이스링크.jpeg",
    "place_latitude": 126.879261276407,
    "place_longitude": 37.5307334776835
  },
  {
    "place_name": "63스퀘어",
    "post_star_rating": 5.0,
    "post_description": "63빌딩(63스퀘어)은 아시아에서 두 번째로 높은 건물로 18년간 대한민국 최고층 건물이었습니다.",
    "post_image_url": "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/20육삼빌딩.webp",
    "place_latitude": 126.940261584441,
    "place_longitude": 37.5198148915709
  },
  {
    "place_name": "남산타워",
    "post_star_rating": 5.0,
    "post_description": "남산서울타워(N타워)는 서울의 관광명소로 360도 서울 시내를 조망할 수 있는 곳입니다.",
    "post_image_url": "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/21남산서울타워.webp",
    "place_latitude": 126.988230622132,
    "place_longitude": 37.5513049702718
  },
  {
    "place_name": "진관사",
    "post_star_rating": 5.0,
    "post_description": "진관사는 서울 근교의 명찰 사찰로 자연환경과 조선 역사를 감상할 수 있는 곳입니다.",
    "post_image_url": "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/22진관사.jpeg",
    "place_latitude": 126.946885657783,
    "place_longitude": 37.63803747255906
  },
  {
    "place_name": "광화문",
    "post_star_rating": 5.0,
    "post_description": "광화문은 경복궁과 연결되는 궁문으로 국내 관광객과 외국 관광객이 자주 방문하는 곳 중 하나입니다.",
    "post_image_url": "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/23광화문.jpeg",
    "place_latitude": 126.976861018866,
    "place_longitude": 37.5759689663327
  },
  {
    "place_name": "숭례문",
    "post_star_rating": 5.0,
    "post_description": "조선 시대, 한양 도성의 남쪽 성문. 1962년에 국보로 지정되었으며, 문화재청 공식 명칭은 '서울 숭례문'입니다. /n 남대문 시장이 가까이 있어 관광하기에 안성맞춤입니다.",
    "post_image_url": "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/24숭례문.jpeg",
    "place_latitude": 126.975313124237,
    "place_longitude": 37.5600030088843
  },
  {
    "place_name": "용마폭포공원",
    "post_star_rating": 5.0,
    "post_description": "용마폭포는 폐 채석장을 활용해 만든 높이 51m의 인공폭포로 동양에서는 가장 높은 인공폭포입니다./n겨울철에는 국제 규격 인공 암벽 등반장으로 유명합니다.",
    "post_image_url": "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/25용마폭포공원.jpeg",
    "place_latitude": 127.090053515636,
    "place_longitude": 37.5736051123377
  },
 {
    place_name: "달리는커피 거제상동점",
    post_star_rating: 5.0,
    post_description: "달려라 왕바우",
    post_image_url:
      "https://fog-of-war.s3.ap-northeast-2.amazonaws.com/랜드마크/25용마폭포공원.jpeg",
    place_latitude: 128.635266779107,
    place_longitude: 34.8610605916813,
  },
]



const baseUrl = "http://localhost:5000/v1/posts";
//const baseUrl = "https://api.yubinhome.com/v1/posts";
async function fetchData(placeObj) {
  const url = baseUrl;
  const body = JSON.stringify({
    place_name: placeObj.place_name,
    post_star_rating: placeObj.post_star_rating,
    post_description: placeObj.post_description,
    post_image_url: placeObj.post_image_url,
    place_latitude: placeObj.place_latitude,
    place_longitude: placeObj.place_longitude,
  });
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsInVzZXJfZW1haWwiOiJ5c2hpbmI5OEBuYXZlci5jb20iLCJpYXQiOjE2OTgxMDc0MDksImV4cCI6MTY5ODExMTAwOX0.6XJ5fAZbfwo0pEPssdY8mcD3NN40c_fFTYA0ttZxPn0",
    },
    body: body,
  };
  try {
    const response = await fetch(url, options);
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error(`Error fetching data for ${placeObj.place_name}`);
      return null;
    }
  } catch (error) {
    console.error(
      `Error fetching data for ${placeObj.place_name}: ${error.message}`
    );
    return null;
  }
}

async function main() {
  const dataToSave = {};

  for (const placeObj of placesArray) {
    const data = await fetchData(placeObj);
    if (data) {
      dataToSave[placeObj.place_name] = data;
      console.log(`Fetched data for ${placeObj.place_name}`);
    }
  }

  const filename = "send_posts.json";
  fs.writeFileSync(filename, JSON.stringify(dataToSave, null, 4), "utf-8");
  console.log(`All data saved to ${filename}`);
}

main();
