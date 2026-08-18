import { useState, useMemo } from "react";

// 実際の地理データ(GeoJSON)を簡略化して生成した都道府県シルエットです
const QUESTIONS = [
  {
    name: "北海道",
    kana: "ほっかいどう",
    feature: "たんちょうが みられるよ。しつげんに すむ しろくて くびが ながい とりだよ",
    viewBox: "0 0 100 100",
    paths: [
      "M22.3,32.9L22.9,30.1L24.5,30.6L25.9,29.4L36.6,39.1L42.2,42.2L49.2,43.6L50.8,45.3L54.7,45.4L60.1,41.3L57.4,47.2L60.2,48.9L58.7,48.8L60.6,51.9L64.9,51.1L62.0,53.1L58.2,53.4L56.5,55.0L54.7,54.2L54.5,55.5L49.4,54.8L45.9,56.1L40.5,60.7L39.1,65.6L23.4,58.3L16.4,61.9L13.5,59.0L11.1,59.0L9.2,62.3L14.0,63.7L18.3,66.9L16.1,67.8L12.8,66.7L10.8,68.1L10.5,69.8L7.2,70.8L6.2,68.9L7.7,65.1L4.1,62.3L4.6,58.7L8.2,56.6L9.4,57.0L11.6,54.9L9.8,51.4L11.4,51.1L14.3,52.8L16.6,52.4L18.1,53.4L20.7,51.5L19.8,47.5L23.0,45.3L23.0,41.6L24.4,38.3L22.3,32.9Z",
    "M90.4,31.7L94.6,29.0L96.0,29.5L95.5,31.2L90.0,32.5L86.0,35.1L83.6,34.7L79.0,39.0L75.5,40.2L76.4,38.3L78.7,37.8L78.0,36.4L79.3,36.6L82.1,34.7L81.9,33.5L83.5,33.8L85.7,32.4L86.1,30.3L87.4,32.0L90.4,31.7Z",
    "M64.3,44.1L68.1,39.6L72.6,40.1L66.1,43.4L62.7,46.0L62.2,48.2L60.8,46.4L64.3,44.1Z",
    ],
    choices: ["ほっかいどう", "あおもりけん", "いわてけん", "あきたけん"],
  },
  {
    name: "千葉県",
    kana: "ちばけん",
    feature: "ぼうそうはんとうには「きょん」という ちいさな しかの なかまが すんでいるよ",
    viewBox: "0 0 100 100",
    paths: [
      "M9.1,5.0L9.9,4.0L11.0,4.9L17.3,12.8L21.1,14.4L21.5,16.5L31.6,21.2L35.5,21.6L38.0,24.0L47.7,21.6L50.4,22.3L54.2,19.6L61.2,17.6L64.6,19.1L63.4,17.4L65.2,15.1L71.9,19.3L74.4,22.7L80.1,24.4L83.2,28.6L88.8,31.8L92.0,31.5L92.7,33.5L92.3,35.4L89.6,33.8L76.2,35.8L66.3,42.3L60.5,48.3L57.6,53.1L56.1,59.5L56.3,62.6L57.9,64.9L55.5,74.0L53.0,74.5L50.0,78.1L49.0,76.8L47.4,78.3L45.2,78.1L44.0,79.5L41.6,79.9L40.9,78.6L35.5,79.5L32.6,83.5L29.1,84.4L24.8,87.5L22.8,93.6L17.6,96.0L13.7,95.7L11.8,92.7L7.4,90.9L7.4,90.0L14.6,89.5L15.3,88.1L14.8,86.4L11.7,85.3L13.4,85.0L12.5,82.8L14.1,81.7L12.8,80.6L13.9,78.5L12.2,76.5L12.2,74.8L16.2,70.4L14.1,65.9L9.4,64.3L12.4,64.2L13.9,62.8L12.7,62.0L13.8,60.9L15.2,61.5L14.4,59.7L18.3,61.0L17.6,60.1L19.1,60.0L18.4,59.7L20.0,58.7L18.4,57.1L18.9,55.3L22.3,54.6L22.4,53.5L23.5,53.9L22.7,54.4L24.2,54.1L23.6,52.5L24.8,52.1L25.4,53.8L25.3,52.4L26.7,51.7L27.9,52.6L27.0,51.4L28.9,50.5L28.1,50.0L29.7,49.3L29.1,48.9L30.9,46.8L33.5,47.4L32.9,46.2L35.0,46.3L33.1,45.2L35.9,45.0L32.8,44.8L32.4,43.4L34.9,44.6L35.2,42.8L33.0,42.9L33.9,42.2L32.5,41.4L32.6,42.8L27.2,38.1L25.2,38.3L26.4,37.9L25.1,37.6L25.0,35.5L24.9,36.3L22.6,35.8L22.6,37.0L20.9,36.8L22.2,37.2L19.9,38.3L21.6,39.4L18.4,40.3L19.1,40.7L18.4,41.2L16.4,40.6L17.5,36.6L20.0,35.0L17.1,29.9L18.0,28.9L18.5,22.2L12.9,14.0L12.2,9.5L9.1,5.0Z",
    ],
    choices: ["いばらきけん", "ちばけん", "かながわけん", "しずおかけん"],
  },
  {
    name: "和歌山県",
    kana: "わかやまけん",
    feature: "うみべに うみがめが たまごを うみに くることが あるよ",
    viewBox: "0 0 100 100",
    paths: [
      "M49.4,7.4L54.3,5.0L61.2,4.4L63.3,14.2L64.2,15.3L66.7,15.1L68.7,18.7L66.6,21.2L63.5,19.8L60.9,20.2L59.6,21.6L60.6,23.1L58.4,25.9L55.4,26.9L54.0,30.2L51.1,31.8L50.5,34.0L54.4,35.8L56.2,38.2L55.9,40.1L58.4,40.3L59.7,42.1L59.8,46.0L57.9,45.6L57.2,49.6L56.2,50.1L58.4,51.0L58.0,53.6L60.9,53.1L62.2,51.1L64.6,50.5L68.6,50.7L71.3,52.3L76.3,50.2L80.1,51.3L80.9,58.7L84.2,60.3L85.8,63.7L88.7,64.6L89.1,66.7L92.5,67.8L92.0,67.0L93.2,66.6L95.8,67.8L92.3,72.2L92.3,73.8L93.7,73.9L92.7,75.0L92.4,74.2L88.6,75.8L90.1,76.6L90.1,77.9L89.4,77.0L87.6,79.3L88.4,80.4L89.3,79.3L89.5,80.6L91.0,80.2L90.7,81.6L87.3,82.0L84.2,83.9L87.4,83.6L83.0,86.6L75.4,89.4L73.8,92.2L75.3,94.6L74.3,95.3L72.6,94.4L71.9,95.7L70.9,95.3L70.8,94.0L73.2,92.7L71.6,90.8L66.7,91.4L66.0,90.0L62.4,90.2L59.2,88.5L55.4,88.6L55.6,89.5L53.5,87.7L47.7,86.9L45.5,84.5L41.5,84.6L41.6,83.2L36.3,80.6L36.4,75.9L30.3,73.0L31.6,71.8L30.8,70.6L32.7,70.6L33.2,72.3L34.9,71.7L34.4,71.1L36.6,69.8L37.0,68.1L35.4,68.4L34.3,67.1L32.6,67.6L32.6,65.9L30.1,66.1L28.5,63.4L21.1,62.3L21.2,60.6L16.5,58.6L12.4,52.4L9.5,51.5L4.1,52.8L4.2,50.6L6.6,49.8L5.1,47.9L9.6,45.1L8.3,44.5L6.3,45.5L6.8,44.3L5.1,43.5L13.0,40.6L11.9,39.4L15.3,38.2L12.6,36.9L11.6,35.0L6.2,34.2L9.3,31.8L9.7,29.7L12.5,30.5L10.5,28.2L14.8,28.4L18.7,26.6L16.3,27.0L17.1,26.0L16.1,26.0L15.8,23.3L15.6,24.4L14.6,23.3L12.2,23.2L11.7,21.9L13.0,22.0L11.8,19.6L8.2,18.6L10.9,19.4L10.1,17.9L4.5,15.9L5.6,14.6L5.6,12.0L8.5,11.4L7.9,12.8L9.3,15.1L12.8,14.0L13.3,14.9L18.3,13.5L18.5,11.6L20.2,12.3L25.7,10.7L26.8,12.4L27.8,11.2L30.3,10.8L31.1,9.0L36.8,9.4L37.9,8.3L43.4,7.8L45.2,6.3L47.0,8.9L49.4,7.4Z",
    "M86.6,43.9L92.4,42.5L95.4,40.6L94.3,41.2L95.8,44.5L94.7,45.5L92.5,44.5L91.7,48.1L87.8,46.9L86.8,48.7L88.2,49.2L85.2,48.5L84.5,46.2L86.6,43.9Z",
    ],
    choices: ["みえけん", "わかやまけん", "とくしまけん", "ならけん"],
  },
  {
    name: "高知県",
    kana: "こうちけん",
    feature: "とさの おながどりという しっぽが とっても ながい にわとりが ゆうめいだよ",
    viewBox: "0 0 100 100",
    paths: [
      "M56.7,19.3L60.1,18.4L65.6,20.9L70.6,20.5L74.6,23.4L76.1,23.0L77.2,21.0L81.1,21.4L83.0,27.0L82.5,28.9L88.8,29.3L89.3,31.2L87.5,32.2L89.8,35.9L96.0,36.4L90.7,45.0L89.0,53.2L81.5,46.3L81.0,44.0L77.1,42.4L75.8,40.0L64.6,37.2L55.7,39.2L55.5,36.4L54.7,38.3L56.2,39.5L44.0,43.7L46.9,43.9L47.6,42.6L49.8,43.6L43.6,44.8L42.3,47.1L42.6,45.9L40.7,45.7L41.5,45.2L40.7,44.4L41.0,45.3L39.0,46.6L39.3,47.9L37.5,48.8L39.1,49.6L37.9,50.4L39.3,52.4L38.0,55.7L36.4,56.5L37.1,58.1L35.4,57.4L34.2,58.3L30.7,62.5L30.1,65.2L27.1,64.4L25.6,65.6L24.6,69.1L25.5,72.9L22.2,74.2L22.4,76.6L25.0,78.0L26.1,81.5L23.1,81.2L22.4,79.3L23.3,78.6L22.0,79.2L21.5,78.0L18.5,77.9L17.8,79.2L17.4,77.8L14.2,80.2L11.7,79.9L9.3,77.4L4.8,79.3L5.6,78.0L4.6,77.5L6.3,77.3L5.6,76.2L7.2,75.1L6.3,74.4L8.4,72.6L9.8,72.9L9.1,70.5L6.2,70.5L8.2,67.9L6.3,63.3L6.6,60.5L4.8,59.2L4.3,56.6L8.4,58.9L10.9,55.5L12.7,55.2L13.7,51.5L19.5,49.0L14.4,41.4L16.7,40.4L22.6,41.1L25.8,40.3L28.4,36.9L27.5,35.2L29.3,33.3L29.2,30.9L31.3,30.5L35.5,23.3L37.8,23.9L40.0,21.3L42.7,22.1L47.6,20.8L52.0,21.3L54.3,18.7L56.7,19.3Z",
    ],
    choices: ["こうちけん", "えひめけん", "かがわけん", "とくしまけん"],
  },
  {
    name: "鹿児島県",
    kana: "かごしまけん",
    feature: "あまみおおしまには あまみのくろうさぎという めずらしい うさぎが すんでいるよ",
    viewBox: "0 0 100 100",
    paths: [
      "M61.1,4.9L67.6,10.9L66.8,12.3L69.0,13.1L70.4,16.0L72.6,15.9L73.4,17.1L72.5,19.5L71.5,19.2L69.7,20.9L71.5,22.1L70.9,23.3L71.9,23.2L62.5,28.9L62.3,27.4L64.2,25.9L65.3,22.0L63.2,19.4L63.2,17.6L61.1,16.9L62.8,16.1L63.4,17.5L64.6,17.4L65.7,15.5L65.2,14.6L61.8,14.4L59.5,18.8L60.7,22.4L62.6,23.4L61.0,25.6L58.5,23.7L53.5,23.7L53.7,22.5L52.7,22.2L53.4,21.8L51.3,20.5L54.6,20.2L55.9,17.6L55.5,15.5L52.5,12.8L53.7,10.4L52.7,6.5L55.4,6.4L56.4,5.2L58.3,6.3L61.1,4.9Z",
    "M42.0,80.4L42.6,78.6L43.3,80.7L37.2,84.2L38.6,85.0L35.8,85.8L36.6,87.0L34.3,85.5L34.9,84.7L31.7,84.1L34.5,83.9L33.3,83.0L38.3,80.9L39.0,81.5L40.0,79.9L41.5,79.6L40.9,80.8L42.0,80.4Z",
    "M59.7,44.3L57.9,44.1L56.7,41.4L59.2,39.4L62.7,41.4L62.3,42.9L59.7,44.3Z",
    "M68.3,36.1L70.4,32.0L70.4,36.7L68.5,39.2L68.6,41.4L66.7,42.0L66.3,39.5L68.3,36.1Z",
    "M27.1,94.2L26.8,91.6L28.4,91.4L29.4,94.9L27.8,96.0L27.1,94.2Z",
    "M52.4,6.8L51.0,5.0L52.7,4.0L53.4,5.5L52.4,6.8Z",
    ],
    choices: ["ながさきけん", "かごしまけん", "くまもとけん", "みやざきけん"],
  },
  {
    name: "沖縄県",
    kana: "おきなわけん",
    feature: "やんばるの もりに そらを とべない とり「やんばるくいな」が すんでいるよ",
    viewBox: "0 0 100 100",
    paths: [
      "M58.3,36.1L59.6,34.2L59.7,36.6L54.4,39.5L55.5,41.2L54.5,40.7L53.5,42.3L54.4,42.7L52.3,43.8L52.0,42.3L53.5,41.0L52.9,39.4L56.2,37.8L55.0,36.2L56.7,37.2L58.3,36.1Z",
    "M6.6,65.8L4.0,65.2L5.1,65.1L5.5,63.6L7.4,64.5L6.6,65.8Z",
    "M10.2,64.9L9.0,63.5L10.7,63.4L12.2,61.6L10.2,64.9Z",
    "M23.9,60.3L23.2,57.9L25.8,60.2L23.9,60.3Z",
    "M41.0,40.6L41.7,40.0L42.1,41.2L41.0,40.6Z",
    ],
    choices: ["おきなわけん", "かごしまけん", "みやざきけん", "くまもとけん"],
  },
  {
    name: "石川県",
    kana: "いしかわけん",
    feature: "かがしの かたのかもいけには ふゆに たくさんの かもが やってくるよ",
    viewBox: "0 0 100 100",
    paths: [
      "M67.8,8.2L70.1,6.6L79.8,4.0L84.1,5.1L83.7,6.9L85.0,9.1L78.5,10.4L77.4,14.0L79.2,15.1L78.3,16.1L79.2,16.4L77.1,18.8L71.9,18.2L68.6,20.0L66.7,23.8L63.1,26.0L59.0,23.9L60.2,22.7L57.7,22.8L58.1,23.6L56.5,23.8L57.8,25.0L56.6,24.7L54.4,28.4L56.1,28.8L55.7,30.5L53.6,30.8L54.3,32.1L53.5,32.9L58.4,32.1L60.6,34.5L62.7,33.9L64.3,30.8L66.0,30.7L66.0,39.5L61.5,39.6L60.7,41.0L58.1,40.6L55.9,42.2L53.4,47.5L52.8,52.7L49.2,55.2L51.3,58.2L48.8,61.7L49.4,64.5L50.9,65.6L49.5,68.4L49.6,72.3L47.9,73.7L50.3,77.7L48.9,78.8L49.4,81.5L53.1,84.7L49.8,89.4L47.7,90.1L48.5,91.9L47.0,94.8L42.0,96.0L34.3,90.5L30.4,90.3L27.3,91.6L25.3,89.5L21.2,89.4L20.5,85.8L15.0,81.7L18.4,78.2L21.5,77.2L25.8,73.9L35.7,63.4L41.7,56.2L46.9,46.9L47.8,43.6L46.6,41.8L47.8,37.4L46.3,36.7L45.0,34.0L45.3,29.1L41.7,28.1L42.3,24.5L45.8,19.5L45.2,16.9L47.1,14.6L52.5,12.4L57.7,12.7L67.8,8.2Z",
    "M59.1,31.7L56.2,27.9L57.8,28.4L57.7,29.3L58.7,28.3L60.9,28.7L60.3,27.7L62.8,28.9L64.6,26.9L65.8,28.1L64.9,30.1L62.2,30.0L59.1,31.7Z",
    ],
    choices: ["とやまけん", "いしかわけん", "ふくいけん", "にいがたけん"],
  },
  {
    name: "愛知県",
    kana: "あいちけん",
    feature: "いらごみさきには あさぎまだらという ちょうが たびの とちゅうに やってくるよ",
    viewBox: "0 0 100 100",
    paths: [
      "M26.8,17.4L29.4,16.7L28.2,18.3L33.7,21.3L33.7,23.6L35.3,23.7L34.9,25.0L36.4,27.1L38.0,26.3L43.0,27.8L44.6,30.2L47.5,30.0L51.7,27.2L54.2,27.2L57.1,28.6L57.1,29.8L60.1,29.6L60.6,31.2L62.8,31.2L63.8,32.5L70.9,27.8L74.7,27.3L73.0,30.2L75.4,32.7L75.5,34.5L80.7,33.6L81.7,32.1L83.7,31.6L89.8,32.7L91.2,34.1L96.0,33.4L93.2,35.7L95.3,38.0L92.4,39.5L93.0,41.8L91.3,42.3L91.0,44.0L86.5,47.4L85.2,49.9L85.7,52.3L82.1,54.4L80.4,58.6L77.0,60.2L76.2,61.9L69.5,63.3L68.3,65.0L68.8,66.9L67.4,69.6L68.6,73.8L68.1,75.8L41.3,82.4L31.3,83.4L35.8,76.7L38.3,78.3L38.0,79.1L39.3,78.9L41.0,78.1L40.3,77.2L47.6,75.7L49.3,73.3L50.5,74.1L50.6,72.5L52.4,71.3L53.6,71.6L53.6,74.3L52.4,75.4L54.1,75.5L55.6,73.6L54.3,73.7L54.2,71.8L57.6,71.6L55.2,71.2L56.0,67.4L53.4,65.1L49.7,65.4L47.0,64.1L47.5,64.6L46.5,65.7L45.3,65.2L44.9,67.8L43.4,68.6L43.2,66.9L32.1,67.7L29.7,64.6L26.1,64.0L26.4,61.6L28.6,58.5L28.6,53.3L27.0,60.0L25.5,59.5L25.2,61.1L24.2,60.7L24.9,61.6L24.2,61.8L23.2,68.2L27.0,71.0L27.7,74.1L20.9,72.0L17.3,68.7L19.4,63.0L17.1,59.2L16.7,60.0L15.8,59.3L15.8,52.8L18.4,49.9L17.8,49.5L19.7,49.5L18.2,48.8L19.5,45.1L21.8,43.5L19.5,42.8L17.8,47.4L17.2,46.1L18.1,44.0L16.4,43.6L15.6,45.1L16.7,45.0L17.2,47.7L15.1,48.1L15.5,46.1L13.9,46.1L14.2,47.8L12.6,47.5L13.7,48.9L11.8,48.4L10.0,43.6L4.1,39.5L4.5,31.1L11.8,21.0L16.8,22.1L23.7,20.2L26.9,18.6L26.8,17.4Z",
    ],
    choices: ["ぎふけん", "みえけん", "あいちけん", "しずおかけん"],
  },
  {
    name: "福井県",
    kana: "ふくいけん",
    feature: "にほんかいには えちぜんくらげという とっても おおきな くらげが あらわれるよ",
    viewBox: "0 0 100 100",
    paths: [
      "M56.9,18.3L62.7,22.7L63.0,25.7L64.6,27.0L67.9,26.6L71.0,28.9L73.2,27.4L74.4,28.2L77.3,27.7L84.0,31.9L84.8,33.5L90.8,32.3L91.5,33.5L89.4,34.7L89.0,38.3L90.6,38.6L90.8,40.9L93.3,41.5L92.8,43.0L95.3,44.9L95.8,48.1L94.0,48.4L93.1,51.3L88.8,50.8L84.6,52.4L83.6,50.9L78.6,52.8L75.5,52.1L74.3,54.6L72.9,52.9L65.8,51.6L62.5,53.0L62.2,56.8L59.3,60.7L53.0,57.7L50.6,58.1L49.6,60.0L52.4,64.9L51.9,66.9L48.2,65.8L47.6,69.3L46.2,68.6L45.3,69.5L42.4,69.3L41.0,71.8L39.4,72.1L36.6,69.9L33.4,77.7L31.4,78.2L30.9,77.2L28.4,77.0L27.8,78.9L26.7,78.8L25.2,80.8L20.7,81.7L9.3,79.3L9.1,76.5L7.1,76.2L4.7,73.4L5.8,72.0L4.0,69.7L5.0,67.9L6.5,67.4L5.3,69.3L6.3,69.0L6.1,69.8L8.0,69.0L7.4,67.7L8.6,67.9L7.9,71.1L9.7,72.0L12.4,71.7L18.1,68.1L18.6,69.6L15.9,69.8L16.8,70.7L15.8,72.0L12.8,71.9L21.9,72.3L24.9,68.9L21.9,69.9L21.8,68.6L20.0,68.0L21.6,66.7L23.9,66.8L24.5,68.4L25.0,67.5L27.2,69.6L29.6,68.9L27.4,66.5L30.0,67.1L31.1,65.2L29.5,64.4L29.9,63.2L28.3,61.8L30.3,62.2L31.7,64.0L39.3,62.6L39.7,61.9L38.2,60.9L39.0,58.2L37.6,56.6L41.8,53.7L43.5,57.6L42.3,59.3L43.6,60.7L45.6,60.5L47.3,52.8L45.3,49.7L40.3,45.5L40.4,42.3L37.8,39.2L41.4,35.7L42.5,31.6L47.0,27.6L48.1,24.3L49.3,25.2L48.8,21.4L52.1,21.2L56.9,18.3Z",
    ],
    choices: ["ふくいけん", "いしかわけん", "しがけん", "きょうとふ"],
  },
  {
    name: "青森県",
    kana: "あおもりけん",
    feature: "しらかみさんちの もりには くまげらという おおきな きつつきが すんでいるよ",
    viewBox: "0 0 100 100",
    paths: [
      "M50.3,33.4L53.3,23.1L56.9,19.1L57.1,16.5L61.7,19.5L67.2,20.7L71.3,24.5L74.9,26.1L80.3,25.4L85.0,22.4L81.2,35.5L81.0,47.6L82.5,56.5L86.1,66.4L88.5,67.9L90.6,67.1L96.0,71.8L91.1,74.0L90.9,75.7L88.6,77.0L83.9,75.6L79.3,77.8L77.5,75.7L72.4,78.7L68.6,79.4L66.6,80.3L66.8,81.6L61.8,83.5L58.8,81.5L59.6,77.0L61.3,76.7L60.8,73.0L54.5,72.3L55.4,68.7L52.5,69.5L51.6,71.9L48.2,72.3L48.1,73.5L46.4,72.9L43.7,74.2L40.8,72.5L39.1,73.3L39.7,74.4L38.4,74.2L37.7,72.8L33.3,71.8L33.1,70.4L30.6,69.9L28.0,72.4L16.5,72.5L14.5,70.9L12.1,71.9L12.0,73.3L7.8,72.9L8.1,66.8L6.9,65.0L4.6,65.1L4.0,63.6L7.4,62.1L11.0,56.9L13.7,55.7L17.2,57.1L23.7,54.1L26.3,48.3L27.4,41.8L27.2,39.4L23.6,37.3L27.2,36.7L28.2,30.9L34.5,34.9L38.8,32.5L42.9,34.4L44.4,46.7L45.7,50.7L48.0,52.6L51.2,52.3L54.4,49.7L55.0,46.8L53.4,46.4L54.5,46.2L55.5,43.6L58.9,44.4L60.7,46.1L60.2,47.4L64.8,48.4L66.8,50.5L69.8,49.6L72.7,45.5L74.0,38.8L75.6,36.3L72.8,31.3L69.8,29.9L68.8,32.2L64.4,34.8L60.6,34.0L52.0,37.6L49.7,36.7L50.3,33.4Z",
    ],
    choices: ["あおもりけん", "あきたけん", "いわてけん", "ほっかいどう"],
  },
  {
    name: "静岡県",
    kana: "しずおかけん",
    feature: "いずの うみでは いるかを みる ふねに のることが できるよ",
    viewBox: "0 0 100 100",
    paths: [
      "M44.9,21.2L47.6,28.3L46.3,31.6L47.0,34.2L45.7,35.9L46.6,38.4L48.6,39.9L50.9,38.6L52.6,39.2L54.8,45.6L57.1,46.8L59.9,47.4L62.2,45.5L61.1,39.3L62.3,38.4L62.2,34.0L64.9,32.1L66.4,35.0L69.4,34.7L70.3,36.9L88.0,34.7L88.9,38.5L86.5,43.7L89.4,48.3L94.0,48.8L91.6,53.5L93.3,54.1L92.5,56.4L93.1,58.0L95.9,59.0L96.0,60.1L95.6,62.6L92.4,64.7L90.5,69.4L87.7,70.8L86.4,73.6L87.2,75.4L85.5,75.6L85.9,74.6L85.0,74.6L79.3,78.5L75.7,76.4L76.2,74.8L73.5,73.7L73.5,71.7L75.5,70.3L74.2,66.6L75.5,64.5L74.5,63.0L76.3,61.7L74.8,58.7L75.8,55.7L81.8,55.7L82.7,54.0L78.4,50.7L70.5,48.6L71.3,49.2L63.5,51.0L62.2,53.6L60.0,54.9L60.5,57.4L60.6,55.8L62.2,55.9L61.2,57.5L52.5,61.3L50.7,63.8L51.5,65.8L48.8,68.6L49.4,69.2L45.4,71.6L43.7,74.8L43.6,76.5L45.3,78.9L36.4,75.4L27.5,74.9L21.8,76.2L18.8,74.9L4.5,74.6L4.7,67.0L13.1,62.5L14.3,59.6L16.8,58.1L17.3,54.7L21.9,50.8L21.5,49.2L23.4,48.2L22.0,46.5L23.4,45.0L25.8,44.6L26.4,43.0L29.1,41.5L33.9,40.1L36.0,37.7L37.7,38.0L40.7,36.2L41.2,34.7L39.4,32.0L41.7,30.8L41.9,29.5L40.6,29.1L40.5,27.9L41.6,26.6L40.7,26.1L41.8,24.6L43.3,24.8L44.9,21.2Z",
    ],
    choices: ["しずおかけん", "かながわけん", "やまなしけん", "あいちけん"],
  },
  {
    name: "京都府",
    kana: "きょうとふ",
    feature: "かもがわには おおさんしょううおという おおきな さんしょううおが すんでいるよ",
    viewBox: "0 0 100 100",
    paths: [
      "M18.0,27.4L9.5,29.3L8.6,26.8L4.0,23.5L5.4,21.1L5.0,18.2L6.2,19.0L10.2,18.7L14.0,15.5L16.9,15.8L19.8,14.3L21.7,11.9L30.8,10.1L32.3,8.9L36.1,11.7L37.1,14.6L38.8,15.4L38.4,17.8L37.2,16.8L35.7,17.5L33.9,21.0L29.9,24.8L30.0,27.3L31.1,27.0L30.8,25.8L32.6,23.7L34.7,22.7L34.4,24.9L36.1,25.6L33.9,25.6L33.9,27.5L37.2,29.1L40.5,29.0L39.4,34.0L41.7,32.2L41.7,30.7L45.6,31.9L45.5,29.1L41.6,30.0L41.4,26.3L41.9,27.0L47.8,25.2L48.4,23.3L50.6,22.4L49.8,25.1L52.4,25.8L50.4,26.7L49.6,28.5L51.5,29.9L50.3,32.8L53.1,36.0L55.4,36.4L55.7,39.5L64.3,40.5L68.8,42.3L74.0,41.3L73.7,42.2L77.1,44.4L78.8,47.4L80.9,46.4L78.7,51.7L80.7,56.4L79.2,64.1L77.6,65.0L79.0,66.9L78.0,67.6L79.1,68.3L78.5,69.3L80.2,69.3L82.4,72.6L81.5,76.8L84.0,78.4L87.2,76.8L87.6,79.9L89.5,81.0L92.2,80.6L92.1,81.7L93.9,82.4L92.6,83.8L94.3,85.5L94.0,87.2L96.0,88.6L94.0,91.1L90.7,90.4L89.9,88.4L86.1,88.5L86.1,87.2L83.3,90.9L73.0,89.5L71.0,85.6L72.2,83.6L68.4,80.2L66.9,76.3L63.5,73.5L61.1,74.1L62.1,70.8L59.1,70.8L59.5,72.0L57.8,73.3L59.6,73.4L59.7,74.4L56.7,75.1L54.5,72.9L52.0,72.5L52.5,69.2L44.4,67.8L43.4,64.5L46.0,61.7L44.9,61.1L45.0,58.7L41.5,58.2L41.3,57.1L36.8,57.5L37.4,55.6L36.1,55.0L33.0,55.0L31.0,56.3L29.5,55.4L30.2,53.0L27.1,51.3L27.9,50.2L27.3,48.7L23.5,48.2L20.3,50.4L19.5,48.4L15.9,47.9L15.1,46.3L9.5,44.7L8.9,40.7L10.1,37.4L12.0,37.2L14.4,39.0L18.9,37.4L18.0,27.4Z",
    ],
    choices: ["きょうとふ", "ひょうごけん", "しがけん", "ならけん"],
  },
];


function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const FONT =
  "'Hiragino Maru Gothic ProN', 'Yu Gothic', 'Rounded Mplus 1c', 'Hiragino Sans', sans-serif";

const CANDY = ["#ff8fab", "#ffd166", "#06d6a0", "#4cc9f0"];

const FLOATERS = ["⭐️", "🌈", "🎈", "✨", "🍭", "🦄"];

export default function SilhouetteQuiz() {
  const [screen, setScreen] = useState("home"); // "home" | "difficulty" | "quiz"
  const [difficulty, setDifficulty] = useState("normal"); // "normal" | "hard"
  const [order, setOrder] = useState([]);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState(null); // null | "correct" | "wrong"

  const q = order.length ? QUESTIONS[order[step]] : null;
  const choices = useMemo(() => (q ? shuffle(q.choices) : []), [q]);

  function startQuiz(level) {
    setDifficulty(level);
    setOrder(shuffle([...Array(QUESTIONS.length).keys()]));
    setStep(0);
    setSelected(null);
    setRevealed(false);
    setScore(0);
    setDone(false);
    setFeedback(null);
    setScreen("quiz");
  }

  function pick(choice) {
    if (revealed) return;
    const isCorrect = choice === q.kana;
    setSelected(choice);
    setRevealed(true);
    if (isCorrect) setScore((s) => s + 1);
    setFeedback(isCorrect ? "correct" : "wrong");
  }

  function advance() {
    setFeedback(null);
    if (step + 1 >= order.length) {
      setDone(true);
      return;
    }
    setStep((s) => s + 1);
    setSelected(null);
    setRevealed(false);
  }

  function restart() {
    startQuiz(difficulty);
  }

  function goHome() {
    setScreen("home");
    setDone(false);
  }

  const shellStyle = {
    minHeight: "100vh",
    width: "100%",
    background:
      "linear-gradient(160deg, #fff4fb 0%, #eaf6ff 45%, #fff9e6 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: FONT,
    padding: "24px",
    boxSizing: "border-box",
    position: "relative",
    overflow: "hidden",
  };

  const sharedStyleTag = (
    <style>{`
      * { -webkit-tap-highlight-color: transparent; }
      @keyframes riseIn {
        from { opacity: 0; transform: translateY(14px) scale(0.94); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes bounceIn {
        0% { opacity: 0; transform: scale(0.5); }
        60% { opacity: 1; transform: scale(1.12); }
        80% { transform: scale(0.96); }
        100% { transform: scale(1); }
      }
      @keyframes floaty {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-14px) rotate(8deg); }
      }
      @keyframes wiggle {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(-3deg); }
        75% { transform: rotate(3deg); }
      }
      @keyframes popText {
        0% { opacity: 0; transform: scale(0.3) rotate(-6deg); }
        60% { opacity: 1; transform: scale(1.15) rotate(2deg); }
        100% { opacity: 1; transform: scale(1) rotate(0deg); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .bounce-btn:active { transform: scale(0.94); }
      .bounce-btn { transition: transform 0.12s ease; }
      .float-deco { animation: floaty 4s ease-in-out infinite; }
      @media (prefers-reduced-motion: reduce) {
        .float-deco, svg[aria-label="とどうふけんのかげ"] { animation: none !important; }
      }
    `}</style>
  );

  function Floaters({ count = 6 }) {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="float-deco"
            style={{
              position: "absolute",
              fontSize: 22 + (i % 3) * 8,
              top: `${(i * 37) % 90}%`,
              left: `${(i * 61) % 90}%`,
              opacity: 0.55,
              animationDelay: `${i * 0.4}s`,
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            {FLOATERS[i % FLOATERS.length]}
          </div>
        ))}
      </>
    );
  }

  // ---------- ホームがめん ----------
  if (screen === "home") {
    return (
      <div style={shellStyle}>
        {sharedStyleTag}
        <Floaters count={7} />
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            textAlign: "center",
            background: "#ffffff",
            borderRadius: 32,
            padding: "44px 28px",
            boxShadow: "0 16px 0 #ffd6e6, 0 20px 40px rgba(120,90,160,0.18)",
            border: "4px solid #ffe1ee",
            position: "relative",
            zIndex: 1,
            animation: "bounceIn 0.5s ease",
          }}
        >
          <div
            style={{
              color: "#ff8fab",
              letterSpacing: "0.3em",
              fontSize: 13,
              fontWeight: 800,
              marginBottom: 10,
            }}
          >
            けんけんちず
          </div>
          <div
            style={{
              color: "#4a3f6b",
              fontSize: 32,
              fontWeight: 800,
              marginBottom: 10,
              lineHeight: 1.3,
            }}
          >
            どこの けんかな？
          </div>
          <div style={{ fontSize: 40, marginBottom: 14 }}>🗾✨🔍</div>
          <div
            style={{
              color: "#8b7fae",
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 32,
            }}
          >
            かげを みて あててみよう！
          </div>
          <button
            className="bounce-btn"
            onClick={() => setScreen("difficulty")}
            style={{
              background: "#ff8fab",
              border: "none",
              color: "#ffffff",
              padding: "18px 52px",
              borderRadius: 999,
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: "0.1em",
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 6px 0 #e8688e",
            }}
          >
            はじめる！
          </button>
        </div>
      </div>
    );
  }

  // ---------- なんいど えらび がめん ----------
  if (screen === "difficulty") {
    return (
      <div style={shellStyle}>
        {sharedStyleTag}
        <Floaters count={6} />
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            textAlign: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              color: "#4a3f6b",
              fontSize: 22,
              fontWeight: 800,
              marginBottom: 24,
              animation: "riseIn 0.4s ease",
            }}
          >
            なんいどを えらんでね
          </div>

          <button
            className="bounce-btn"
            onClick={() => startQuiz("normal")}
            style={{
              display: "block",
              width: "100%",
              background: "#06d6a0",
              border: "none",
              color: "#ffffff",
              padding: "22px 20px",
              borderRadius: 24,
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "0.1em",
              cursor: "pointer",
              fontFamily: "inherit",
              marginBottom: 18,
              boxShadow: "0 6px 0 #04a37e",
            }}
          >
            🙂 ふつう
            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 6, opacity: 0.9 }}>
              そのままの かたちで だすよ
            </div>
          </button>

          <button
            className="bounce-btn"
            onClick={() => startQuiz("hard")}
            style={{
              display: "block",
              width: "100%",
              background: "#ff8fab",
              border: "none",
              color: "#ffffff",
              padding: "22px 20px",
              borderRadius: 24,
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "0.1em",
              cursor: "pointer",
              fontFamily: "inherit",
              marginBottom: 26,
              boxShadow: "0 6px 0 #e8688e",
            }}
          >
            🌀 むずかしい
            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 6, opacity: 0.9 }}>
              かげが くるくる まわるよ
            </div>
          </button>

          <button
            onClick={goHome}
            className="bounce-btn"
            style={{
              background: "transparent",
              border: "none",
              color: "#8b7fae",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              textDecoration: "underline",
            }}
          >
            ホームに もどる
          </button>
        </div>
      </div>
    );
  }

  // ---------- けっか がめん ----------
  if (done) {
    return (
      <div style={shellStyle}>
        {sharedStyleTag}
        <Floaters count={6} />
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            textAlign: "center",
            background: "#ffffff",
            borderRadius: 32,
            padding: "40px 24px",
            boxShadow: "0 16px 0 #ffe1ee, 0 20px 40px rgba(120,90,160,0.18)",
            border: "4px solid #ffe1ee",
            position: "relative",
            zIndex: 1,
            animation: "bounceIn 0.5s ease",
          }}
        >
          <div
            style={{
              color: "#ff8fab",
              letterSpacing: "0.2em",
              fontSize: 12,
              fontWeight: 800,
              marginBottom: 10,
            }}
          >
            {difficulty === "hard" ? "🌀 むずかしい" : "🙂 ふつう"}
          </div>
          <div style={{ fontSize: 52, marginBottom: 10 }}>
            {score === order.length ? "🏆" : score >= order.length * 0.6 ? "🎉" : "💪"}
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#4a3f6b", marginBottom: 10 }}>
            {score} / {order.length} もん せいかい！
          </div>
          <div style={{ fontSize: 15, color: "#8b7fae", fontWeight: 700, marginBottom: 30 }}>
            {score === order.length
              ? "ぜんもん せいかい！すごいね！"
              : score >= order.length * 0.6
              ? "よくできたね！"
              : "つぎは がんばろう！"}
          </div>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={restart}
              className="bounce-btn"
              style={{
                background: "#ffd166",
                border: "none",
                color: "#4a3f6b",
                padding: "14px 30px",
                borderRadius: 999,
                fontSize: 16,
                fontWeight: 800,
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 5px 0 #e3ab2e",
              }}
            >
              もういちど
            </button>
            <button
              onClick={() => setScreen("difficulty")}
              className="bounce-btn"
              style={{
                background: "#4cc9f0",
                border: "none",
                color: "#ffffff",
                padding: "14px 30px",
                borderRadius: 999,
                fontSize: 16,
                fontWeight: 800,
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 5px 0 #2f9bc4",
              }}
            >
              なんいどを えらぶ
            </button>
          </div>
          <button
            onClick={goHome}
            className="bounce-btn"
            style={{
              display: "block",
              margin: "18px auto 0",
              background: "transparent",
              border: "none",
              color: "#8b7fae",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              textDecoration: "underline",
            }}
          >
            ホームに もどる
          </button>
        </div>
      </div>
    );
  }

  // ---------- クイズ がめん ----------
  return (
    <div style={shellStyle}>
      {sharedStyleTag}

      {feedback && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background:
              feedback === "correct"
                ? "rgba(6,214,160,0.85)"
                : "rgba(255,143,171,0.9)",
            animation: "fadeIn 0.15s ease",
            padding: "24px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              fontSize: 110,
              animation: "popText 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
              lineHeight: 1,
            }}
          >
            {feedback === "correct" ? "⭕️" : "❌"}
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 800,
              color: "#ffffff",
              marginTop: 12,
              animation: "popText 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
              textShadow: "0 3px 0 rgba(0,0,0,0.15)",
            }}
          >
            {feedback === "correct" ? "せいかい！" : "ざんねん！"}
          </div>

          {feedback === "correct" && q && (
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#ffffff",
                marginTop: 16,
                maxWidth: 320,
                textAlign: "center",
                lineHeight: 1.7,
                background: "rgba(0,0,0,0.18)",
                borderRadius: 16,
                padding: "12px 18px",
                animation: "riseIn 0.4s ease 0.15s both",
              }}
            >
              🐾 であえる いきもの
              <br />
              {q.feature}
            </div>
          )}
          <button
            className="bounce-btn"
            onClick={advance}
            style={{
              marginTop: 26,
              background: "#ffffff",
              border: "none",
              color: feedback === "correct" ? "#06a37e" : "#e8688e",
              padding: "14px 52px",
              borderRadius: 999,
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: "0.1em",
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 5px 0 rgba(0,0,0,0.15)",
              animation: "riseIn 0.4s ease 0.25s both",
            }}
          >
            OK
          </button>
        </div>
      )}

      <div style={{ width: "100%", maxWidth: 480, position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <button
            onClick={goHome}
            className="bounce-btn"
            style={{
              background: "#ffffff",
              border: "none",
              color: "#8b7fae",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "inherit",
              padding: "8px 16px",
              borderRadius: 999,
              boxShadow: "0 3px 0 #e3ddf2",
            }}
          >
            ← ホーム
          </button>
          <div
            style={{
              color: "#ffffff",
              background: difficulty === "hard" ? "#ff8fab" : "#06d6a0",
              letterSpacing: "0.1em",
              fontSize: 12,
              fontWeight: 800,
              padding: "8px 16px",
              borderRadius: 999,
            }}
          >
            {difficulty === "hard" ? "🌀 むずかしい" : "🙂 ふつう"}
          </div>
        </div>

        {/* ぶたい */}
        <div
          style={{
            position: "relative",
            background: "#ffffff",
            borderRadius: 28,
            padding: 10,
            border: "5px dashed #ffd166",
            boxShadow: "0 10px 0 #ffe9b3, 0 16px 32px rgba(120,90,160,0.15)",
          }}
        >
          <div
            style={{
              position: "relative",
              background:
                "radial-gradient(ellipse at 50% 45%, #fffdf5 0%, #fff3d6 100%)",
              borderRadius: 20,
              minHeight: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 10,
                left: 14,
                fontSize: 22,
                opacity: 0.7,
              }}
            >
              ⭐️
            </div>
            <div
              style={{
                position: "absolute",
                bottom: 10,
                right: 14,
                fontSize: 22,
                opacity: 0.7,
              }}
            >
              🌈
            </div>
            <svg
              key={step}
              viewBox={q.viewBox}
              width={difficulty === "hard" ? 165 : 200}
              height={difficulty === "hard" ? 165 : 200}
              style={{
                position: "relative",
                animation:
                  difficulty === "hard"
                    ? "riseIn 0.5s ease, spin 3.2s linear infinite"
                    : "riseIn 0.5s ease",
              }}
              aria-label="とどうふけんのかげ"
            >
              {q.paths.map((d, i) => (
                <path key={i} d={d} fill="#4a3f6b" />
              ))}
            </svg>
          </div>
        </div>

        {/* もんだいすう + せいかいすう */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 14,
            color: "#8b7fae",
            fontWeight: 800,
            margin: "14px 4px 18px",
          }}
        >
          <span>もんだい {step + 1} / {order.length}</span>
          <span>⭐️ せいかい {score}こ</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          {choices.map((c, i) => {
            const isAnswer = c === q.kana;
            const isPicked = c === selected;
            let bg = CANDY[i % CANDY.length];
            let shadow = "0 5px 0 rgba(0,0,0,0.15)";
            let label = c;
            let opacity = 1;
            if (revealed && isAnswer) {
              bg = "#06d6a0";
              shadow = "0 5px 0 #04a37e";
              label = `✅ ${c}`;
            } else if (revealed && isPicked && !isAnswer) {
              bg = "#ff8fab";
              shadow = "0 5px 0 #e8688e";
              label = `❌ ${c}`;
            } else if (revealed) {
              opacity = 0.45;
            }
            return (
              <button
                key={c}
                className="bounce-btn"
                onClick={() => pick(c)}
                disabled={revealed}
                style={{
                  background: bg,
                  opacity,
                  border: "none",
                  color: "#ffffff",
                  padding: "16px 10px",
                  borderRadius: 18,
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: revealed ? "default" : "pointer",
                  fontFamily: "inherit",
                  boxShadow: shadow,
                  transition: "opacity 0.2s ease",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div style={{ minHeight: 20, marginTop: 16 }} />
      </div>
    </div>
  );
}
